const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function extractPnr(text) {
  const match = text.toUpperCase().match(/\b[A-Z0-9]{6}\b/);
  return match ? match[0] : null;
}

async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  const message = typeof request.body?.message === "string"
    ? request.body.message.trim()
    : "";
  if (!message || message.length > 2000) {
    return response.status(400).json({ error: "Message must be between 1 and 2000 characters" });
  }

  const prompt = [
    "You are AeroBot, the helpful airport lost-and-found assistant for AeroFind.",
    "Answer clearly and briefly in the same language as the user.",
    "Help with lost baggage, PNR tracking, airport procedures, and AeroFind features.",
    "Never claim to access real airline systems or confirm a bag is found unless AeroFind's own search result says so.",
    "Do not request passwords, payment details, passport numbers, or other sensitive information.",
    `User message: ${message}`
  ].join("\n");

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
        })
      }
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data);
      return response.status(502).json({ error: "Gemini API request failed" });
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();
    if (!reply) {
      return response.status(502).json({ error: "Gemini returned an empty response" });
    }

    return response.status(200).json({ reply, pnr: extractPnr(message) });
  } catch (error) {
    console.error("Gemini proxy error:", error);
    return response.status(502).json({ error: "Unable to reach Gemini API" });
  }
}

module.exports = handler;

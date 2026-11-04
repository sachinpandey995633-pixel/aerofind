# AeroFind

## Gemini AI setup

The chatbot uses the serverless endpoint in `api/gemini.js`, so the Gemini key is
never exposed in the browser.

1. Create a Gemini API key in Google AI Studio.
2. Add `GEMINI_API_KEY` as a deployment secret/environment variable.
3. Optionally set `GEMINI_MODEL` (defaults to `gemini-2.5-flash`).
4. Import this repository into Vercel and deploy it.
5. In Vercel, open **Settings → Environment Variables** and add
   `GEMINI_API_KEY` for the Production environment.
6. Point `aerofind.me` to the Vercel project under **Settings → Domains**.

Do not put the API key in `index.html` or commit it to Git.

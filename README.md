# Mirabilium — Observe & Uncover

A bilingual, responsive landing page for Jinan's Malayalam YouTube channel, built by Alwin Susy Jayan. No channel login is required. The supplied channel banner is bundled locally. Public stats and the six latest uploads come from the YouTube Data API; public reviews are stored in your own Supabase project.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The page works visually without credentials. `/api/channel` and public reviews require the setup below. Vite's local dev server does **not** run Vercel functions; use `npx vercel dev` to test the live YouTube endpoint locally, or deploy to Vercel.

## YouTube data setup

1. In a Google Cloud project you own, enable **YouTube Data API v3** and create an API key. Jinan does not need to authorize your project. Restrict the key to the YouTube Data API; protect it as a server-only variable.
2. Set `YOUTUBE_API_KEY` in Vercel (Project → Settings → Environment Variables). Do **not** prefix this key with `VITE_`.
3. The serverless endpoint looks up `@MirabiliumOfficial`, requests channel statistics and its uploads playlist, and caches responses for approximately 10 minutes. It displays `—` if data is unavailable; it never presents an old screenshot figure as live data. YouTube's API rounds subscriber counts at larger sizes, so this is a refreshed public count, not a second-by-second exact counter.

## Public reviews setup

1. Create a free Supabase project. In its SQL Editor run `supabase/schema.sql`.
2. Copy the project's URL and **publishable/anon** key (never a service-role or secret key) to Vercel environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Redeploy so Vite includes them in the build.
3. Everyone can read and submit reviews; only you, through the Supabase dashboard, can remove inappropriate reviews. Anonymous public submissions can attract spam. Add CAPTCHA and rate limiting before promoting the review form at scale.

## Deploy to Vercel

1. Put this folder in its own GitHub repository. In Vercel choose **Add New → Project** and import that repository.
2. Framework preset **Vite**; root directory `.`; build command `npm run build`; output directory `dist`. Add all three environment variables above.
3. Deploy and open the public `*.vercel.app` URL. Confirm subscriber data, recent video links, posting a review, and the Malayalam toggle. Future Git pushes redeploy automatically.

Do not upload your entire Downloads folder or `node_modules`. Vercel's free Hobby plan is suitable for a personal, non-commercial portfolio, subject to its current usage terms and limits. This site needs Vercel's serverless endpoint; a static-only host would require replacing it with a separate API service.

## Notes

- Video titles are supplied by YouTube and are not machine-translated; interface text has an authored Malayalam translation.
- Reviews use database row-level security, escaped text rendering, length limits, and a simple bot honeypot. This does not fully prevent abuse.
- If you change the YouTube handle, edit `CHANNEL_HANDLE` in `api/channel.js` and `CHANNEL` in `src.js`.

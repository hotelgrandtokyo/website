# Hotel Grand Tokyo Website

Official website for Hotel Grand Tokyo in Sundhara, Kathmandu.

The site is a static single-page hotel website powered by Google Sheets content through a Google Apps Script endpoint. It is designed to feel like a clean, trustworthy budget hotel booking site: fast, photo-led, mobile-friendly, and focused on direct booking.

## Current Website Pattern

- Official `www` domain as canonical: `https://www.hotelgrandtokyo.com.np/`
- Clean hotel homepage with direct booking, WhatsApp, phone, room cards, services, reviews, and visible location
- Lightweight JavaScript with Google Sheet-driven rooms, offers, services, gallery, testimonials, and settings
- SEO metadata, Hotel schema, FAQ schema, sitemap, robots file, and social sharing tags
- Basic browser security headers and safer cache rules for unversioned CSS/JS

## Main Files

- `index.html` - static shell, SEO tags, booking modal, header, footer
- `main.js` - Google Sheet fetch, routing, rendering, forms, validation
- `style.css` - modern hotel design layer and responsive layout
- `robots.txt` - crawler access and sitemap link
- `sitemap.xml` - canonical URLs
- `_headers` - Cloudflare Pages-style cache/security headers
- `_redirects` - root-to-www and SPA fallback redirects
- `vercel.json` - Vercel-compatible cache/security headers and SPA fallback
- `SECURITY-CHECKLIST.md` - Google Sheet and Apps Script hardening notes
- `managed/` - backend and security files that support the site but are not normal page assets
- `managed/google-apps-script/Code.gs` - paste/deploy this in the Google Sheet Apps Script project

## Google Sheet Security

Anything inside browser code is public. The `PUBLIC_READ_TOKEN` in `main.js` should only be treated as a public read token, not a real secret.

Real protection must happen in Google Apps Script:

- Keep the Sheet private and restrict editor access.
- Return only approved public website fields on `GET`.
- Never return Sheet IDs, admin emails, internal notes, or private guest data.
- Set admin notification email inside Apps Script, not from browser-submitted data.
- Validate and sanitize all booking/contact form submissions server-side.
- Add rate limiting, honeypot checks, and optional Turnstile/reCAPTCHA if spam increases.

## Deployment Notes

After deployment, confirm:

- `https://www.hotelgrandtokyo.com.np/` loads directly.
- `https://hotelgrandtokyo.com.np/` redirects to `https://www.hotelgrandtokyo.com.np/`.
- `robots.txt`, `sitemap.xml`, canonical tags, Open Graph URLs, and schema all use `www`.
- Room photos are compressed before upload.

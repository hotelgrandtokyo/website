# Hotel Grand Tokyo Website Security Checklist

## Google Sheet and Apps Script

- Keep the Google Sheet private. Only owner/admin accounts should have edit access.
- Never publish Sheet edit links on the website.
- Treat any token in `main.js` as public. Browser code cannot store secrets.
- Apps Script should expose only approved public website fields on `GET`.
- Apps Script should never return private columns such as internal notes, admin emails, payment data, or Sheet IDs.
- Apps Script should set admin email internally. Do not trust `adminEmail` from the browser.
- Validate and sanitize all `POST` booking/contact fields in Apps Script before saving to Sheet.
- Add server-side rate limiting by IP/time window where possible.
- Google Apps Script web apps do not reliably expose visitor IP addresses to `doPost`; use phone/email/signature limits there, and put Cloudflare Turnstile, reCAPTCHA, or an edge proxy in front if real IP limiting is required.
- Add a honeypot field check and reject submissions that fill it.
- Reject very long messages and suspicious HTML/script content.
- Consider using reCAPTCHA or Cloudflare Turnstile for public forms if spam increases.

## Website

- Canonical domain should stay `https://www.hotelgrandtokyo.com.np/`.
- Keep `robots.txt`, `sitemap.xml`, schema URLs, and Open Graph URLs on the `www` domain.
- Keep form payloads minimal. The public site should send guest request data only.
- Do not add private credentials to `index.html`, `main.js`, or any other public file.
- Compress large images before deployment, especially `logo.png`.

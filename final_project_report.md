# Hotel Grand Tokyo Website Modernization Report

**Updated:** July 28, 2026  
**Canonical Domain:** https://www.hotelgrandtokyo.com.np/

## What Changed

The website has been shifted from an experimental dark luxury style to a modern budget hotel booking pattern.

The new direction is:

- Clear official hotel identity
- Clean, warm, trustworthy visual design
- Direct booking, WhatsApp, and call actions above the fold
- Room-first presentation with prices and amenities
- Visible location and trust signals
- Mobile-friendly layout for Google Maps, WhatsApp, and search visitors

## UX Improvements

- Modernized hero section with practical hotel messaging.
- Added quick booking strip for fast room inquiries.
- Kept Book Now visible on mobile.
- Reduced heavy visual effects and removed 3D tilt dependency.
- Reworked room cards to show price, amenities, photos, and direct booking action.
- Replaced luxury wording such as sanctuary/concierge with plain hotel language.
- Calmed the WhatsApp floating button.
- Removed fake Twitter action from footer.

## SEO Improvements

- Updated canonical, Open Graph, Twitter, schema, robots, and sitemap URLs to the `www` domain.
- Improved homepage title and description for local hotel search.
- Kept Hotel and FAQ structured data.
- Added redirects so non-www points to www.
- Reduced long-term cache on CSS/JS so design updates reach visitors faster.

## Security Improvements

- Added a CMS sanitizing layer so Google Sheet text is not treated as executable HTML.
- Sanitized image/url fields from Sheet-driven content.
- Removed browser-controlled `adminEmail` from booking submissions.
- Added basic security headers: `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Added `SECURITY-CHECKLIST.md` for Apps Script and Google Sheet hardening.

## Still Recommended

- Compress `logo.png`; it is too large for a logo.
- Use real room, bathroom, entrance, and food photos.
- Add Google Business Profile review/rating links if available.
- Harden the Apps Script server-side validation and rate limiting.
- Consider Cloudflare Turnstile if booking/contact spam appears.

# Hotel Grand Tokyo - Web Platform

A premium, high-performance Single Page Application (SPA) designed for **Hotel Grand Tokyo**, the best budget luxury sanctuary in Sundhara, Kathmandu, Nepal.

## 🚀 How It Was Made

This website was engineered for speed, aesthetics, and ease of management.

- **Architecture**: Single Page Application (SPA) built with **Vanilla JavaScript**.
- **Data-Driven**: Content is decoupled from the code. It fetches real-time data (rooms, services, testimonials) from a **Google Sheets backend** via a custom **Google Apps Script API**.
- **Performance**: Implements a **Stale-While-Revalidate** caching strategy using `localStorage`. The site loads instantly from cache while fetching fresh updates in the background.
- **Design System**: 
    - **Zenith Obsidian** theme: A curated dark mode with "Brushed Gold" accents.
    - **Glassmorphism**: High-blur surfaces and 3D floating elements.
    - **Interactions**: Powered by **VanillaTilt.js** for 3D card effects and custom CSS cubic-bezier animations.
- **SEO & SEM**: Fully optimized with:
    - **Semantic HTML5**.
    - **JSON-LD Schema** (Hotel & FAQ schemas) for rich search results.
    - **Open Graph & Twitter Cards** for premium social sharing.
    - **Noscript Fallback**: A static version of the site content for crawlers and JS-disabled environments.

## ✨ Features

- **Dynamic Content Management**: Update rooms, prices, and offers in Google Sheets, and the website updates automatically.
- **Integrated Booking Flow**: A multi-step reservation inquiry system that notifies the hotel management instantly.
- **Premium Aesthetics**: Smooth transitions, skeleton loaders, and micro-animations that provide a "Luxury" feel.
- **Interactive FAQ**: Dynamic accordion-style FAQ section for better user engagement.
- **Traveler's Handbook**: A dedicated SEO-rich guide for tourists visiting Kathmandu.
- **Responsive Mastery**: Tailored experiences for Mobile, Tablet, and Desktop users.

## ⚠️ Limitations

- **Backend Dependency**: The booking and contact forms rely on the Google Apps Script endpoint. If the script is paused or the Google account hits its daily quota, form submissions may fail temporarily.
- **JavaScript Required**: While a `noscript` fallback exists for SEO, the interactive features and dynamic content require JavaScript to be enabled.
- **Image Hosting**: Dynamic images are hosted externally. If the external hosting provider is down, some room or blog images might not display.

## 🛡️ Security & Best Practices

- **Spam Protection**: All forms include a hidden "honeypot" field and client-side rate limiting (1-minute cooldown) to prevent automated bot submissions.
- **XSS Safety**: User-facing status messages are rendered using `textContent` to prevent script injection.
- **Backend Security**: The `API_KEY` in `main.js` is a shared secret between the website and your Google Apps Script. While visible in the source code, it ensures that random bots cannot easily hit your script without knowing the key.
- **Data Protection**: Since the website pulls data from Google Sheets, the security of your site's content depends on the **privacy settings of your Google Sheet**. Ensure that only authorized accounts have "Editor" access to the sheet.

## ⏳ Sustainability & Run Duration

- **Hosting**: Being a static frontend, it can be hosted on platforms like GitHub Pages, Vercel, or Netlify **indefinitely at zero cost**.
- **Scalability**: The Google Sheets backend can handle thousands of inquiries per month. Google Apps Script's free tier allows for approximately 50–100 emails per day, which is well-suited for a boutique hotel's inquiry volume.
- **Maintenance**: Minimal. The code is modular and uses standard web technologies, ensuring compatibility with modern browsers for years to come.

---
*Developed with precision to transcend traditional hospitality digital standards.*

/**
 * ⚡ CLOUDFLARE CACHE WARMER
 * This script performs a "head start" request to your website's main assets.
 * This ensures that the very first guest of the day gets a "CACHE HIT" (fast load).
 */

const DOMAIN = "https://www.hotelgrandtokyo.com.np";

const ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    "/main.js",
    "/logo.png"
];

async function warmCache() {
    console.log(`🚀 Starting Cache Warm-up for ${DOMAIN}...`);

    for (const path of ASSETS) {
        const url = `${DOMAIN}${path}`;
        try {
            const startTime = Date.now();
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Cloudflare-Cache-Warmer/1.0' }
            });
            const duration = Date.now() - startTime;

            // Check if it's a HIT or MISS from Cloudflare headers
            const cfCache = response.headers.get('cf-cache-status') || 'UNKNOWN';

            console.log(`✅ ${path} → ${response.status} (${cfCache}) - ${duration}ms`);
        } catch (error) {
            console.error(`❌ Error warming ${path}:`, error.message);
        }
    }

    console.log("\n✨ Warm-up complete. Your site is now primed in the Cloudflare Edge.");
}

warmCache();

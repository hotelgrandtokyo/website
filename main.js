// ⚠️ REPLACE WITH YOUR APPS SCRIPT URL ⚠️
const API_URL = "https://script.google.com/macros/s/AKfycbw5GcrlUh6ltUfdb-CgvBkEI1LYZAu69XzMXnX49yC1I90QxoL5paGgWAvKiSN1MnpKRw/exec";

let siteData = {};
let settings = {};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Immediately setup UI structure and listeners
    window.addEventListener('scroll', handleScroll);
    setupStaticListeners();

    // 2. Check cache for instant load
    const cachedData = localStorage.getItem('goodCMS_data');
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            siteData = parsed.data;
            if (siteData.home_content && !siteData.home) {
                siteData.home = siteData.home_content;
            }
            settings = parsed.settings;
            applyBranding();
            populateModalRooms();
            buildNavigation();
        } catch (e) {
            console.warn("Cache parse error", e);
        }
    }

    // 3. Initial route render
    renderCurrentPage();

    // 4. Fetch fresh data in the background
    fetchDataInBackground();
});

const API_KEY = "TOKYO_PRIVATE_KEY_9801";

async function fetchDataInBackground() {
    try {
        const res = await fetch(`${API_URL}?key=${API_KEY}`);
        if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);
        const json = await res.json();

        if (json.status === 'success') {
            const freshDataStr = JSON.stringify({ data: json.data, settings: json.settings });
            const cachedDataStr = localStorage.getItem('goodCMS_data');

            // Only re-render if data has changed or if it was empty
            if (freshDataStr !== cachedDataStr) {
                localStorage.setItem('goodCMS_data', freshDataStr);
                siteData = json.data;
                // Standardize home_content to home for easier internal usage
                if (siteData.home_content && !siteData.home) {
                    siteData.home = siteData.home_content;
                }
                settings = json.settings;

                applyBranding();
                populateModalRooms();
                buildNavigation();
                renderCurrentPage();
            }
        } else {
            console.error("Data format error from API.", json.message);
        }
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

// --- CORE FUNCTIONS ---
function applyBranding() {
    const defaultName = 'Hotel Grand Tokyo';
    const defaultPhone = '9761799648, 01-5904107';
    const defaultEmail = 'hotelgrandtokyo@gmail.com';
    const defaultAddress = 'Baghdurbar-11, Sundhara, Kathmandu';

    const siteTitle = settings.siteName || defaultName;
    if (document.title !== siteTitle) document.title = siteTitle;

    const brandText = document.getElementById('brand-text');
    if (brandText) brandText.innerText = siteTitle;

    const fBrand = document.getElementById('f-brand') || document.getElementById('f-hotel-name');
    if (fBrand) fBrand.innerText = siteTitle;

    const copyName = document.getElementById('copyright-name');
    if (copyName) copyName.innerText = siteTitle;

    let phone = settings.contactPhone || defaultPhone;
    if (phone.includes('9761799648')) phone = defaultPhone;

    const fPhone = document.getElementById('f-phone');
    if (fPhone) fPhone.innerText = phone;

    const fPhoneLink = document.getElementById('f-phone-link');
    if (fPhoneLink) fPhoneLink.href = `tel:${phone.split(',')[0].trim()}`.replace(/\s/g, '');

    let email = settings.contactEmail || defaultEmail;
    if (email.includes('hotelgrandtokyo')) email = defaultEmail;

    const fEmail = document.getElementById('f-email');
    if (fEmail) fEmail.innerText = email;

    const fEmailLink = document.getElementById('f-email-link');
    if (fEmailLink) fEmailLink.href = `mailto:${email}`;

    let addr = settings.address || defaultAddress;
    if (addr.includes('Sundhara, Kathmandu, Nepal')) addr = defaultAddress;

    const fAddr = document.getElementById('f-address');
    if (fAddr) fAddr.innerText = addr;
}

function buildNavigation() {
    const dNav = document.getElementById('nav-links');
    const mNav = document.getElementById('mobile-links');
    const fNav = document.getElementById('f-links');

    if (!dNav || !mNav || !fNav) return;

    [dNav, mNav, fNav].forEach(nav => nav.innerHTML = '');

    const navOrder = ['Home', 'Rooms', 'Services', 'Offers', 'Gallery', 'Blogs', 'Testimonials', 'About', 'FAQ'];

    navOrder.forEach(page => {
        const key = page.toLowerCase();
        const dataKey = key === 'home' ? 'home_content' : key;

        // Always show Home, show others only if they have data
        if (key === 'home' || key === 'faq' || (siteData[key] && siteData[key].length > 0) || (siteData[dataKey] && siteData[dataKey].length > 0)) {
            const linkHtml = `<a href="#${page}">${page}</a>`;

            // Only add FAQ to the footer, skip for main nav and mobile nav
            if (key !== 'faq') {
                dNav.innerHTML += `<li>${linkHtml}</li>`;
                mNav.innerHTML += `<li><a href="#${page}" onclick="toggleMobileMenu()">${page}</a></li>`;
            }

            fNav.innerHTML += `<li>${linkHtml}</li>`;
        }
    });
}

// SEO meta per page
const PAGE_SEO = {
    home: { title: `Hotel Grand Tokyo | Best Budget Hotel in Sundhara Kathmandu`, desc: `Experience the best budget stay at Hotel Grand Tokyo in Sundhara, Kathmandu. Clean rooms and delicious food near Civil Mall. Book your affordable room today!` },
    rooms: { title: `Clean Rooms in Sundhara Kathmandu | Hotel Grand Tokyo`, desc: `Browse clean and comfortable rooms at Hotel Grand Tokyo in Sundhara, Kathmandu. Perfect for families, solo travelers, and budget-conscious tourists in Nepal.` },
    services: { title: `Hygienic Food & Services in Kathmandu | Hotel Grand Tokyo`, desc: `From airport shuttles to hygienic dining, Hotel Grand Tokyo in Sundhara offers premium hospitality and essential services for every traveler in Kathmandu.` },
    offers: { title: `Special Hotel Deals in Sundhara Kathmandu | Hotel Grand Tokyo`, desc: `Exclusive hotel offers and discounts at Hotel Grand Tokyo, Sundhara. Save more on your stay with our special packages for families and long-term guests.` },
    gallery: { title: `Hotel Grand Tokyo Gallery | Clean Rooms & Restaurant`, desc: `Explore the clean rooms and dining area at Hotel Grand Tokyo in Sundhara through our gallery. See why we are the top budget choice in Kathmandu, Nepal.` },
    blogs: { title: `Kathmandu Travel Guide & Tips | Hotel Grand Tokyo`, desc: `Expert travel guides from Hotel Grand Tokyo. Discover the best places to visit in Sundhara, safety tips, and hidden gems across Kathmandu, Nepal.` },
    testimonials: { title: `Guest Reviews for Hotel Grand Tokyo | Sundhara Kathmandu`, desc: `Read authentic reviews from guests who stayed at Hotel Grand Tokyo in Sundhara. Trusted for our cleanliness, hygienic food, and warm hospitality in Kathmandu.` },
    about: { title: `About Hotel Grand Tokyo | Best Budget Hotel in Kathmandu`, desc: `Learn about Hotel Grand Tokyo's commitment to hygiene and comfort. We are the premier budget hotel choice in the heart of Sundhara, Kathmandu.` },
    contact: { title: `Contact Hotel Grand Tokyo | Sundhara Kathmandu Nepal`, desc: `Get in touch with Hotel Grand Tokyo in Sundhara for reservations. Call us at 01-5904107 or 9761799648 to book your stay in Kathmandu today.` },
    booking: { title: `Book Your Stay | Hotel Grand Tokyo Sundhara Kathmandu`, desc: `Secure your clean room at Hotel Grand Tokyo, Kathmandu. Easy online booking for the best budget hotel experience in Sundhara near Civil Mall.` },
    faq: { title: `FAQ - Frequently Asked Questions | Hotel Grand Tokyo`, desc: `Find answers to common questions about amenities and services at Hotel Grand Tokyo in Sundhara, Kathmandu. We are here to help you plan your stay.` },
    guide: { title: `Traveler's Handbook | Kathmandu Guide | Hotel Grand Tokyo`, desc: `A complete travel guide for Kathmandu visitors. Get local tips, safety advice, and must-visit spots around Sundhara from the Hotel Grand Tokyo experts.` },
};

function setPageSEO(pageName) {
    const seo = PAGE_SEO[pageName] || PAGE_SEO.home;
    const hotelName = settings.siteName || 'Hotel Grand Tokyo';
    document.title = seo.title.replace('Hotel in Sundhara Kathmandu', hotelName).replace('Best Budget Hotel in Sundhara Kathmandu', hotelName);
    document.getElementById('meta-desc').content = seo.desc;
}

function renderCurrentPage() {
    const pageName = (location.hash.replace('#', '') || 'Home').toLowerCase();
    const app = document.getElementById('app-root');

    // If data hasn't loaded yet, keep showing skeleton
    if (Object.keys(siteData).length === 0) {
        return; // The static skeleton is already in index.html
    }

    window.scrollTo(0, 0);
    setPageSEO(pageName);

    // Apply "Page Switch" effect
    app.classList.remove('page-switch-fade');
    void app.offsetWidth; // Trigger reflow
    app.classList.add('page-switch-fade');

    let html = '';
    if (pageName === 'home') {
        html = buildHomePage();
    } else if (pageName === 'booking') {
        html = buildBookingPage();
    } else if (pageName === 'contact') {
        html = buildContactPage();
    } else if (pageName === 'faq') {
        html = buildFAQPage();
    } else if (pageName === 'guide') {
        html = buildGuidePage();
    } else if (pageName === 'about' && siteData.about) {
        html = buildAboutPage();
    } else if (siteData[pageName]) {
        html = buildListPage(pageName, siteData[pageName]);
    } else {
        html = build404Page();
    }

    app.innerHTML = html;
    initAnimations();
    initFAQ();

    // Initialize 3D Tilt Effect on cards
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".room-card, .glass-floating"), {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.15
        });
    }
}

function buildHomePage() {
    let html = '';

    // Hero Section
    const heroItem = siteData.home?.find(item => item.Component === 'HERO');
    if (heroItem) {
        const bgImg = heroItem.ImageURL ? `background-image: url('${heroItem.ImageURL}');` : `background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop');`;
        html += `
        <section class="hero" style="${bgImg}">
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <span class="label" style="letter-spacing: 0.5em; margin-bottom: 24px;">Transcending Hospitality</span>
                <h1 style="font-size: clamp(40px, 8vw, 80px); line-height: 1.1; margin-bottom: 32px;">${heroItem.Title.replace(/\.{2,}/g, '')}</h1>
                <p style="color: var(--on-surface-variant); font-size: 18px; max-width: 600px; margin: 0 auto 48px; opacity: 0.9;">${heroItem.Description}</p>
                <button class="btn-primary" onclick="openModal()" style="padding: 18px 48px; font-size: 14px;">Secure Your Stay</button>
            </div>
            <div class="scroll-indicator">
                <div class="mouse"></div>
                <span style="font-family: var(--font-label); font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 12px; opacity: 0.6;">Scroll</span>
            </div>
        </section>`;
    }

    // Intro Section
    const introItem = siteData.home?.find(item => item.Component === 'INTRO');
    if (introItem) {
        const bgImg = introItem.ImageURL ? `<img src="${introItem.ImageURL}" alt="${introItem.Title}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="width:100%; height:100%; background:var(--surface-bright);"></div>';
        html += `
        <section class="fade-in">
            <div class="container">
                <div style="display:flex; gap:64px; align-items:center; flex-wrap:wrap;">
                    <div style="flex: 1 1 400px;">
                        <div class="section-head" style="margin-bottom: 32px;">
                            <span class="label">The Philosophy</span>
                            <h2 style="font-size: 40px;">${introItem.Title}</h2>
                        </div>
                        <p style="color: var(--on-surface-variant); margin-bottom: 24px;">${introItem.Description}</p>
                        <p style="font-family: var(--font-label); color: var(--primary-dim); text-transform:uppercase; font-size: 12px; letter-spacing:0.1em;">${introItem.Extra_Data || ''}</p>
                    </div>
                    <div class="glass" style="flex: 1 1 400px; height: 500px; padding: 24px;">
                        ${bgImg}
                    </div>
                </div>
            </div>
        </section>`;
    }

    // Room Highlights
    if (siteData.rooms && siteData.rooms.length > 0) {
        html += `
        <section class="fade-in">
            <div class="container">
                <div class="section-head">
                    <span class="label">Sanctuary of Excellence</span>
                    <h2>Suites & Private Residences</h2>
                    <p>Where traditional Japanese minimalism meets the pinnacle of futuristic luxury. Experience tranquility above the pulse of the city.</p>
                </div>
                <div class="room-grid">
                    ${siteData.rooms.slice(0, 3).map(buildRoomCard).join('')}
                </div>
            </div>
        </section>`;
    }

    // Services Highlight
    if (siteData.services && siteData.services.length > 0) {
        html += `
        <section class="fade-in" style="background: var(--surface-dim);">
            <div class="container">
                <div class="section-head" style="text-align:center;">
                    <span class="label">The Art of Living</span>
                    <h2>Unparalleled Service</h2>
                </div>
                <div class="room-grid">
                    ${siteData.services.slice(0, 3).map(buildServiceCard).join('')}
                </div>
            </div>
        </section>`;
    }

    // Offers Highlight
    if (siteData.offers && siteData.offers.length > 0) {
        html += `
        <section class="fade-in">
            <div class="container">
                <div class="section-head">
                    <span class="label">Exclusive Curations</span>
                    <h2>Special Offers</h2>
                </div>
                <div class="room-grid">
                    ${siteData.offers.slice(0, 3).map(buildOfferCard).join('')}
                </div>
            </div>
        </section>`;
    }

    // Testimonials
    if (siteData.testimonials && siteData.testimonials.length > 0) {
        html += `
        <section class="fade-in" style="background: var(--surface-dim);">
            <div class="container">
                <div class="section-head" style="text-align:center;">
                    <span class="label">Guest Experiences</span>
                    <h2>Testimonials</h2>
                </div>
                <div class="room-grid">
                    ${siteData.testimonials.slice(0, 3).map(buildTestimonialCard).join('')}
                </div>
            </div>
        </section>`;
    }

    // SEO: Map Section (Home)
    html += `
    <section class="fade-in" style="background: var(--surface-dim); padding-top: 0;">
        <div class="container">
            <div class="section-head">
                <span class="label">Our Location</span>
                <h2>Find Us in Sundhara</h2>
                <p>Centrally located near Civil Mall and the Kathmandu Bus Park. Experience the heart of the city.</p>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:30px; margin-bottom:48px;">
                <div class="glass-floating" style="padding:32px; text-align:center;">
                    <i class="fa-solid fa-location-dot" style="color:var(--primary); font-size:24px; margin-bottom:16px;"></i>
                    <h3>Physical Address</h3>
                    <p>${settings.address || 'Baghdurbar-11, Sundhara, Kathmandu, Nepal'}</p>
                </div>
                <div class="glass-floating" style="padding:32px; text-align:center;">
                    <i class="fa-solid fa-phone" style="color:var(--primary); font-size:24px; margin-bottom:16px;"></i>
                    <h3>Call for Reservations</h3>
                    <p>${settings.contactPhone || '01-5904107, 9761799648'}</p>
                </div>
                <div class="glass-floating" style="padding:32px; text-align:center;">
                    <i class="fa-solid fa-clock" style="color:var(--primary); font-size:24px; margin-bottom:16px;"></i>
                    <h3>Reception Hours</h3>
                    <p>24 Hours / 7 Days</p>
                </div>
            </div>

            <div class="glass" style="height: 450px; padding: 12px; position: relative; overflow: hidden; border-radius: 4px; margin-bottom: 24px;">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5771298550753!2d85.31124249999999!3d27.699461799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb185481713169%3A0x7d58fe7468a19327!2sOyo%20807%20Hotel%20Grand%20Tokyo!5e0!3m2!1sen!2snp!4v1777441533837!5m2!1sen!2snp" 
                        width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div style="text-align: center;">
                <a href="https://maps.app.goo.gl/WLFHrGWnmrztDVqFA" target="_blank" class="btn-outline" style="display: inline-flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-map-location-dot"></i> View on Google Maps
                </a>
            </div>
        </div>
    </section>`;

    return html;
}

function buildFAQPage() {
    let html = `
    <section class="hero" style="height: 50vh; background: var(--surface-dim); display:flex; align-items:flex-end; padding-bottom: 60px;">
        <div class="container fade-in" style="width:100%;">
            <span class="label">Support</span>
            <h1 style="font-size: 56px;">Frequently Asked Questions</h1>
        </div>
    </section>
    <section class="fade-in">
        <div class="container" style="max-width: 900px;">
            ${buildFAQSection()}
        </div>
    </section>`;
    return html;
}

function buildGuidePage() {
    return `
    <section class="page-hero">
        <div class="container fade-in" style="width:100%;">
            <span class="label">Explore Kathmandu</span>
            <h1 class="page-hero-title">Traveler's Handbook</h1>
        </div>
    </section>
    <section class="fade-in">
        <div class="container" style="max-width: 1000px;">
            ${buildSEOGuideSection()}
        </div>
    </section>`;
}

function buildListPage(pageName, items) {
    const title = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    let html = `
    <section class="page-hero">
        <div class="container fade-in" style="width:100%;">
            <span class="label">Explore</span>
            <h1 class="page-hero-title">${title}</h1>
        </div>
    </section>
    <section class="fade-in"><div class="container">`;

    if (pageName === 'rooms') {
        html += `<div class="room-grid">${items.map(buildRoomCard).join('')}</div>`;
    } else if (pageName === 'services') {
        html += `<div class="room-grid">${items.map(buildServiceCard).join('')}</div>`;
    } else if (pageName === 'offers') {
        html += `<div class="room-grid">${items.map(buildOfferCard).join('')}</div>`;
    } else if (pageName === 'blogs') {
        html += `<div class="room-grid">${items.map(buildBlogCard).join('')}</div>`;
    } else if (pageName === 'gallery') {
        html += `<div class="room-grid">${items.map(img => `
            <div class="room-card fade-in">
                <div class="room-img-wrap" style="height: 400px;">
                    <img src="${img.ImageURL}" alt="${img.Caption}">
                </div>
                <div class="room-details" style="margin-top:0; background:transparent; padding: 24px;">
                    <p style="font-family: var(--font-label); color:var(--primary); text-transform:uppercase; letter-spacing:0.1em; font-size:12px; margin:0;">${img.Caption}</p>
                </div>
            </div>`).join('')}</div>`;
    } else if (pageName === 'testimonials') {
        html += `<div class="room-grid">${items.map(buildTestimonialCard).join('')}</div>`;
    }

    html += `</div></section>`;
    return html;
}

function buildAboutPage() {
    let html = `
    <section class="page-hero">
        <div class="container fade-in" style="width:100%;">
            <span class="label">The Legacy</span>
            <h1 class="page-hero-title">About Us</h1>
        </div>
    </section>
    <section class="fade-in"><div class="container">`;

    siteData.about.sort((a, b) => (a.Order || 0) - (b.Order || 0)).forEach((item, index) => {
        const reverse = index % 2 !== 0 ? 'flex-direction: row-reverse;' : '';
        const bgImg = item.ImageURL ? `<img src="${item.ImageURL}" alt="${item.Title}" style="width:100%; height:100%; object-fit:cover;">` : '<div style="width:100%; height:100%; background:var(--surface-bright);"></div>';

        html += `
        <div class="fade-in" style="display:flex; gap:64px; align-items:center; flex-wrap:wrap; margin-bottom: 128px; ${reverse}">
            <div style="flex: 1 1 400px;">
                <span class="label">${item.Subtitle || 'Our Story'}</span>
                <h2 style="font-size: 40px; margin-bottom: 24px;">${item.Title}</h2>
                <p style="color: var(--on-surface-variant); font-size: 16px;">${item.Body}</p>
            </div>
            <div class="glass-floating" style="flex: 1 1 400px; height: 500px; padding: 24px;">
                ${bgImg}
            </div>
        </div>`;
    });

    html += `</div></section>`;

    // Add Map to About Us Page
    html += `
    <section class="fade-in" style="background: var(--surface-dim); padding-bottom: 100px;">
        <div class="container">
            <div class="section-head">
                <span class="label">Location</span>
                <h2>Find Us in Sundhara</h2>
            </div>
            <div class="glass" style="height: 450px; padding: 12px; position: relative; overflow: hidden; border-radius: 4px; margin-bottom: 24px;">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5771298550753!2d85.31124249999999!3d27.699461799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb185481713169%3A0x7d58fe7468a19327!2sOyo%20807%20Hotel%20Grand%20Tokyo!5e0!3m2!1sen!2snp!4v1777441533837!5m2!1sen!2snp" 
                        width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div style="text-align: center;">
                <a href="https://maps.app.goo.gl/WLFHrGWnmrztDVqFA" target="_blank" class="btn-outline" style="display: inline-flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-map-location-dot"></i> Get Directions
                </a>
            </div>
        </div>
    </section>`;

    return html;
}

function buildBookingPage() {
    return `
    <section class="page-hero">
        <div class="container fade-in" style="width:100%;">
            <span class="label">Reservation</span>
            <h1 class="page-hero-title">Experience Tranquility</h1>
        </div>
    </section>
    <section class="fade-in" style="padding-top: 64px;">
        <div class="container" style="max-width: 800px;">
            <div class="glass-floating" style="padding: 48px;">
                <form id="booking-form-page">
                    <div class="row-group">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input type="text" id="b-name-page" required>
                        </div>
                        <div class="input-group">
                            <label>Phone</label>
                            <input type="tel" id="b-phone-page" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Email</label>
                        <input type="email" id="b-email-page" required>
                    </div>
                    <div class="input-group">
                        <label>Room Type</label>
                        <select id="b-room-page" required>
                            ${siteData.rooms ? siteData.rooms.map(r => `<option value="${r.Title}">${r.Title}</option>`).join('') : ''}
                        </select>
                    </div>
                    <div class="row-group">
                        <div class="input-group">
                            <label>Arrival Date</label>
                            <input type="date" id="b-checkin-page" required>
                        </div>
                        <div class="input-group">
                            <label>Departure Date</label>
                            <input type="date" id="b-checkout-page" required>
                        </div>
                    </div>
                    <div class="row-group">
                        <div class="input-group">
                            <label>Guests</label>
                            <input type="number" id="b-pax-page" min="1" value="2" required>
                        </div>
                        <div class="input-group">
                            <label>Rooms</label>
                            <input type="number" id="b-rooms-page" min="1" value="1" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Special Requests</label>
                        <textarea id="b-message-page" rows="4"></textarea>
                    </div>
                    <input type="text" id="b-honeypot-page" name="website" style="display:none;" tabindex="-1" autocomplete="off">
                    <div class="form-status" id="form-status-page" style="margin-bottom: 24px; font-family: var(--font-label); color: var(--primary);"></div>
                    <div style="display:flex; gap: 24px;">
                        <button type="submit" class="btn-primary" id="booking-submit-btn-page">Confirm Booking</button>
                    </div>
                </form>
            </div>
        </div>
    </section>`;
}

function buildContactPage() {
    return `
    <section class="page-hero">
        <div class="container fade-in" style="width:100%;">
            <span class="label">Connect</span>
            <h1 class="page-hero-title">Get In Touch</h1>
        </div>
    </section>
    <section class="fade-in" style="padding-top: 64px;">
        <div class="container" style="max-width: 800px;">
            <div class="glass-floating" style="padding: 48px;">
                <form id="contact-form">
                    <div class="row-group">
                        <div class="input-group">
                            <label>Full Name</label>
                            <input type="text" id="c-name" required>
                        </div>
                        <div class="input-group">
                            <label>Email</label>
                            <input type="email" id="c-email" required>
                        </div>
                    </div>
                    <div class="row-group">
                        <div class="input-group">
                            <label>Phone</label>
                            <input type="tel" id="c-phone">
                        </div>
                        <div class="input-group">
                            <label>Subject</label>
                            <select id="c-subject" required>
                                <option value="">Select a subject</option>
                                <option value="Inquiry">General Inquiry</option>
                                <option value="Concierge">Concierge Services</option>
                                <option value="Feedback">Feedback</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Message</label>
                        <textarea id="c-message" rows="5" required></textarea>
                    </div>
                    <input type="text" id="c-honeypot" style="display:none;">
                    <div class="form-status" id="contact-status" style="margin-bottom: 24px; font-family: var(--font-label); color: var(--primary);"></div>
                    <button type="submit" class="btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    </section>
    <section class="fade-in" style="padding-top: 0; padding-bottom: 80px;">
        <div class="container">
            <div class="glass" style="height: 400px; padding: 12px; position: relative; overflow: hidden; border-radius: 4px; margin-bottom: 24px;">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.5771298550753!2d85.31124249999999!3d27.699461799999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb185481713169%3A0x7d58fe7468a19327!2sOyo+807+Hotel+Grand+Tokyo!5e0!3m2!1sen!2snp!4v1777441533837!5m2!1sen!2snp" 
                        width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <div style="text-align: center;">
                <a href="https://maps.app.goo.gl/WLFHrGWnmrztDVqFA" target="_blank" class="btn-outline" style="display: inline-flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-map-location-dot"></i> Open in Maps
                </a>
            </div>
        </div>
    </section>`;
}

// --- SEO CONTENT BUILDERS ---
function buildSEOGuideSection() {
    return `
    <section class="fade-in seo-guide-section" aria-label="Kathmandu Traveler's Guide">
        <div class="container">
            <div class="section-head">
                <span class="label">Your Complete Guide</span>
                <h2>The Kathmandu Traveler's Handbook</h2>
                <p>Everything you need to know about staying in Sundhara, Kathmandu — from price guides to safety tips trusted by thousands of international visitors.</p>
            </div>
            <div class="seo-guide-grid">
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-location-dot"></i></div>
                    <h3>Why Sundhara, Kathmandu?</h3>
                    <p>Sundhara is the ideal base for tourists visiting Kathmandu. Situated at the city's geographical midpoint, it offers <strong>walking distance access to Civil Mall</strong>, the Sundhara Bus Park, and is just minutes from Thamel. Whether you're arriving at Tribhuvan International Airport or heading to Pashupatinath, Sundhara puts you at the center of everything.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> 5 min walk to Civil Mall</li>
                        <li><i class="fa-solid fa-check"></i> Near Kathmandu Bus Park (Sundhara)</li>
                        <li><i class="fa-solid fa-check"></i> 15 min drive to Thamel</li>
                        <li><i class="fa-solid fa-check"></i> Airport shuttle available</li>
                    </ul>
                </article>
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-utensils"></i></div>
                    <h3>Clean Rooms & Hygienic Food</h3>
                    <p>We understand that for international travelers, hygiene is non-negotiable. Our hotel maintains strict <strong>cleanliness standards</strong> with daily housekeeping, filtered water, and an in-house restaurant that serves fresh, hygienic Nepali and international cuisine. All meals are prepared in a clean, inspected kitchen — safe for all dietary needs.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> Daily room cleaning</li>
                        <li><i class="fa-solid fa-check"></i> Hygienic kitchen & restaurant</li>
                        <li><i class="fa-solid fa-check"></i> Vegetarian & international menus</li>
                        <li><i class="fa-solid fa-check"></i> Safe drinking water provided</li>
                    </ul>
                </article>
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-shield-halved"></i></div>
                    <h3>Safe for Foreign Travelers</h3>
                    <p>Safety is our top priority. Our hotel in Sundhara, Kathmandu is equipped with <strong>24-hour CCTV surveillance</strong>, a professional reception desk, and secure room locks. We are trusted by solo travelers, foreign tourists, and families from Europe, USA, Australia, Japan, and across Asia. Our staff speaks English and is trained to assist international guests.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> 24/7 CCTV security</li>
                        <li><i class="fa-solid fa-check"></i> English-speaking staff</li>
                        <li><i class="fa-solid fa-check"></i> Secure luggage storage</li>
                        <li><i class="fa-solid fa-check"></i> Emergency contact support</li>
                    </ul>
                </article>
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-tags"></i></div>
                    <h3>Budget-Friendly Price Range</h3>
                    <p>Kathmandu hotels vary widely in price. In Sundhara, you can find <strong>budget rooms from NPR 800 to NPR 3,000 per night</strong>. Our hotel offers the best value in the area — clean, comfortable rooms at honest prices with no hidden fees. Family rooms, double rooms, and standard single rooms are all available at transparent rates.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> Budget rooms from NPR 800/night</li>
                        <li><i class="fa-solid fa-check"></i> Family & group discounts</li>
                        <li><i class="fa-solid fa-check"></i> No hidden charges</li>
                        <li><i class="fa-solid fa-check"></i> Free Wi-Fi included</li>
                    </ul>
                </article>
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-plane-arrival"></i></div>
                    <h3>Near Kathmandu Airport</h3>
                    <p>Tribhuvan International Airport is approximately <strong>6–8 km from Sundhara</strong>, making our hotel the perfect first or last stop for your Nepal trip. We offer a reliable <strong>airport shuttle service</strong> — book in advance and our driver will meet you at the arrivals gate. No need to haggle with taxis after a long flight.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> Airport pickup & drop-off</li>
                        <li><i class="fa-solid fa-check"></i> ~20 min drive from KTM airport</li>
                        <li><i class="fa-solid fa-check"></i> Pre-bookable shuttle</li>
                        <li><i class="fa-solid fa-check"></i> Meet & greet service</li>
                    </ul>
                </article>
                <article class="seo-guide-card fade-in">
                    <div class="seo-guide-icon"><i class="fa-solid fa-users"></i></div>
                    <h3>Perfect for Families & Groups</h3>
                    <p>Traveling with family? Our hotel in Sundhara, Kathmandu is one of the <strong>best family hotels in Kathmandu</strong>. We offer spacious family rooms that comfortably accommodate parents and children. Our staff provides extra beds, cribs, and kid-friendly meals on request. Group booking discounts are also available for tour groups and corporate travelers.</p>
                    <ul class="seo-feature-list">
                        <li><i class="fa-solid fa-check"></i> Spacious family rooms</li>
                        <li><i class="fa-solid fa-check"></i> Child-friendly dining</li>
                        <li><i class="fa-solid fa-check"></i> Group discount available</li>
                        <li><i class="fa-solid fa-check"></i> Extra beds on request</li>
                    </ul>
                </article>
            </div>
        </div>
    </section>`;
}

function buildFAQSection() {
    const faqs = [
        {
            q: 'What types of rooms are available at Hotel Grand Tokyo?',
            a: 'We offer a variety of clean and comfortable rooms, including Single, Double, and Family suites.'
        },
        {
            q: 'Is Hotel Grand Tokyo safe for international travelers?',
            a: 'Yes, safety is our top priority. We provide 24-hour CCTV surveillance, a secure front desk, and professional staff dedicated to ensuring a safe and comfortable environment for all our guests.'
        },
        {
            q: 'What are the check-in and check-out timings?',
            a: 'Our standard check-in time is 12:00 PM and check-out is at 12:00 PM. We offer flexibility for early arrivals or late departures based on room availability — please contact us in advance.'
        },
        {
            q: 'Does the hotel provide airport pickup and drop-off services?',
            a: 'Yes, we offer reliable airport shuttle services to and from Tribhuvan International Airport (KTM). Please share your flight details with us during booking to arrange your transfer.'
        },
        {
            q: 'Is there an in-house restaurant at Hotel Grand Tokyo?',
            a: 'Absolutely. Our in-house restaurant serves hygienic and delicious Nepali, Indian, and Continental cuisine, prepared fresh daily to meet high hygiene standards.'
        },
        {
            q: 'How close is the hotel to major attractions like Civil Mall?',
            a: 'Hotel Grand Tokyo is perfectly located in Sundhara, just a 2-minute walk from Civil Mall and within easy reach of Kathmandu Durbar Square and the vibrant Thamel area.'
        },
        {
            q: 'Is free Wi-Fi available for all guests?',
            a: 'Yes, we provide high-speed, complimentary Wi-Fi throughout the entire hotel, including all guest rooms and common areas, so you can stay connected during your visit.'
        }
    ];

    return `
    <section class="fade-in faq-section" aria-label="Frequently Asked Questions">
        <div class="container">
            <div class="section-head" style="text-align:center;">
                <span class="label">Got Questions?</span>
                <h2>Frequently Asked Questions</h2>
                <p>Everything travelers ask before booking a hotel in Sundhara, Kathmandu.</p>
            </div>
            <div class="faq-list">
                ${faqs.map((f, i) => `
                <div class="faq-item" id="faq-${i}">
                    <button class="faq-question" onclick="toggleFAQ(${i})" aria-expanded="false" aria-controls="faq-answer-${i}">
                        <span>${f.q}</span>
                        <i class="fa-solid fa-plus faq-icon"></i>
                    </button>
                    <div class="faq-answer" id="faq-answer-${i}" role="region">
                        <p>${f.a}</p>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </section>`;
}

function build404Page() {
    return `
    <section class="page-404 fade-in" aria-label="Page Not Found">
        <div class="page-404-inner">
            <div class="page-404-number">404</div>
            <div class="page-404-divider"></div>
            <span class="label">Lost in Kathmandu?</span>
            <h1 class="page-404-title">Page Not Found</h1>
            <p class="page-404-desc">The page you are looking for doesn't exist or may have moved. Perhaps you were looking for our rooms, offers, or want to make a booking?</p>
            <div class="page-404-actions">
                <a href="#Home" class="btn-primary">Back to Home</a>
                <a href="#Rooms" class="btn-404-secondary">View Rooms</a>
            </div>
            <div class="page-404-links">
                <a href="#Services">Services</a>
                <a href="#Gallery">Gallery</a>
                <a href="#About">About</a>
                <a href="#Blogs">Blog</a>
            </div>
        </div>
    </section>`;
}

// --- COMPONENT BUILDERS ---
function buildRoomCard(room) {
    const bgImg = room.ImageURL ? `<img src="${room.ImageURL}" alt="${room.Title}">` : `<img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" alt="${room.Title}">`;
    return `
    <div class="room-card fade-in">
        <div class="room-img-wrap">
            ${bgImg}
        </div>
        <div class="room-details">
            <span class="label">${room.Guests}</span>
            <h3>${room.Title}</h3>
            <p>${room.Description}</p>
            <div class="room-meta">
                <div class="price-badge">${room.Price}</div>
                <div class="book-link" onclick="openModal('${room.Title.replace(/'/g, "\\'")}')">Secure Suite &rarr;</div>
            </div>
        </div>
    </div>`;
}

function buildServiceCard(service) {
    const bgImg = service.ImageURL ? `<img src="${service.ImageURL}" alt="${service.Title}">` : '<div style="width:100%; height:100%; background:var(--surface-bright);"></div>';
    return `
    <div class="room-card fade-in">
        <div class="room-img-wrap" style="height: 250px;">
            ${bgImg}
        </div>
        <div class="room-details" style="background: var(--surface-dim); margin-top: 0;">
            <span class="label"><i class="fa-solid ${service.Icon || 'fa-star'}"></i></span>
            <h3>${service.Title}</h3>
            <p style="margin-bottom:0;">${service.Description}</p>
        </div>
    </div>`;
}

function buildOfferCard(offer) {
    const bgImg = offer.ImageURL ? `<img src="${offer.ImageURL}" alt="${offer.Title}">` : '<div style="width:100%; height:100%; background:var(--surface-bright);"></div>';
    return `
    <div class="room-card fade-in">
        <div class="room-img-wrap">
            ${bgImg}
        </div>
        <div class="room-details">
            <span class="label">${offer.Tag || 'Exclusive'}</span>
            <h3>${offer.Title}</h3>
            <p style="margin-bottom:0;">${offer.Description}</p>
        </div>
    </div>`;
}

function buildBlogCard(blog) {
    const bgImg = blog.ImageURL ? `<img src="${blog.ImageURL}" alt="${blog.Title}">` : '<div style="width:100%; height:100%; background:var(--surface-bright);"></div>';
    return `
    <div class="room-card fade-in">
        <div class="room-img-wrap" style="height: 250px;">
            ${bgImg}
        </div>
        <div class="room-details" style="background: transparent;">
            <span class="label">${blog.Date}</span>
            <h3 style="font-size: 24px;">${blog.Title}</h3>
            <p style="margin-bottom:0;">${blog.Excerpt}</p>
        </div>
    </div>`;
}

function buildTestimonialCard(t) {
    // Star rating from "Rating" column (1-5), default 5
    const rating = parseInt(t.Rating) || 5;
    const stars = Array.from({ length: 5 }, (_, i) =>
        `<i class="fa-${i < rating ? 'solid' : 'regular'} fa-star" style="color: ${i < rating ? 'var(--primary)' : 'rgba(233,193,118,0.3)'}; font-size: 14px;"></i>`
    ).join('');

    // Avatar from "AvatarURL" column, fallback to initial letter
    const photoUrl = t.AvatarURL || '';
    const initial = (t.Author || 'G').charAt(0).toUpperCase();
    const avatar = photoUrl
        ? `<img src="${photoUrl}" alt="${t.Author}" style="width:52px; height:52px; border-radius:50%; object-fit:cover; border: 2px solid var(--primary); flex-shrink:0;">`
        : `<div style="width:52px; height:52px; border-radius:50%; background: rgba(233,193,118,0.12); border: 2px solid var(--primary); display:flex; align-items:center; justify-content:center; font-family:var(--font-head); font-size:22px; color:var(--primary); flex-shrink:0;">${initial}</div>`;

    // Source badge from "Source" column (e.g. Google, Booking.com, TripAdvisor)
    const sourceBadge = t.Source
        ? `<span style="font-family:var(--font-label); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--primary-dim); margin-top:2px; display:block;">${t.Source}</span>`
        : '';

    return `
    <div class="glass-floating fade-in" style="padding: 32px; display:flex; flex-direction:column; gap:16px; min-height: 240px;">
        <div style="display:flex; gap:3px;">${stars}</div>
        <p style="color: var(--on-surface-variant); font-size:15px; line-height:1.75; flex:1; font-style:italic; margin:0;">"${t.Quote || ''}"</p>
        <div style="display:flex; align-items:center; gap:14px; padding-top:16px; border-top:1px solid rgba(233,193,118,0.1);">
            ${avatar}
            <div>
                <h4 style="color: var(--primary); font-family: var(--font-label); font-size: 13px; text-transform:uppercase; letter-spacing:0.1em; margin:0 0 2px;">${t.Author || 'Guest'}</h4>
                <span style="color: var(--on-surface-variant); font-size:12px;">${t.Location || ''}</span>
                ${sourceBadge}
            </div>
        </div>
    </div>`;
}

// --- INTERACTION & EVENTS ---
function setupStaticListeners() {
    window.addEventListener('hashchange', renderCurrentPage);

    document.getElementById('back-to-top-btn')?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmit);

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) bookingForm.addEventListener('submit', handleBookingSubmit);

    // Listen for dynamically created forms (like contact page or booking page form)
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'booking-form-page') handleBookingSubmit(e);
        if (e.target.id === 'contact-form') handleContactSubmit(e);
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function initFAQ() {
    // nothing to init — onclick handlers are inline
    // But open the first FAQ by default for UX
    const firstBtn = document.querySelector('.faq-question');
    if (firstBtn) toggleFAQ(0);
}

function toggleFAQ(index) {
    const allItems = document.querySelectorAll('.faq-item');
    allItems.forEach((item, i) => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        if (i === index) {
            const isOpen = item.classList.contains('open');
            item.classList.toggle('open', !isOpen);
            btn.setAttribute('aria-expanded', String(!isOpen));
            answer.style.maxHeight = isOpen ? '0' : answer.scrollHeight + 'px';
            icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
        } else {
            item.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = '0';
            icon.style.transform = 'rotate(0deg)';
        }
    });
}

function handleScroll() {
    const header = document.getElementById('main-header');
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);

    const backBtn = document.getElementById('back-to-top-btn');
    if (backBtn) backBtn.style.display = (window.scrollY > 500) ? 'block' : 'none';

    // Parallax hero
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && window.scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${window.scrollY * 0.3}px)`;
    }
}

function openModal(roomName = null) {
    document.getElementById('booking-modal').classList.add('active');

    // Pre-select room if passed
    if (roomName) {
        const selects = [document.getElementById('b-room'), document.getElementById('b-room-page')];
        selects.forEach(select => {
            if (select) {
                const option = Array.from(select.options).find(opt => opt.value === roomName);
                if (option) option.selected = true;
            }
        });
    }
}
function closeModal() {
    document.getElementById('booking-modal').classList.remove('active');
}
function toggleMobileMenu() {
    document.getElementById('mobile-menu').classList.toggle('active');
}

function populateModalRooms() {
    const roomSelects = [document.getElementById('b-room'), document.getElementById('b-room-page')];
    if (siteData.rooms && siteData.rooms.length > 0) {
        roomSelects.forEach(select => {
            if (select) {
                select.innerHTML = siteData.rooms.map(r => `<option value="${r.Title}">${r.Title}</option>`).join('');
            }
        });
    }
}

// --- FORM HANDLERS ---
async function handleBookingSubmit(e) {
    e.preventDefault();
    const formId = e.target.id;
    const isPage = formId === 'booking-form-page';
    const sfx = isPage ? '-page' : '';

    const honeypot = document.getElementById(`b-honeypot${sfx}`).value;
    if (honeypot) return;

    const submitBtn = document.getElementById(`booking-submit-btn${sfx}`);
    const statusDiv = document.getElementById(`form-status${sfx}`);

    // Client-side rate limiting (1-minute cooldown)
    if (submitBtn.getAttribute('data-last-click') && Date.now() - submitBtn.getAttribute('data-last-click') < 60000) {
        statusDiv.textContent = 'Please wait 1 minute before submitting another request.';
        return;
    }
    submitBtn.setAttribute('data-last-click', Date.now());

    submitBtn.disabled = true;
    submitBtn.innerText = 'Processing...';
    statusDiv.textContent = '';

    const checkin = document.getElementById(`b-checkin${sfx}`)?.value || 'N/A';
    const checkout = document.getElementById(`b-checkout${sfx}`)?.value || 'N/A';
    const rawMessage = document.getElementById(`b-message${sfx}`).value.trim() || 'No special requests';
    const combinedMessage = `Dates: ${checkin} to ${checkout}\n\nRequests: ${rawMessage}`;

    const bookingData = {
        name: document.getElementById(`b-name${sfx}`).value.trim(),
        phone: document.getElementById(`b-phone${sfx}`).value.trim(),
        email: document.getElementById(`b-email${sfx}`).value.trim(),
        room: document.getElementById(`b-room${sfx}`).value,
        pax: document.getElementById(`b-pax${sfx}`).value,
        rooms: document.getElementById(`b-rooms${sfx}`).value,
        message: combinedMessage,
        adminEmail: settings.contactEmail || 'hotelgrandtokyo@gmail.com',
        siteName: settings.siteName || 'Hotel Grand Tokyo'
    };

    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify(bookingData) });
        const result = await response.json();

        if (result.status === 'success') {
            statusDiv.textContent = 'Reservation request received. Check your email.';
            e.target.reset();
            setTimeout(() => { if (!isPage) closeModal(); statusDiv.textContent = ''; }, 3000);
        } else throw new Error(result.message || 'Failed');
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = isPage ? 'Confirm Booking' : 'Request Confirmation';
    }
}

async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('nl-email').value.trim();
    const statusDiv = document.getElementById('nl-status');
    const submitBtn = e.target.querySelector('button');

    if (!email) return;
    try {
        submitBtn.disabled = true;
        statusDiv.textContent = 'Subscribing...';
        const formData = new FormData();
        formData.append('newsletter-email', email);
        const result = await fetch(API_URL, { method: 'POST', body: formData }).then(r => r.json());
        if (result.status === 'success') {
            statusDiv.textContent = 'Subscribed successfully.';
            e.target.reset();
            setTimeout(() => statusDiv.textContent = '', 3000);
        } else throw new Error(result.message);
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const honeypot = document.getElementById('c-honeypot').value;
    if (honeypot) return;

    const statusDiv = document.getElementById('contact-status');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    try {
        // 1-minute rate limiting
        if (submitBtn.getAttribute('data-last-click') && Date.now() - submitBtn.getAttribute('data-last-click') < 60000) {
            statusDiv.textContent = 'Please wait 1 minute before sending another message.';
            return;
        }
        submitBtn.setAttribute('data-last-click', Date.now());

        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending...';
        statusDiv.textContent = 'Processing your message...';

        const formData = new FormData();
        formData.append('contact-name', document.getElementById('c-name').value.trim());
        formData.append('contact-email', document.getElementById('c-email').value.trim());
        formData.append('contact-phone', document.getElementById('c-phone').value.trim());
        formData.append('contact-subject', document.getElementById('c-subject').value.trim());
        formData.append('contact-message', document.getElementById('c-message').value.trim());

        const result = await fetch(API_URL, { method: 'POST', body: formData }).then(r => r.json());

        if (result.status === 'success') {
            statusDiv.textContent = 'Message sent successfully.';
            e.target.reset();
        } else throw new Error(result.message);
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Message';
    }
}
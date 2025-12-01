// --- 1. GLOBAL STATE & DATA CATALOGS ---
// --- Animated Gradient Background Logic ---
// --- Animated Blob Background Logic ---
// --- Animated Dots Grid Background Logic ---
// --- Animated Diagonal Lines Background Logic ---
// --- Animated Constellation Network Background Logic ---
// --- Section entrance animation logic ---
function animateSections() {
    const sections = document.querySelectorAll('main section');
    const showSection = (section) => {
        section.classList.add('section-visible');
    };
    const onScroll = () => {
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                showSection(section);
            }
        });
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
}
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('section-animate');
    });
    animateSections();
});
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-constellation');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);

    // Constellation config
    const POINTS = 38;
    const DIST = 160;
    const points = Array.from({length: POINTS}).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7
    }));
    let mouse = {x: width/2, y: height/2};

    canvas.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function drawConstellation() {
        ctx.clearRect(0, 0, width, height);
        // Draw lines
        for (let i = 0; i < POINTS; i++) {
            for (let j = i + 1; j < POINTS; j++) {
                const p1 = points[i], p2 = points[j];
                const dx = p1.x - p2.x, dy = p1.y - p2.y;
                const d = Math.sqrt(dx*dx + dy*dy);
                if (d < DIST) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(120,140,180,' + (0.13 + 0.09 * (1 - d/DIST)) + ')';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                    ctx.restore();
                }
            }
        }
        // Draw mouse lines
        points.forEach(p => {
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < DIST * 1.1) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = 'rgba(120,140,180,0.18)';
                ctx.lineWidth = 1.1;
                ctx.stroke();
                ctx.restore();
            }
        });
        // Draw points
        points.forEach(p => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(120,140,180,0.22)';
            ctx.shadowColor = 'rgba(120,140,180,0.18)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        });
    }

    function animate() {
        points.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
        });
        drawConstellation();
        requestAnimationFrame(animate);
    }

    drawConstellation();
    animate();
});

let currentPage = 'home';
let serviceQuery = '';
let serviceCategory = 'all';
let audienceQuery = '';

// Fallback image data URI
const imgFallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'>
    <rect width='100%' height='100%' fill='%23f3f4f6' />
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23888\' font-family=\'Arial,Helvetica,sans-serif\' font-size=\'28\'>Image unavailable</text>
  </svg>
`);

// Central catalog of services (Extracted from JSX)

// Rich audience catalog with detailed fields for audience detail pages
const audienceCatalog = [
    {
        id: 'aud-it',
        title: 'IT Audience',
        logo: '🖥️',
        short: 'Reach 7M+ IT professionals across roles and seniority.',
        image: 'assets/collection-947345-1200x800.jpeg',
        long: 'Technical decision-makers, architects and engineering leaders focused on infrastructure, platform and developer productivity. This audience responds to content that highlights scalability, security, cost savings and integration ease.',
        audienceSize: '7M+',
        segments: ['Developers', 'Engineering Managers', 'DevOps', 'CTO/VP Eng'],
        useCases: ['Drive adoption of developer tools', 'Pitch platform/infra cost optimisation', 'Promote observability and SRE offers'],
        recommendedServices: ['data-enrichment', 'abm', 'demand-generation'],
        kpis: ['Product qualified leads (PQLs)', 'Demo requests', 'Time-to-trial conversion'],
        deliverables: ['Target account list', 'Technical one-pagers & integration guides', 'ABM playbook for enterprise accounts']
    },
    {
        id: 'aud-sales',
        title: 'Sales Audience',
        logo: '🤝',
        short: 'Target sales leaders and revenue teams for pipeline-driven outreach.',
        image: 'assets/collection-1163637-1200x800.jpeg',
        long: 'Revenue leaders and ops teams focused on pipeline, forecasting and GTM efficiency. Messaging that emphasises faster deal velocity, higher win rates and better lead quality resonates well.',
        audienceSize: '1.8M+',
        segments: ['Head of Sales', 'Sales Ops', 'AE/SDR Leads'],
        useCases: ['Improve lead-to-opportunity conversion', 'Automate lead verification & routing', 'Enable sales with tailored playbooks'],
        recommendedServices: ['lead-generation', 'appointment-generation', 'email-marketing'],
        kpis: ['Meetings booked', 'Qualified-to-opportunity rate', 'Pipeline influenced'],
        deliverables: ['Verified lead lists', 'Sales enablement playbooks', 'Sequenced outreach templates']
    },
    {
        id: 'aud-marketing',
        title: 'Marketing Audience',
        logo: '📣',
        short: 'Marketing decision-makers and content leads to amplify campaigns.',
        image: 'assets/collection-1072004-1200x800.jpeg',
        long: 'CMOs, growth and demand-gen leads who prioritise scalable campaigns, content ROI and measurable attribution models. They respond to thought leadership and data-driven case studies.',
        audienceSize: '2.4M+',
        segments: ['CMO', 'Growth Lead', 'Content Marketers'],
        useCases: ['Content syndication for lead gen', 'Nurture flows for trial activation', 'Measurement-driven channel optimisation'],
        recommendedServices: ['content-creation', 'demand-generation', 'email-marketing'],
        kpis: ['MQLs', 'CAC per channel', 'Engagement rate'],
        deliverables: ['Content calendar & briefs', 'Channel mix plan', 'Performance dashboard']
    },
    {
        id: 'aud-finance',
        title: 'Finance Audience',
        logo: '💵',
        short: 'CFOs and finance teams for budgeting and procurement conversations.',
        image: 'assets/collection-1245976-1200x800.jpeg',
        long: 'Financial decision-makers focused on ROI, TCO and procurement cycles. Messaging that centres on cost savings, compliance and measurable ROI wins attention.',
        audienceSize: '650K+',
        segments: ['CFO', 'VP Finance', 'Procurement'],
        useCases: ['Cost-optimisation case studies', 'Procurement-friendly pricing models', 'Compliance & audit readiness'],
        recommendedServices: ['data-enrichment', 'abm'],
        kpis: ['TCO reduction', 'ROI on pilots', 'Procurement cycle time'],
        deliverables: ['ROI case study', 'Procurement pack (SOW, pricing)', 'Risk & compliance summary']
    },
    {
        id: 'aud-health',
        title: 'Healthcare Audience',
        logo: '🩺',
        short: 'Healthcare professionals and decision-makers across clinical & admin roles.',
        image: 'assets/collection-190727-1200x800.jpeg',
        long: 'Clinicians, healthcare administrators and digital health leads who prioritise safety, patient outcomes and regulatory compliance. Trust-building content and validation studies are critical.',
        audienceSize: '1.2M+',
        segments: ['Clinicians', 'Healthcare IT', 'Hospital Admin'],
        useCases: ['Clinical decision support trials', 'Workflow automation for admin tasks', 'Secure data integrations'],
        recommendedServices: ['data-enrichment', 'lead-generation'],
        kpis: ['Trial adoption', 'Clinical validation metrics', 'Integration uptime'],
        deliverables: ['Pilot protocol', 'Integration spec', 'Validation report']
    },
    {
        id: 'aud-hr',
        title: 'HR Audience',
        logo: '👥',
        short: 'HR and people teams for employer branding and talent solutions.',
        image: 'assets/collection-827743-1200x800.jpeg',
        long: 'People and talent leaders focused on employer branding, talent acquisition and employee experience. They value proof points around candidate quality and productivity gains.',
        audienceSize: '900K+',
        segments: ['CHRO', 'Head of Talent', 'Recruiting Leads'],
        useCases: ['Employer branding campaigns', 'Recruiter enablement', 'HR analytics for retention'],
        recommendedServices: ['content-creation', 'demand-generation'],
        kpis: ['Applicants per role', 'Time to hire', 'Offer acceptance rate'],
        deliverables: ['Candidate persona map', 'Campaign assets for employer brand', 'Reporting dashboard']
    },
    {
        id: 'aud-manufacturing',
        title: 'Manufacturing Audience',
        logo: '🏭',
        short: 'Industrial and manufacturing contacts for operations and procurement.',
            image: 'assets/aud-manufacturing-1200x800.jpeg',
        long: 'Operations, plant managers and procurement teams looking for efficiency, predictive maintenance and supplier consolidation. Technical case studies and pilot results drive decisions.',
        audienceSize: '1.1M+',
        segments: ['Plant Ops', 'Maintenance Leads', 'Procurement'],
        useCases: ['Predictive maintenance pilots', 'Supply chain optimisation', 'OEE improvement programs'],
        recommendedServices: ['predict', 'data-enrichment'],
        kpis: ['Downtime reduction', 'OEE uplift', 'Maintenance cost savings'],
        deliverables: ['Pilot plan & sensors spec', 'Integration & data pipeline', 'Savings projection model']
    }
];


// --- Case Studies Catalog (from https://marketledfussion.com/case_studies.html) ---
const caseStudiesCatalog = [
    {
        id: 'cs1',
        client: 'B2B SaaS Platform',
        title: 'Accelerating Pipeline with Intent Data',
        image: 'assets/case-intentdata-1200x800.jpeg',
        challenge: 'Low conversion from inbound leads and lack of account-level insights.',
        solution: 'Deployed intent signal tracking and account scoring to prioritize outreach. Ran ABM pilot with personalized content.',
        results: [
            '3x increase in qualified pipeline',
            '42% faster sales cycle',
            'Pilot scaled to 4 business units'
        ]
    },
    {
        id: 'cs2',
        client: 'FinTech Startup',
        title: 'Product Adoption via Multichannel Activation',
        image: 'assets/case-multichannel-1200x800.jpeg',
        challenge: 'New product struggled to gain traction with target accounts.',
        solution: 'Designed multichannel campaign (email, LinkedIn, webinars) and built custom analytics dashboard for engagement tracking.',
        results: [
            'Doubled product trial signups',
            'Secured 5 enterprise design partners',
            'Reduced CAC by 28%'
        ]
    },
    {
        id: 'cs3',
        client: 'HealthTech Company',
        title: 'Driving Clinical Engagement with Data',
        image: 'assets/case-healthtech-1200x800.jpeg',
        challenge: 'Difficulty engaging clinicians for a new digital health platform.',
        solution: 'Segmented outreach by specialty, created validation studies, and ran targeted webinars with KOLs.',
        results: [
            'Secured 3 hospital pilot sites',
            'Clinician NPS +34',
            'First enterprise contract signed in 10 weeks'
        ]
    },
    {
        id: 'cs4',
        client: 'Enterprise IT Vendor',
        title: 'Scaling ABM for Enterprise Growth',
        image: 'assets/case-abm-1200x800.jpeg',
        challenge: 'Stalled growth in key enterprise segments.',
        solution: 'Built scalable ABM playbooks, automated account selection, and launched personalized nurture journeys.',
        results: [
            'Expanded into 12 new enterprise accounts',
            'Lifted engagement by 67%',
            'Shortened sales cycle by 5 weeks'
        ]
    }
];
/**
 * Injects the case studies into the new case studies section.
 */

// API base for contact submission. Automatically detects localhost or uses current domain
const API_BASE = window.PREFICTION_API_BASE || (
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : window.location.origin
);

/**
 * Attach contact form handler
 */
function attachContactFormHandler() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const statusEl = document.getElementById('contact-status');
    if (!form || !submitBtn || !statusEl) return;

    function setStatus(message, type = 'info') {
        statusEl.textContent = message;
        statusEl.className = 'mt-2 text-sm ' + (type === 'error' ? 'text-red-600' : 'text-green-600');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Get values
        const formData = new FormData(form);
        const name = (formData.get('name') || '').toString().trim();
        const company = (formData.get('company') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        // Basic client-side validation
        if (!name) return setStatus('Please enter your name.', 'error');
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) return setStatus('Please provide a valid email.', 'error');

        submitBtn.disabled = true;
        const originalTxt = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        setStatus('');

        try {
            const res = await fetch(API_BASE + '/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, company, email, message })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = data && data.error ? data.error : 'Failed to submit. Try again later.';
                setStatus(msg, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalTxt;
                return;
            }

            const json = await res.json().catch(() => null);
            setStatus('Thanks! Your message was delivered (we saved it to the local database).');
            form.reset();
        } catch (err) {
            console.error('Contact submit error', err);
            setStatus('Unable to reach the API server. Is it running on localhost:3000?', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalTxt;
        }
    });
}
function injectCaseStudiesContent() {
    const csList = document.getElementById('case-studies-list');
    if (!csList) return;
    csList.innerHTML = caseStudiesCatalog.map(cs => `
        <div class="bg-white rounded-2xl shadow-lg mb-10 overflow-hidden flex flex-col md:flex-row gap-0 md:gap-8 animate-fade-in">
            <div class="md:w-2/5 w-full flex-shrink-0">
                <img src="${cs.image}" alt="${cs.title}" class="w-full h-64 object-cover md:rounded-l-2xl md:rounded-r-none rounded-t-2xl" loading="lazy" onerror="this.onerror=null;this.src='${imgFallback}'" />
            </div>
            <div class="flex-1 p-6 flex flex-col justify-between text-left">
                <div>
                    <div class="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">${cs.client}</div>
                    <h3 class="text-2xl font-extrabold mb-2">${cs.title}</h3>
                    <div class="mb-4">
                        <span class="font-semibold text-gray-700">Challenge:</span> <span class="text-gray-600">${cs.challenge}</span>
                    </div>
                    <div class="mb-4">
                        <span class="font-semibold text-gray-700">Solution:</span> <span class="text-gray-600">${cs.solution}</span>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="font-semibold text-gray-700 mb-1">Results:</div>
                    <ul class="list-disc ml-6 text-gray-700 text-sm">
                        ${cs.results.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `).join('');
}

// --- MISSING: servicesCatalog definition ---
// Add a minimal placeholder if missing to prevent errors and blank cards
if (typeof servicesCatalog === 'undefined') {
    var servicesCatalog = [
        {
            id: 'abm',
            title: 'Account-Based Marketing',
            logo: '🎯',
            short: 'Target high-value accounts with personalized campaigns.',
            image: 'assets/collection-947345-1200x800.jpeg',
            long: 'Drive engagement and pipeline from your best-fit accounts.',
            useCases: ['Personalized outreach', 'Account scoring'],
            deliverables: ['Account list', 'Campaign assets'],
            timeline: '2-4 weeks',
            pricing: 'Fixed or custom',
            kpis: ['Engagement rate', 'Pipeline created'],
            tech: ['CRM', 'Marketing Automation']
        },
        {
            id: 'demand-generation',
            title: 'Demand Generation',
            logo: '🚀',
            short: 'Multi-channel programs to generate qualified pipeline.',
            image: 'assets/collection-1163637-1200x800.jpeg',
            long: 'Run integrated campaigns across email, social, and programmatic to drive demand and fill your pipeline.',
            useCases: ['Lead generation', 'Pipeline acceleration'],
            deliverables: ['Campaign plan', 'Performance dashboard'],
            timeline: '4-8 weeks',
            pricing: 'Retainer or project',
            kpis: ['Leads generated', 'Pipeline value'],
            tech: ['Ad Platforms', 'CRM']
        },
        {
            id: 'lead-generation',
            title: 'Lead Generation',
            logo: '📈',
            short: 'Verified leads for your sales team.',
            image: 'assets/collection-1245976-1200x800.jpeg',
            long: 'Deliver high-quality, verified leads matched to your ICP and ready for sales outreach.',
            useCases: ['Outbound prospecting', 'Event follow-up'],
            deliverables: ['Lead list', 'Contact verification'],
            timeline: '2-6 weeks',
            pricing: 'Per lead or project',
            kpis: ['Leads delivered', 'Conversion rate'],
            tech: ['Data Enrichment', 'CRM']
        },
        {
            id: 'content-creation',
            title: 'Content Creation',
            logo: '✍️',
            short: 'Engaging content for campaigns and nurture.',
            image: 'assets/collection-1072004-1200x800.jpeg',
            long: 'Produce high-impact content assets for every stage of the funnel, from blogs to case studies.',
            useCases: ['Thought leadership', 'Nurture campaigns'],
            deliverables: ['Blog posts', 'Case studies', 'Whitepapers'],
            timeline: '2-8 weeks',
            pricing: 'Per asset or retainer',
            kpis: ['Content engagement', 'Leads influenced'],
            tech: ['CMS', 'Design Tools']
        },
        {
            id: 'data-enrichment',
            title: 'Data Enrichment',
            logo: '💡',
            short: 'Enhance your CRM with fresh, accurate data.',
            image: 'assets/collection-827743-1200x800.jpeg',
            long: 'Append, clean, and enrich your CRM or marketing database for better targeting and segmentation.',
            useCases: ['Account scoring', 'Segmentation'],
            deliverables: ['Enriched data file', 'Segmentation report'],
            timeline: '1-3 weeks',
            pricing: 'Per record or project',
            kpis: ['Data accuracy', 'Segmentation depth'],
            tech: ['Data Providers', 'CRM']
        },
        {
            id: 'appointment-generation',
            title: 'Appointment Generation',
            logo: '📅',
            short: 'Book meetings with qualified prospects.',
            image: 'assets/collection-190727-1200x800.jpeg',
            long: 'End-to-end appointment setting for your sales team, including outreach and qualification.',
            useCases: ['Sales meetings', 'Demo bookings'],
            deliverables: ['Booked meetings', 'Meeting summaries'],
            timeline: '2-6 weeks',
            pricing: 'Per meeting or retainer',
            kpis: ['Meetings booked', 'Show rate'],
            tech: ['Calendaring', 'CRM']
        },
        {
            id: 'email-marketing',
            title: 'Email Marketing',
            logo: '📧',
            short: 'Automated and targeted email campaigns.',
            image: 'assets/collection-947345-1200x800.jpeg',
            long: 'Design, build, and run email campaigns for nurture, product launches, and more.',
            useCases: ['Nurture flows', 'Product announcements'],
            deliverables: ['Email templates', 'Campaign reports'],
            timeline: '2-4 weeks',
            pricing: 'Per campaign or retainer',
            kpis: ['Open rate', 'Click rate'],
            tech: ['Email Platform', 'CRM']
        }
    ];
}

const leadershipList = ["jay.", "mith.", "Rushi."];

const faqList = [
    { id: 1, q: "How do you approach a new engagement?", a: "We start with discovery — KPI alignment, audience mapping, and a small pilot to validate assumptions quickly." },
    { id: 2, q: "Do you help with deal closing?", a: "We focus on generating high-quality pipeline and can support handoffs to sales with playbooks, messaging and verified contact data." },
    { id: 3, q: "What outcomes can we expect?", a: "Expect measurable improvements in lead velocity, conversion rates and clearer signal for product-led growth decisions." }
];

// --- 2. CORE UTILITY FUNCTIONS (SVG, Components) ---

/**
 * Renders an SVG Line Chart string.
 */
function renderSimpleLineChart({ data = [12, 18, 9, 14, 20, 24], stroke = '#f97316' } = {}) {
    const vw = 240;
    const vh = 60;
    const max = Math.max(...data) || 1;
    const points = data.map((d, i) =>
        `${(i / (data.length - 1)) * vw},${vh - (d / max) * vh}`
    ).join(' ');

    return `
        <svg width="100%" height="48" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none" class="rounded-md">
            <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="${stroke}" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="${stroke}" stop-opacity="0" />
                </linearGradient>
            </defs>
            <polyline points="${points}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
            <polygon points="${points} ${vw},${vh} 0,${vh}" fill="url(#g1)" opacity="0.9" />
        </svg>
    `;
}

/**
 * Renders an SVG Bar Chart string. (New for home page)
 */
function renderSimpleBarChart({ data = [40, 60, 35, 80], color = '#fb923c' } = {}) {
    const vw = 240;
    const vh = 60;
    const max = Math.max(...data) || 1;
    const barW = vw / data.length - 8;
    return `
        <svg width="100%" height="48" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="none" class="rounded-md">
            ${data.map((d, i) => {
                const bw = barW;
                const bh = (d / max) * (vh - 10);
                const x = i * (bw + 8) + 4;
                const y = vh - bh;
                return `<rect key="${i}" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4" fill="${color}" opacity="0.95" />`;
            }).join('')}
        </svg>
    `;
}


/**
 * Renders an Animated Card string.
 */
function renderAnimatedCard({ img, title, desc, ctaHTML, linkPage, dataId = '' }) {
    const imageHtml = img
        ? `<img src="${img}" alt="${title}" class="w-full h-44 object-cover" loading="lazy" onerror="this.onerror=null;this.src='${imgFallback}'" />`
        : '';

    // We use a data attribute for filtering later, and ensure the card is clickable
    return `
        <article data-id="${dataId}" class="bg-white rounded-2xl shadow-lg overflow-hidden card-hover-scale cursor-pointer" onclick="setPage('${linkPage}')">
            ${imageHtml}
            <div class="p-6">
                <div class="text-xl font-extrabold">${title}</div>
                <p class="mt-2 text-gray-600 text-sm">${desc}</p>
                <div class="mt-4">${ctaHTML || ''}</div>
            </div>
        </article>
    `;
}

/**
 * Renders an FAQ Item string.
 */
function renderFAQItem({ q, a, id }) {
    return `
        <div id="faq-${id}-container" class="bg-white p-4 rounded-lg shadow-sm border">
            <button onclick="toggleFAQ('${id}')" class="w-full flex items-center justify-between text-left">
                <div class="font-medium">${q}</div>
                <span id="faq-${id}-icon" class="ml-4 text-gray-500 transition-transform duration-250">▼</span>
            </button>
            <div id="faq-${id}-content" class="faq-content text-sm text-gray-600">
                ${a}
            </div>
        </div>
    `;
}

// --- 3. DOM INJECTION FUNCTIONS ---

function injectHomeContent() {
    // 1. Inject Charts (guard DOM writes in case elements were removed)
    const hc1 = document.getElementById('home-chart-1');
    if (hc1) hc1.innerHTML = renderSimpleLineChart();
    const hc2 = document.getElementById('home-chart-2');
    if (hc2) hc2.innerHTML = renderSimpleLineChart({ data: [8, 12, 18, 14, 20, 26] });
    const hc3 = document.getElementById('home-chart-3');
    if (hc3) hc3.innerHTML = renderSimpleBarChart(); // New chart injection

    // 2. Inject Featured Services
    const featuredList = document.getElementById('featured-services-list');
    if (featuredList) {
        featuredList.innerHTML = servicesCatalog.slice(0, 7).map(s => `
            <div onclick="setPage('services-detail-${s.id}')" class="cursor-pointer bg-white rounded-2xl shadow-lg p-6 border border-gray-100 card-hover-scale hover:shadow-xl">
                <div class="text-4xl">${s.logo}</div>
                <div class="text-xl font-extrabold mt-4">${s.title}</div>
                <p class="mt-2 text-gray-600 text-sm">${s.short}</p>
                <div class="mt-4 text-orange-600 font-semibold">Explore &rarr;</div>
            </div>
        `).join('');
    }

    // 3. Inject Featured Audiences (NEW)
    const featuredAudienceList = document.getElementById('featured-audiences-list');
    if (featuredAudienceList) {
        featuredAudienceList.innerHTML = audienceCatalog.slice(0, 7).map(a => `
            <div onclick="setPage('audience-detail-${a.id}')" class="cursor-pointer bg-white rounded-2xl shadow-lg p-6 border border-gray-100 card-hover-scale hover:shadow-xl">
                <div class="text-4xl">${a.logo}</div>
                <div class="text-xl font-extrabold mt-4">${a.title}</div>
                <p class="mt-2 text-gray-600 text-sm">${a.short}</p>
                <div class="mt-4 text-orange-600 font-semibold">Activate &rarr;</div>
            </div>
        `).join('');
    }


    // 4. Inject FAQs
    const faqContainer = document.getElementById('faq-list');
    if (faqContainer) {
        faqContainer.innerHTML = faqList.map(item => renderFAQItem(item)).join('');
    }
}

function injectServicesContent() {
    // 1. Inject Category Tabs
    const categoryTabs = document.getElementById('service-category-tabs');
    // Clear category tabs (we don't show categories by default)
    if (categoryTabs) {
        categoryTabs.innerHTML = '';
    }
    
    // 2. Run initial filter and inject services list
    handleServiceFilter();
}

function handleServiceFilter() {
    const servicesListContainer = document.getElementById('services-list');
    const noResultsMessage = document.getElementById('no-services-message');
    
    const queryInput = document.getElementById('service-query');
    serviceQuery = queryInput ? queryInput.value.trim().toLowerCase() : '';

    // Update Category Tab styles
    document.querySelectorAll('#service-category-tabs button').forEach(button => {
        const cat = button.id.replace('cat-tab-', '');
        if (cat === serviceCategory) {
            button.classList.add('bg-orange-600', 'text-white');
            button.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        } else {
            button.classList.remove('bg-orange-600', 'text-white');
            button.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        }
    });

    const filteredServices = servicesCatalog.filter(s => {
        const q = serviceQuery;
        // Check category first
        const categoryMatch = serviceCategory === 'all' || s.id.includes(serviceCategory.replace(/-/g, ''));
        // Check search query (title, short, long, id)
        const queryMatch = !q || s.title.toLowerCase().includes(q) || s.short.toLowerCase().includes(q) || (s.long && s.long.toLowerCase().includes(q));
        return categoryMatch && queryMatch;
    });

    if (servicesListContainer) {
        if (filteredServices.length === 0) {
            servicesListContainer.innerHTML = '';
            noResultsMessage.classList.remove('hidden');
        } else {
            noResultsMessage.classList.add('hidden');
            servicesListContainer.innerHTML = filteredServices.map(s => renderAnimatedCard({
                img: s.image,
                title: s.title,
                desc: s.short,
                ctaHTML: `<span class="text-orange-600 font-semibold">Learn more &rarr;</span>`,
                linkPage: 'services-detail-' + s.id,
                dataId: s.id
            })).join('');
        }
    }
}

function injectServiceDetail(serviceId) {
    const svc = servicesCatalog.find(s => s.id === serviceId);
    const container = document.getElementById('service-detail-content');
    if (!container) return;
    console.log('injectServiceDetail', serviceId, svc ? svc.image : 'NOT FOUND');
    
    if (!svc) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500">Service not found. <button onclick="setPage('services')" class="text-orange-600">Go back to services</button></div>`;
        return;
    }
    
    // Extracted Service Detail rendering logic
    container.innerHTML = `
        <button onclick="setPage('services')" class="text-sm text-orange-600 mb-4 hover:text-orange-700">&larr; Back to services</button>
        <img src="${svc.image}" alt="${svc.title}" class="w-full h-64 object-cover rounded-lg mb-8" loading="lazy" onerror="this.onerror=null;this.src='${imgFallback}'" />
        <h1 class="text-3xl font-extrabold">${svc.title}</h1>
        <p class="mt-4 text-gray-600">${svc.long}</p>

        <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="font-semibold">Key use cases</div>
                <ul class="mt-3 text-sm text-gray-600 list-disc ml-5">
                    ${(svc.useCases || []).map(u => `<li>${u}</li>`).join('')}
                </ul>

                <div class="mt-6">
                    <div class="font-semibold">Deliverables</div>
                    <ul class="mt-2 text-sm text-gray-600 list-disc ml-5">
                        ${(svc.deliverables || []).map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="bg-white p-6 rounded-lg shadow">
                <div class="font-semibold">Timeline & pricing</div>
                <div class="mt-3 text-sm text-gray-600">
                    <div><strong>Timeline:</strong> ${svc.timeline}</div>
                    <div class="mt-2"><strong>Pricing:</strong> ${svc.pricing}</div>
                </div>

                <div class="mt-6">
                    <div class="font-semibold">KPIs & Tech</div>
                    <div class="mt-2 text-sm text-gray-600">
                        <div class="mb-2"><strong>KPIs:</strong>
                            <ul class="list-disc ml-5 mt-1">
                                ${(svc.kpis || []).map(k => `<li>${k}</li>`).join('')}
                            </ul>
                        </div>
                        <div><strong>Tech / Integrations:</strong>
                            <div class="text-xs text-gray-500 mt-1">${(svc.tech || []).join(', ')}</div>
                        </div>
                    </div>
                </div>

                <div class="mt-6">
                    <button onclick="setPage('contact')" class="bg-orange-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-700">Request proposal</button>
                    <div class="mt-3 text-xs text-gray-500">We can provide fixed-price pilots or time-based engagements.</div>
                </div>
            </div>
        </div>
    `;
}

function injectAudiencesContent() {
    const audienceListContainer = document.getElementById('audience-list');
    const noResultsMessage = document.getElementById('no-audiences-message');
    const queryInput = document.getElementById('audience-query');
    audienceQuery = queryInput ? queryInput.value.trim().toLowerCase() : '';

    const filtered = audienceCatalog.filter(a => {
        const q = audienceQuery;
        if (!q) return true;
        return (a.title && a.title.toLowerCase().includes(q)) || (a.short && a.short.toLowerCase().includes(q)) || (a.long && a.long.toLowerCase().includes(q)) || (a.segments && a.segments.join(' ').toLowerCase().includes(q));
    });

    if (audienceListContainer) {
        if (filtered.length === 0) {
            audienceListContainer.innerHTML = '';
            if (noResultsMessage) noResultsMessage.classList.remove('hidden');
        } else {
            if (noResultsMessage) noResultsMessage.classList.add('hidden');
            audienceListContainer.innerHTML = filtered.map(a => renderAnimatedCard({
                img: a.image,
                title: a.title,
                desc: a.short,
                ctaHTML: `<span class="text-orange-600 font-semibold">Learn more &rarr;</span>`,
                linkPage: 'audience-detail-' + a.id,
                dataId: a.id
            })).join('');
        }
    }
}

function handleAudienceFilter() {
    injectAudiencesContent();
}

function clearAudienceFilter() {
    const queryInput = document.getElementById('audience-query');
    if (queryInput) queryInput.value = '';
    audienceQuery = '';
    injectAudiencesContent();
}

function injectAudienceDetail(audienceId) {
    const aud = audienceCatalog.find(a => a.id === audienceId);
    const container = document.getElementById('audience-detail-content');
    if (!container) return;

    if (!aud) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500">Audience not found. <button onclick="setPage('audience')" class="text-orange-600">Go back to audiences</button></div>`;
        return;
    }

    // Detailed Audience Detail rendering logic
    container.innerHTML = `
        <button onclick="setPage('audience')" class="text-sm text-orange-600 mb-4 hover:text-orange-700">&larr; Back to audiences</button>
        <div class="grid gap-8 lg:grid-cols-3">
            <div class="lg:col-span-2">
                <img src="${aud.image}" alt="${aud.title}" class="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" onerror="this.onerror=null;this.src='${imgFallback}'" />
                <h1 class="text-3xl font-extrabold">${aud.title}</h1>
                <p class="mt-4 text-gray-600">${aud.long}</p>

                <div class="mt-8 grid gap-6 sm:grid-cols-2">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="font-semibold">Audience Snapshot</div>
                        <div class="mt-3 text-sm text-gray-600">
                            <div><strong>Estimated size:</strong> ${aud.audienceSize || '—'}</div>
                            <div class="mt-2"><strong>Key segments:</strong> ${(aud.segments || []).join(', ')}</div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-lg shadow">
                        <div class="font-semibold">Primary Use Cases</div>
                        <ul class="mt-3 text-sm text-gray-600 list-disc ml-5">
                            ${(aud.useCases || []).map(u => `<li>${u}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="mt-8 bg-white p-6 rounded-lg shadow">
                    <div class="font-semibold">Recommended Approach</div>
                    <div class="mt-3 text-sm text-gray-600">We typically recommend a focused pilot targeting a small set of high-fit accounts or segments to validate messaging and channels before scaling. For this audience, we suggest combining intent-driven ABM with personalized nurture flows.</div>
                </div>
            </div>

            <aside class="lg:col-span-1">
                <div class="bg-white p-6 rounded-lg shadow">
                    <div class="font-semibold">Recommended Services</div>
                    <div class="mt-3 space-y-2 text-sm text-gray-600">
                        ${(aud.recommendedServices || []).map(sid => {
                            const svc = servicesCatalog.find(s => s.id === sid);
                            return `<div class="flex items-start gap-3"><div class="text-2xl">${svc ? svc.logo : '🔹'}</div><div><div class="font-medium">${svc ? svc.title : sid}</div><div class="text-xs text-gray-500 mt-1">${svc ? svc.short : ''}</div><div class="mt-2"><button onclick="setPage('services-detail-${sid}')" class="text-orange-600 text-sm">View service &rarr;</button></div></div></div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="mt-6 bg-white p-6 rounded-lg shadow">
                    <div class="font-semibold">Target KPIs</div>
                    <ul class="mt-3 text-sm text-gray-600 list-disc ml-5">
                        ${(aud.kpis || []).map(k => `<li>${k}</li>`).join('')}
                    </ul>
                </div>

                <div class="mt-6 bg-white p-6 rounded-lg shadow">
                    <div class="font-semibold">Deliverables</div>
                    <ul class="mt-3 text-sm text-gray-600 list-disc ml-5">
                        ${(aud.deliverables || []).map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>

                <div class="mt-6">
                    <button onclick="setPage('contact')" class="w-full bg-orange-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-700">Request a scoped pilot</button>
                </div>
            </aside>
        </div>
    `;
}

function injectProductsContent() {
    const productsListContainer = document.getElementById('products-list');
    if (productsListContainer) {
        productsListContainer.innerHTML = productCatalog.map(p => renderAnimatedCard({
            img: p.img,
            title: p.title,
            desc: p.summary,
            ctaHTML: `<span class="text-orange-600 font-semibold">Learn more &rarr;</span>`,
            linkPage: 'products-detail-' + p.id,
            dataId: p.id
        })).join('');
    }
}

function injectProductDetail(productId) {
    const prod = productCatalog.find(p => p.id === productId);
    const container = document.getElementById('product-detail-content');
    if (!container) return;

    if (!prod) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500">Product not found. <button onclick="setPage('products')" class="text-orange-600">Go back to products</button></div>`;
        return;
    }

    // Extracted Product Detail rendering logic
    container.innerHTML = `
        <button onclick="setPage('products')" class="text-sm text-orange-600 mb-4 hover:text-orange-700">&larr; Back to products</button>
        <img src="${prod.img}" alt="${prod.title}" class="w-full h-64 object-cover rounded-lg mb-8" loading="lazy" onerror="this.onerror=null;this.src='${imgFallback}'" />
        <h1 class="text-3xl font-extrabold">${prod.title}</h1>
        <p class="mt-4 text-gray-600">Detailed product description, use-cases, pricing models, and how to integrate with your stack. ${prod.summary}</p>

        <div class="mt-8">
            <button onclick="setPage('contact')" class="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md">Contact sales</button>
        </div>
    `;
}

function injectAboutContent() {
    const leadershipContainer = document.getElementById('about-leadership-list');
    if (leadershipContainer) {
        leadershipContainer.innerHTML = leadershipList.map(name => {
            const initial = name.split(' ')[0][0];
            const role = "Role"; // Placeholder from original JSX
            return `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-semibold">${initial}</div>
                    <div>
                        <div class="font-medium">${name}</div>
                        <div class="text-xs text-gray-500">${role}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}


// --- 4. VANILLA JS CORE LOGIC (State and DOM manipulation) ---

/**
 * The core function to switch pages using CSS classes on static HTML elements.
 */
function setPage(newPage) {
    let newPageId = newPage;
    let detailId = null;

    // Handle detail pages (e.g., services-detail-abm)
    if (newPage.startsWith('services-detail-')) {
        detailId = newPage.replace('services-detail-', '');
        newPageId = 'services-detail'; 
        injectServiceDetail(detailId);
    } else if (newPage.startsWith('audience-detail-')) {
        detailId = newPage.replace('audience-detail-', '');
        newPageId = 'audience-detail';
        injectAudienceDetail(detailId);
    } else if (newPage.startsWith('products-detail-')) {
        detailId = newPage.replace('products-detail-', '');
        newPageId = 'products-detail';
        injectProductDetail(detailId);
    }

    const oldPageElement = document.getElementById(`page-${currentPage}`);
    const newPageElement = document.getElementById(`page-${newPageId}`);

    if (!newPageElement) {
        console.error(`Page element with ID 'page-${newPageId}' not found.`);
        return;
    }

    // 1. Start Exit Transition for Old Page (if any)
    const TRANSITION_MS = 320; // match CSS 0.3s transition
    if (oldPageElement) {
        oldPageElement.classList.remove('page-active');
        oldPageElement.classList.add('page-exit');
        oldPageElement.style.zIndex = 1;
        oldPageElement.style.visibility = 'visible';
    }


    // 2. Prepare New Page: ensure it participates in layout and is in flow
    newPageElement.style.display = 'block';
    newPageElement.classList.add('page-enter');
    newPageElement.classList.remove('page-exit');
    newPageElement.style.position = 'relative';
    newPageElement.style.zIndex = '';
    newPageElement.style.visibility = 'visible';

    // 3. Update state and scroll to top
    currentPage = newPageId;
    window.scrollTo({ top: 0, behavior: 'auto' });

    // 4. Final Activation after transition completes
    setTimeout(() => {
        // clean enter state and activate
        newPageElement.classList.remove('page-enter'); 
        newPageElement.classList.add('page-active');
        newPageElement.style.position = 'relative';
        newPageElement.style.zIndex = '';
        newPageElement.style.visibility = '';

        // hide the old page from layout after exit transition
        if (oldPageElement && oldPageElement !== newPageElement) {
            oldPageElement.classList.remove('page-exit');
            oldPageElement.style.display = 'none';
            oldPageElement.style.position = '';
            oldPageElement.style.zIndex = '';
            oldPageElement.style.visibility = '';
        }
    }, TRANSITION_MS);

    // 5. Update Navigation styles
    updateNavStyles(newPageId);

    // 6. Special actions on page change (Content Injection)
    if (newPageId === 'services') {
        injectServicesContent();
    } else if (newPageId === 'audience') {
        injectAudiencesContent();
    } else if (newPageId === 'products') {
        injectCaseStudiesContent();
    } else if (newPageId === 'about') {
        injectAboutContent();
    }
}

/**
 * Toggles the open/closed state of an FAQ item.
 */
function toggleFAQ(id) {
    const content = document.getElementById(`faq-${id}-content`);
    const icon = document.getElementById(`faq-${id}-icon`);
    
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('open');
        icon.style.transform = 'rotate(180deg)';
    }
}

/**
 * Updates the service category filter and triggers a re-render of the Services page list.
 */
function setServiceCategory(category) {
    serviceCategory = category;
    handleServiceFilter();
}

/**
 * Clears the service search query and re-runs the filter.
 */
function clearServiceFilter() {
    const queryInput = document.getElementById('service-query');
    if(queryInput) queryInput.value = '';
    serviceQuery = '';
    handleServiceFilter();
}

/**
 * Updates the active class on navigation buttons.
 */
function updateNavStyles(activePage) {
    const rootPage = activePage.split('-')[0]; // services-detail -> services
    
    // Desktop Nav
    document.querySelectorAll('nav button[id^="nav-"]').forEach(btn => {
        const btnPage = btn.id.replace('nav-', '');
        if (btnPage === rootPage) {
            btn.classList.add('nav-active');
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.classList.remove('nav-active');
            btn.removeAttribute('aria-current');
        }
    });

    // Mobile Nav
    // Desktop buttons (nav-*) are handled above

    // Mobile select remains for legacy; also update mobile drawer buttons if present
    const mobileSelect = document.getElementById('mobile-nav-select');
    if (mobileSelect) {
        mobileSelect.value = rootPage;
    }

    document.querySelectorAll('#mobile-nav-drawer button[id^="m-nav-"]').forEach(btn => {
        const btnPage = btn.id.replace('m-nav-', '');
        if (btnPage === rootPage) {
            btn.classList.add('nav-active');
            btn.setAttribute('aria-current', 'page');
        } else {
            btn.classList.remove('nav-active');
            btn.removeAttribute('aria-current');
        }
    });
}

// --- Mobile nav toggle functions ---
function openMobileNav() {
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');
    const btn = document.getElementById('mobile-menu-button');
    if (overlay && drawer) {
        overlay.classList.add('open');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        // Add staggered pop animation to menu items
        const items = Array.from(drawer.querySelectorAll('.px-4 button'));
        items.forEach((it, i) => {
            // clear previous animations first
            it.style.animation = 'none';
            // force reflow to restart animation
            // eslint-disable-next-line no-unused-expressions
            it.offsetHeight;
            it.style.animation = `mobile-pop 320ms cubic-bezier(.2,.9,.2,1) ${i * 70}ms both`;
        });
        // Add Escape key listener to close
        document.addEventListener('keydown', mobileKeydownHandler);
    }
}

function closeMobileNav() {
    const overlay = document.getElementById('mobile-nav-overlay');
    const drawer = document.getElementById('mobile-nav-drawer');
    const btn = document.getElementById('mobile-menu-button');
    if (overlay && drawer) {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        // clear animations
        const items = Array.from(drawer.querySelectorAll('.px-4 button'));
        items.forEach(it => {
            it.style.animation = '';
        });
        // remove Escape key listener
        document.removeEventListener('keydown', mobileKeydownHandler);
    }
}

function mobileKeydownHandler(e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
        closeMobileNav();
    }
}

function toggleMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    if (!drawer) return;
    if (drawer.classList.contains('open')) closeMobileNav(); else openMobileNav();
}

/**
 * Initializes the application on page load.
 */
function initApp() {
    // Inject dynamic content that is independent of current page
    injectHomeContent();
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Set initial page state
    const initialPage = 'home'; // Start on home
    
    // Set all pages to non-active state initially
    // Hide all pages initially so only active one occupies layout
    document.querySelectorAll('main .page-transition').forEach(el => {
        el.classList.remove('page-active');
        el.classList.add('page-enter'); // Use enter state to start hidden
        el.style.display = 'none';
    });

    // Manually activate the initial page (Home)
    const homePage = document.getElementById('page-home');
    if (homePage) {
        homePage.style.display = 'block';
        homePage.classList.remove('page-enter');
        homePage.classList.add('page-active');
    }

    updateNavStyles(initialPage);

    // Attach the contact handler (if on page or form present)
    attachContactFormHandler();
}
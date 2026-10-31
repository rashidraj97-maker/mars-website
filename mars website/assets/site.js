/* MARS Training & Solution – website script */

/* ===== Settings you may change ===== */
const SITE = {
  // Link to your enquiry / enroll app (hosted on Cloudflare at app.marstraining.in).
  // Leave as it is and the Enquire buttons open WhatsApp instead.
  enquiryApp: 'https://app.marstraining.in',
  whatsapp: '919870259245',
  phone: '+91 98702 59245',
  email: 'contactus@marstraining.in',
  // Apps Script web app link (the same /exec link as in the enquiry app's config.js). Trainer applications are saved to the sheet through it.
  api: 'https://script.google.com/macros/s/AKfycbyXxbiBJtACn_OVfPzgAOb0vXe2xJJZUjW0ouAekolDCbmyvLh4OVPH4QVZKEcaXm72/exec'
};

/* ===== Course catalogue (shown on courses.html and the home page) ===== */
const COURSES = [
  ["Office & Productivity", "MS PowerPoint", "Create impactful, professional presentations with templates, SmartArt, charts, multimedia and animation (14 hours).", "", "1.5 months"],
  ["Office & Productivity", "MS Word", "Work with Microsoft Word professionally: advanced formatting, styles, tables, long documents, templates and mail merge (12 hours).", "", "1.5 months"],
  ["Office & Productivity", "MS Outlook", "Manage email, calendar, contacts and tasks efficiently in Microsoft Outlook (12 hours).", "", "1.5 months"],
  ["Office & Productivity", "MS Access", "Design and use Access databases: tables, relationships, queries, forms, reports and basic automation.", "", "2.5 months"],
  ["Office & Productivity", "MS Office", "A complete 6-month (about 56 hours) MS Office program: Excel from basic to advanced, PowerPoint and Word for everyday office work.", "", "5 months"],
  ["Office & Productivity", "MS Project (MSP)", "Plan, schedule, track and report projects in Microsoft Project, from first plan to progress reports (16 hours).", "", "2.5 months"],
  ["Office & Productivity", "Libre Office (Calc-Excel)", "Advanced spreadsheets in LibreOffice Calc: formulas, lookups, data cleaning, pivot tables and professional reports.", "", "2.5 months"],
  ["Office & Productivity", "Libre Office (Writer-Word)", "Create professional documents in LibreOffice Writer: styles, tables, long documents, templates and mail merge.", "", "1.5 months"],
  ["Office & Productivity", "Libre Office (Presentation-PPT)", "Build professional presentations in LibreOffice Impress with masters, charts, multimedia and animations.", "", "1.5 months"],
  ["Office & Productivity", "Open Office (Calc-Excel)", "Advanced spreadsheets in OpenOffice Calc: formulas, lookups, data cleaning, pivot tables and professional reports.", "", "2.5 months"],
  ["Office & Productivity", "Open Office (Writer-Word)", "Create professional documents in OpenOffice Writer: styles, tables, long documents, templates and mail merge.", "", "1.5 months"],
  ["Office & Productivity", "Open Office (Presentation-PPT)", "Build professional presentations in OpenOffice Impress with masters, charts, multimedia and animations.", "", "1.5 months"],
  ["Office & Productivity", "Basics of Computer", "Computer fundamentals for beginners: Windows, files and folders, internet and email, plus basic Word and Excel (24 hours).", "", "2.5 months"],
  ["Data & Analytics", "Advanced Excel", "Master advanced Excel for analysis and MIS: complex formulas, lookups, dynamic arrays, data cleaning and professional reports and dashboards (24 hours).", "Popular", "2.5 months"],
  ["Data & Analytics", "Basic Excel", "Build a strong Excel foundation: worksheets, cell references, everyday formulas, sorting, filtering and formatting (8 hours).", "Popular", "1.5 months"],
  ["Data & Analytics", "SQL", "Microsoft SQL Server from basics to advanced analytics, with Python integration and AI-assisted query writing (20 hours).", "", "2.5 months"],
  ["Data & Analytics", "Power BI", "Turn raw data into interactive dashboards with Power BI Desktop and Service: Power Query, data modelling, DAX and sharing (20 hours).", "", "2.5 months"],
  ["Data & Analytics", "Tableau", "Visual analytics in Tableau Desktop: connect data, build charts, maps and calculations, and design interactive dashboards (24 hours).", "", "2.5 months"],
  ["Data & Analytics", "Data Analytics", "A 10-month career program covering Advanced Excel, VBA, Power BI, SQL, statistics and Python for data analysis, with projects.", "", "10 months"],
  ["Data & Analytics", "Data Analytics with AI", "The Data Analytics career program with AI tools added: Excel, VBA, Power BI, SQL and Python, plus AI for faster analysis and reporting (12 months).", "", "12 months"],
  ["Data & Analytics", "Business Analytics", "A 12-month program: Excel, VBA, Power BI, SQL, Python, statistics and machine learning applied to business decisions.", "", "10 months"],
  ["Data & Analytics", "Business Analytics with Gen AI", "Business Analytics with Generative AI: Excel, Power BI, SQL, Python and machine learning, supported by AI tools for faster insight.", "", "12 months"],
  ["Data & Analytics", "MIS Specialist", "A 6-month MIS program: Advanced Excel, VBA automation and Power BI to build automated MIS reports and dashboards.", "", "6 months"],
  ["Data & Analytics", "MIS with Gen AI", "The MIS Specialist program with Generative AI: Excel, VBA and Power BI reports built faster with AI tools (7 months).", "", "7 months"],
  ["Data & Analytics", "Power Query", "Import, clean, combine and automate data in Excel Power Query, the first half of the Power Query & Power Pivot course.", "", "1 month"],
  ["Data & Analytics", "Power Pivot", "Build data models, write DAX and create interactive dashboards with Excel Power Pivot, the second half of the Power Query & Power Pivot course.", "", "1 month"],
  ["Automation & Google", "Google Sheets with App script (AUTOMATION)", "A job-oriented program (45–50 hours) on Google Sheets, Forms, Apps Script, web apps and Looker Studio, ending with an end-to-end business automation project.", "New", "3.5 months"],
  ["Automation & Google", "Google sheets With Looker Studio", "Google Sheets from basic to advanced, connected to Looker Studio for live, shareable dashboards.", "", "3.5 months"],
  ["Automation & Google", "VBA/Macros", "Automate Excel with VBA: macros, procedures, loops, user forms, ribbon tabs and your own add-ins (20 hours).", "", "2.5 months"],
  ["Automation & Google", "MS Power Apps", "Build business apps on the Microsoft Power Platform with Power Apps, SharePoint, Dataverse and Power Automate.", "", "2 months"],
  ["Automation & Google", "MS PowerAutomate", "Automate everyday work across Microsoft 365 with Power Automate cloud flows, approvals and Excel/Outlook/Forms automation.", "", "2 months"],
  ["Automation & Google", "Google Sheet", "Google Sheets from basics to advanced: formulas, lookups, QUERY, pivot tables, charts and collaboration.", "", "2.5 months"],
  ["Automation & Google", "Google sheet with Google Form", "Collect data with Google Forms and analyse it in Google Sheets with formulas, pivots and automated reports.", "", "3.5 months"],
  ["AI & Programming", "Python with AI", "Python for data analytics (24 hours): programming basics, NumPy, Pandas, visualisation and statistics, with AI tools to code faster.", "", "3 months"],
  ["AI & Programming", "Gen AI", "Use Generative AI with MS Office: write Excel formulas, analyse data, create presentations and documents in minutes. No coding needed.", "", "1 month"],
  ["AI & Programming", "Machine Learning (ML)", "Machine learning with Python (20 hours): the maths, key algorithms and the full lifecycle to train, evaluate and use models.", "", "2.5 months"],
  ["AI & Programming", "Web App Development (Full Stack)", "Build and deploy web applications end to end: HTML, CSS and JavaScript front end, back end, database and hosting.", "", "2 months"],
  ["AI & Programming", "Claude AI", "Practical Generative AI for business teams: Claude, ChatGPT, Gemini and Grok, prompt design, document and data workflows, and responsible use.", "", "2 months"],
  ["ERP & Accounting", "Tally", "Accounting and GST in TallyPrime: company setup, vouchers, inventory, GST returns and financial reports.", "", "2 months"],
  ["ERP & Accounting", "SAP FICO", "SAP Financial Accounting and Controlling in S/4HANA/ECC: configuration, transactions and management reporting.", "", "2 months"],
  ["ERP & Accounting", "SAP Business One", "SAP Business One ERP for small and mid-size companies: sales, purchasing, inventory, finance and production (20–22 hours). Practice software provided.", "", "2 months"],
  ["ERP & Accounting", "SAP MM (User Level)", "SAP S/4HANA Materials Management for end users (30 hours): master data, the full procurement cycle and inventory.", "", "2 months"],
  ["ERP & Accounting", "SAP MM (Consultant Level)", "SAP MM consultant training (60 hours): configuration of enterprise structure, procure-to-pay, inventory, pricing and S/4HANA specifics.", "", "3.5 months"],
  ["ERP & Accounting", "SAP SD (User Level)", "SAP S/4HANA Sales & Distribution for end users (18–20 hours): the complete order-to-cash process.", "", "2 months"],
  ["ERP & Accounting", "SAP SD (Consultant Level)", "SAP SD consultant training (30–35 hours): O2C configuration, pricing, shipping, billing and integration with MM and FI.", "", "3.5 months"],
  ["ERP & Accounting", "NetSuite", "Oracle NetSuite cloud ERP (50 hours): accounting, order-to-cash, procure-to-pay, inventory, CRM, reporting and dashboards.", "", "3 months"],
  ["Career Skills", "Career Communication & Interview Skills Program", "A 4-month program to build spoken English, confidence and interview skills for the workplace.", "", "3 months"]
].map(([cat, title, desc, badge, dur]) => ({ cat, title, desc, badge, dur }));

/* Programs made of several modules: shown as chips on the course card and in a "Modules" window */
const MOD_INFO = {
  'Advanced Excel': ['XL', '#16A34A', 'Formulas, lookups, pivot tables, dashboards and MIS reports'],
  'Excel VBA': ['VBA', '#0F766E', 'Macros, loops, user forms and one-click report automation'],
  'Power BI': ['BI', '#CA8A04', 'Power Query, data modelling, DAX and interactive dashboards'],
  'SQL': ['SQL', '#2563EB', 'Queries, joins, aggregations and analysis in SQL Server'],
  'Python': ['PY', '#4F46E5', 'Python, NumPy, Pandas and data visualisation'],
  'Machine Learning': ['ML', '#9333EA', 'Statistics, key algorithms and building predictive models'],
  'Generative AI': ['AI', '#DB2777', 'ChatGPT, Claude and Copilot for analysis, reports and automation'],
  'MS Word': ['W', '#1D4ED8', 'Professional documents, styles, tables, templates and mail merge'],
  'MS PowerPoint': ['P', '#C2410C', 'Impactful presentations with SmartArt, charts and animation'],
  'MS Excel': ['X', '#15803D', 'Excel from basics to advanced: formulas, lookups and pivots']
};
const DA = ['Advanced Excel', 'Excel VBA', 'Power BI', 'SQL', 'Python'], MIS = ['Advanced Excel', 'Excel VBA', 'Power BI'];
const MODULES = {
  'data analytics': DA, 'data analytics with ai': DA.concat('Generative AI'),
  'business analytics': DA.concat('Machine Learning'), 'business analytics with gen ai': DA.concat('Machine Learning', 'Generative AI'),
  'mis specialist': MIS, 'mis with gen ai': MIS.concat('Generative AI'),
  'ms office': ['MS Word', 'MS PowerPoint', 'MS Excel']
};
const modulesFor = title => MODULES[normT(title)] || null;
const modChips = l => `<div class="mods">${l.map(m => { const i = MOD_INFO[m] || ['', '#334155']; return `<span style="--mc:${i[1]}">${esc(m)}</span>`; }).join('<i>+</i>')}</div>`;
function showModules(c) {
  const l = modulesFor(c.title); if (!l) return;
  let mw = $('#mw');
  if (!mw) {
    mw = document.createElement('div'); mw.className = 'mw'; mw.id = 'mw'; mw.hidden = true;
    mw.setAttribute('role', 'dialog'); mw.setAttribute('aria-modal', 'true');
    document.body.appendChild(mw);
    const close = () => { mw.hidden = true; document.body.style.overflow = ''; };
    mw.addEventListener('click', e => { if (e.target === mw || e.target.closest('.x')) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !mw.hidden) close(); });
  }
  const out = outlineFor(c.title);
  mw.setAttribute('aria-label', c.title + ' modules');
  mw.innerHTML = `<div class="card"><button type="button" class="x" aria-label="Close">×</button>
    <small>${esc(c.cat)}${c.dur ? ' · ' + esc(c.dur) : ''}</small><h3>${esc(c.title)}</h3>
    <p class="sub">${l.length} modules in one program, taught in this order</p>
    <ol>${l.map((m, k) => { const i = MOD_INFO[m] || ['•', '#334155', '']; return `<li style="--mc:${i[1]}"><b class="ic">${esc(i[0])}</b><div><span class="n">Module ${k + 1}</span><strong>${esc(m)}</strong>${i[2] ? `<em>${esc(i[2])}</em>` : ''}</div></li>`; }).join('')}</ol>
    <div class="act">${out ? `<a class="btn ghost" href="${esc(out)}" download rel="noopener">Download full outline</a>` : ''}<a class="btn" href="${esc(enquire(c.title))}" target="_blank" rel="noopener">Enquire about this program</a><a class="btn en" href="${esc(enroll(c.title))}" target="_blank" rel="noopener">Enroll now</a></div></div>`;
  mw.hidden = false; document.body.style.overflow = 'hidden'; $('.x', mw).focus();
}

/* Scrolling offer line at the top of every page: running offers from the "Offers" tab (same as the app) */
function offerBar() {
  if (!/^https:\/\/script\.google\.com\//.test(SITE.api) || $('#obar')) return;
  const show = list => {
    const t = (list || []).map(o => String(o.text || '').trim()).filter(Boolean);
    if (!t.length || $('#obar')) return;
    const one = t.map(x => `<span>${esc(x)}</span>`).join('<i aria-hidden="true">✦</i>') + '<i aria-hidden="true">✦</i>';
    const bar = document.createElement('a');
    bar.className = 'obar'; bar.id = 'obar'; bar.target = '_blank'; bar.rel = 'noopener';
    bar.href = hasApp ? SITE.enquiryApp.replace(/\/?$/, '/') + '#courses' : wa('Hi MARS, I would like to know about your current offer.');
    bar.setAttribute('aria-label', 'Current offers: ' + t.join('. ') + '. Open the app to enroll.');
    bar.innerHTML = `<b class="ol">Offer</b><span class="ow"><span class="ot" style="--n:${t.join(' ').length}">${one}${one}</span></span><span class="oc">Enroll now →</span>`;
    document.body.insertBefore(bar, document.body.firstChild);
  };
  try { const c = JSON.parse(sessionStorage.getItem('mars_offers1') || 'null'); if (c && Date.now() - c.at < 10 * 60e3) return show(c.l); } catch (e) {}
  fetch(SITE.api + '?action=offers').then(r => r.json()).then(d => {
    const l = (d && d.ok && d.offers) || [];
    try { sessionStorage.setItem('mars_offers1', JSON.stringify({ at: Date.now(), l })); } catch (e) {}
    show(l);
  }).catch(() => {});
}

/* ===== Shared behaviour ===== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hasApp = /^https:\/\//.test(SITE.enquiryApp);
const wa = msg => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg || 'Hi MARS, I would like to know more about your courses.')}`;
const enquire = course => hasApp ? SITE.enquiryApp.replace(/\/?$/, '/') + '#enquire' : wa(course ? `Hi MARS, I would like to know more about ${course}.` : '');
const enroll = course => hasApp ? SITE.enquiryApp.replace(/\/?$/, '/') + '#enroll' : wa(course ? `Hi MARS, I would like to enroll in ${course}.` : 'Hi MARS, I would like to enroll in a course.');

document.addEventListener('DOMContentLoaded', () => {
  offerBar();
  // menu on phones
  const nav = $('#nav'), burger = $('#burger');
  if (burger) burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', 'false'); }));
  // enquire buttons
  // Enquire and Enroll Now always open in a new browser tab, so the website stays open
  $$('[data-enquire]').forEach(a => { a.href = a.dataset.enroll !== undefined && !hasApp ? wa('Hi MARS, I would like to enroll in a course.') : enquire(a.dataset.enquire); if (hasApp && a.dataset.enroll !== undefined) a.href = SITE.enquiryApp.replace(/\/?$/, '/') + '#enroll'; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-wa]').forEach(a => { a.href = wa(); });
  if (hasApp) $$('[data-getapp]').forEach(a => { a.href = SITE.enquiryApp.replace(/\/?$/, '/') + '?install=1#courses'; });
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });
  // header shadow once the page scrolls
  const head = $('.head'), onScroll = () => head && head.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // reveal on scroll
  const rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(el => io.observe(el));
  } else rv.forEach(el => el.classList.add('in'));
  // ISO certificate viewer
  const iso = $('#isoDlg');
  $$('[data-iso]').forEach(b => b.addEventListener('click', () => { if (iso && iso.showModal) iso.showModal(); else window.open('assets/iso-certificate.pdf', '_blank'); }));
  if (iso) { $$('[data-isoclose]', iso).forEach(b => b.onclick = () => iso.close()); iso.addEventListener('click', e => { if (e.target === iso) iso.close(); }); }
  if (document.body.dataset.page === 'home') { home(); demosHome(); }
  if (document.body.dataset.page === 'courses') coursesPage();
  if (document.body.dataset.page === 'gallery') galleryPage();
  if (document.body.dataset.page === 'join') joinPage();
  if (document.body.dataset.page === 'corporate') corporatePage();
  if (document.body.dataset.page === 'jobs') jobsPage('#jobsAll', 0);
  if (document.body.dataset.page === 'home') jobsPage('#jobsHome', 3);
  if (document.body.dataset.page === 'home') trainersSection();
});

/* Home: the formula bar types the formula behind the selected cell */
function home() {
  const f = $('#fx'), text = '=SUMIFS(Sales[Amount],Sales[Region],"East")';
  if (f && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let i = 0; f.textContent = '';
    const t = setInterval(() => { f.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(t); $$('.grid .later').forEach(c => c.classList.add('fill')); } }, 45);
  } else if (f) f.textContent = text;
  // client marquee: duplicate the names so the loop is seamless
  const tr = $('#track'); if (tr) tr.innerHTML += tr.innerHTML;
  // count-up numbers
  const fmt = n => n.toLocaleString('en-IN');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, t0 = performance.now();
    const step = t => { const p = Math.min(1, (t - t0) / 1400); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $$('[data-to]').forEach(e => cio.observe(e));
  // testimonial arrows
  const qs = $('#quotes');
  if (qs) {
    const by = d => { const c = qs.querySelector('.q'); qs.scrollBy({ left: d * (c.offsetWidth + 20), behavior: 'smooth' }); };
    $('#qprev').addEventListener('click', () => by(-1));
    $('#qnext').addEventListener('click', () => by(1));
  }
  // course counts on the category cards
  $$('[data-count]').forEach(e => { const n = COURSES.filter(c => c.cat === e.dataset.count).length; e.textContent = n + (n === 1 ? ' course' : ' courses'); });
  $$('[data-list]').forEach(e => { e.innerHTML = COURSES.filter(c => c.cat === e.dataset.list).slice(0, 6).map(c => `<span>${esc(c.title)}</span>`).join(''); });
}

/* Course outline PDFs come from the Courses tab (Outline PDF column) through the Apps Script API */
const OUTLINE_ALIAS = { 'advanced excel for data analysis': 'advanced excel', 'sql for data analytics': 'sql', 'google sheets with automation': 'google sheets with app script automation',
  'mis excel dashboard': 'mis specialist', 'ms office 365': 'ms office', 'ms excel': 'advanced excel', 'mis': 'mis specialist',
  'google app script': 'google sheets with app script automation', 'sap sd sales and distribution': 'sap sd user level',
  'basic intermediate computer': 'basics of computer', 'libre office': 'libre office calc excel', 'open office': 'open office calc excel' };
const normT = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
let OUTLINES = {};
function loadOutlines() {
  if (!/^https:\/\/script\.google\.com\//.test(SITE.api)) return Promise.resolve();
  try { const c = JSON.parse(sessionStorage.getItem('mars_outlines2') || 'null'); if (c && Date.now() - c.at < 30 * 60e3) { OUTLINES = c.o; return Promise.resolve(); } } catch (e) {}
  return fetch(SITE.api + '?action=outlines').then(r => r.json()).then(d => {
    OUTLINES = {}; Object.entries((d && d.outlines) || {}).forEach(([t, u]) => { if (/^https:\/\//.test(u)) OUTLINES[normT(t)] = u; });
    try { sessionStorage.setItem('mars_outlines2', JSON.stringify({ at: Date.now(), o: OUTLINES })); } catch (e) {}
  }).catch(() => {});
}
const outlineFor = title => { const n = normT(title); return OUTLINES[n] || OUTLINES[OUTLINE_ALIAS[n]] || ''; };

/* Courses page: search + category filter */
function coursesPage() {
  const cats = ['All', ...new Set(COURSES.map(c => c.cat))];
  const params = new URLSearchParams(location.search);
  let cat = cats.includes(params.get('cat')) ? params.get('cat') : 'All';
  const q = $('#q'), chips = $('#chips'), list = $('#list'), count = $('#count');
  chips.innerHTML = cats.map(c => `<button type="button" data-c="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.c; $$('button', chips).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  q.addEventListener('input', draw);
  list.addEventListener('click', e => { const a = e.target.closest('[data-mods]'); if (!a) return; e.preventDefault(); showModules(COURSES.find(c => c.title === a.dataset.mods)); });
  function draw() {
    const s = q.value.trim().toLowerCase();
    const l = COURSES.filter(c => (cat === 'All' || c.cat === cat) && (!s || (c.title + ' ' + c.cat + ' ' + c.desc).toLowerCase().includes(s)));
    count.textContent = l.length + (l.length === 1 ? ' course' : ' courses');
    list.innerHTML = l.map(c => `<article class="cc"><small>${esc(c.cat)}${c.badge ? ' · ' + esc(c.badge) : ''}</small><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>${modulesFor(c.title) ? modChips(modulesFor(c.title)) : ''}
      <div class="row"><span>${c.dur ? esc(c.dur) + ' · ' : ''}Online / Classroom · Certificate</span><div class="ra">${modulesFor(c.title) ? `<a class="md" href="#" data-mods="${esc(c.title)}" aria-label="See the modules of ${esc(c.title)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>Modules</a>` : ''}${demoFor(c.title) ? `<a class="dm" href="#" data-play="${esc(DEMOS.indexOf(demoFor(c.title)))}" aria-label="Watch a demo class of ${esc(c.title)}"><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>Demo</a>` : ''}${outlineFor(c.title) ? `<a class="dl" href="${esc(outlineFor(c.title))}" download rel="noopener" aria-label="Download the ${esc(c.title)} course outline (PDF)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>Outline</a>` : ''}<a href="${esc(enquire(c.title))}" target="_blank" rel="noopener">Enquire</a><a class="en" href="${esc(enroll(c.title))}" target="_blank" rel="noopener" aria-label="Enroll in ${esc(c.title)}">Enroll</a></div></div></article>`).join('')
      || `<div class="none">No course matches “${esc(q.value)}”. <a href="${esc(wa('Hi MARS, do you teach ' + q.value + '?'))}" target="_blank" rel="noopener">Ask us on WhatsApp</a>; we may still teach it.</div>`;
  }
  draw();
  loadOutlines().then(draw);
  loadDemos().then(l => { if (l.length) draw(); });
}

/* Demo class videos: rows of the "Demo Videos" tab (YouTube or Google Drive links) */
let DEMOS = [];
function loadDemos() {
  if (!/^https:\/\/script\.google\.com\//.test(SITE.api)) return Promise.resolve(DEMOS);
  try { const c = JSON.parse(sessionStorage.getItem('mars_demos1') || 'null'); if (c && Date.now() - c.at < 10 * 60e3) { DEMOS = c.l; return Promise.resolve(DEMOS); } } catch (e) {}
  return fetch(SITE.api + '?action=demos').then(r => r.json()).then(d => {
    DEMOS = ((d && d.demos) || []).filter(v => v && /^[\w-]+$/.test(v.id) && (v.kind === 'yt' || v.kind === 'drive'));
    try { sessionStorage.setItem('mars_demos1', JSON.stringify({ at: Date.now(), l: DEMOS })); } catch (e) {}
    return DEMOS;
  }).catch(() => DEMOS);
}
const demoFor = title => { const n = normT(title), a = OUTLINE_ALIAS[n]; return DEMOS.find(v => v.course && (normT(v.course) === n || normT(v.course) === a)) || null; };
const thumbOf = v => v.kind === 'yt' ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : `https://drive.google.com/thumbnail?id=${v.id}&sz=w640`;
const embedOf = v => v.kind === 'yt' ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1` : `https://drive.google.com/file/d/${v.id}/preview`;
const bookDemo = course => hasApp ? SITE.enquiryApp.replace(/\/?$/, '/') + '#enquire' : wa(`Hi MARS, I would like to book a free demo class${course ? ' for ' + course : ''}.`);
function playDemo(v) {
  let vp = $('#vp');
  if (!vp) {
    vp = document.createElement('div'); vp.className = 'vp'; vp.id = 'vp'; vp.hidden = true;
    vp.setAttribute('role', 'dialog'); vp.setAttribute('aria-modal', 'true'); vp.setAttribute('aria-label', 'Demo class video');
    vp.innerHTML = '<button type="button" class="x" aria-label="Close">×</button><div class="box"><div class="fr"></div><div class="cap"></div></div>';
    document.body.appendChild(vp);
    const close = () => { vp.hidden = true; $('.fr', vp).innerHTML = ''; document.body.style.overflow = ''; };
    $('.x', vp).onclick = close; vp.addEventListener('click', e => { if (e.target === vp) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !vp.hidden) close(); });
  }
  $('.fr', vp).innerHTML = `<iframe src="${esc(embedOf(v))}" title="${esc(v.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  $('.cap', vp).innerHTML = `<span><b>${esc(v.title)}</b>${v.course ? ' · ' + esc(v.course) : ''}</span>`;
  vp.hidden = false; document.body.style.overflow = 'hidden';
}
document.addEventListener('click', e => { const b = e.target.closest('[data-play]'); if (!b) return; e.preventDefault(); const v = DEMOS[+b.dataset.play]; if (v) playDemo(v); });
function demosHome() {
  const sec = $('#demos'), grid = $('#demoGrid'); if (!sec || !grid) return;
  $$('[data-demo-book]').forEach(a => { a.href = bookDemo(''); });
  loadDemos().then(l => {
    if (!l.length) return;
    grid.innerHTML = l.slice(0, 6).map((v, i) => `<button type="button" class="demo" data-play="${i}"><span class="th" style="background-image:url('${esc(thumbOf(v))}')"><span class="pl"><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></span>${v.dur ? `<span class="du">${esc(v.dur)}</span>` : ''}</span><span class="bd">${v.course ? `<small>${esc(v.course)}</small>` : ''}<b>${esc(v.title)}</b>${v.trainer ? `<span class="tr">Trainer: ${esc(v.trainer)}</span>` : ''}</span></button>`).join('');
    sec.hidden = false;
  });
}

/* Gallery: year filter, photo grid and full-screen viewer */
function galleryPage() {
  const G = (window.GALLERY || []).slice();
  const groups = [['All', () => true], ['2022 – 2026', e => e.y >= 2022], ['2019 – 2021', e => e.y >= 2019 && e.y <= 2021], ['2015 – 2018', e => e.y >= 2015 && e.y <= 2018], ['Before 2015', e => e.y < 2015]];
  let cur = 0, shown = [], idx = 0;
  const chips = $('#gchips'), gal = $('#gal'), count = $('#gcount'), lb = $('#lb'), img = $('#lbi'), cap = $('#lbc');
  chips.innerHTML = groups.map((g, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${g[0]}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; $$('button', chips).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  const label = e => [e.s, e.d].filter(Boolean).join(' · ');
  function draw() {
    const ev = G.filter(groups[cur][1]); shown = [];
    gal.innerHTML = ev.map(e => {
      const items = e.p.map(src => { const s = typeof src === 'string' ? { src, full: src } : src, i = shown.push({ src: s.full, t: e.t, l: label(e) }) - 1;
        return `<button type="button" class="ph" data-k="${i}"><img src="${esc(s.src)}" alt="${esc(e.t)} Training" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.ph').remove()"></button>`; }).join('');
      return `<article class="ev"><header><h3>${esc(e.t)}</h3><span>${esc(label(e))}</span><em>${e.p.length} photo${e.p.length > 1 ? 's' : ''}</em></header><div class="phs n${Math.min(e.p.length, 4)}">${items}</div></article>`;
    }).join('');
    count.textContent = ev.length + (ev.length === 1 ? ' programme' : ' programmes');
  }
  function open(k) { idx = (k + shown.length) % shown.length; const s = shown[idx]; img.src = s.src; img.alt = s.t; cap.innerHTML = `<b>${esc(s.t)}</b> ${esc(s.l)} <i>${idx + 1} / ${shown.length}</i>`; lb.hidden = false; document.body.style.overflow = 'hidden'; }
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  gal.addEventListener('click', e => { const b = e.target.closest('.ph'); if (b) open(+b.dataset.k); });
  $('#lbx').addEventListener('click', close);
  $('#lbp').addEventListener('click', () => open(idx - 1));
  $('#lbn').addEventListener('click', () => open(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') open(idx - 1); if (e.key === 'ArrowRight') open(idx + 1); });
  let x0 = null; lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) open(idx + (dx < 0 ? 1 : -1)); x0 = null; });
  draw();
  // Photos added to the Google Drive folder "MARS Website Gallery" (one sub-folder per programme) show up here automatically
  if (/^https:\/\/script\.google\.com\//.test(SITE.api)) fetch(SITE.api + '?action=gallery').then(r => r.json()).then(d => {
    const img = (id, w) => `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${w}`;
    const add = ((d && d.events) || []).filter(e => e.ids && e.ids.length).map(e => ({ t: e.t, s: e.s, d: e.d, y: Number(e.y) || new Date().getFullYear(), drive: 1, p: e.ids.map(id => ({ src: img(id, 800), full: img(id, 1800) })) }));
    if (!add.length) return;
    add.forEach(e => { const same = G.find(x => x.t.toLowerCase() === e.t.toLowerCase() && x.y === e.y); if (same) same.p = e.p.concat(same.p); else G.push(e); });
    G.sort((a, b) => b.y - a.y || (b.drive || 0) - (a.drive || 0));   // newest year first; within a year, Drive uploads first
    draw();
  }).catch(() => {});
}

/* Join as a Trainer: sends the form and resume to the Google Sheet through Apps Script */
function joinPage() {
  const form = $('#jform'), err = $('#jerr'), btn = $('#jbtn');
  const fail = m => { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = 'Send application'; };
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.hidden = true;
    const d = Object.fromEntries(new FormData(form)); const file = form.resume.files[0];
    if (!String(d.name).trim()) return fail('Please enter your name.');
    if (!String(d.gender || '').trim()) return fail('Please select your sex.');
    if (String(d.phone).replace(/\D/g, '').slice(-10).length !== 10) return fail('Please enter a 10-digit mobile number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email).trim())) return fail('Please enter a valid email address.');
    if (!String(d.skills).trim()) return fail('Please tell us which courses you can teach.');
    if (!file) return fail('Please attach your resume.');
    if (!/\.(pdf|docx?)$/i.test(file.name)) return fail('Please attach your resume as a PDF or Word file.');
    if (file.size > 5 * 1024 * 1024) return fail('The resume is larger than 5 MB. Please attach a smaller file.');
    if (!/^https:\/\/script\.google\.com\//.test(SITE.api)) return fail('Online applications are not set up yet. Please email your resume to ' + SITE.email + '.');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = no; r.readAsDataURL(file); });
      delete d.resume;
      const res = await fetch(SITE.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...d, action: 'submitTrainer', resume: { name: file.name, data } }) }).then(r => r.json());
      if (!res.ok) return fail(res.error || 'Something went wrong. Please try again.');
      form.hidden = true; $('#jdone').hidden = false; $('#jdone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (x) { fail('Could not send. Check your internet connection, or email your resume to ' + SITE.email + '.'); }
  });
}

/* Job openings: read from the "Job Openings" tab of the Google Sheet through Apps Script */
function jobsPage(sel, limit) {
  const box = $(sel); if (!box) return;
  const empty = '<div class="none">No openings right now. New jobs are added regularly, so check back soon or follow us on <a href="https://www.linkedin.com/company/mars-training-solution/" target="_blank" rel="noopener">LinkedIn</a>.</div>';
  if (!window.DEMO_JOBS && !/^https:\/\/script\.google\.com\//.test(SITE.api)) { if (!limit) box.innerHTML = empty; return; }
  const nice = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
  const waNo = n => { const d = String(n || '').replace(/\D/g, ''); return d.length === 10 ? '91' + d : d || SITE.whatsapp; };
  (window.DEMO_JOBS ? Promise.resolve(window.DEMO_JOBS) : fetch(SITE.api + '?action=jobs', { cache: 'no-store' }).then(r => r.json())).then(d => {
    let list = (d && d.jobs) || [];
    if (limit) { if (!list.length) return; list = list.slice(0, limit); box.closest('section').hidden = false; }
    if (!list.length) { box.innerHTML = empty; return; }
    box.innerHTML = list.map((j, i) => {
      const msg = `Hi MARS, I want to apply for the ${j.title || 'job'}${j.company ? ' at ' + j.company : ''} position. I am sharing my CV.`;
      const row = (k, v) => v ? `<li><b>${k}</b><span>${esc(v)}</span></li>` : '';
      return `<article class="job">
        ${j.flyer ? `<button type="button" class="jf" data-i="${i}" aria-label="View flyer"><img src="${esc(j.flyer)}" alt="${esc(j.title)} job flyer" loading="lazy" onerror="this.closest('.jf').remove()"></button>` : ''}
        <div class="jb">
          ${j.posted ? `<small>Posted ${esc(nice(j.posted))}${j.last ? ' · Apply by ' + esc(nice(j.last)) : ''}</small>` : (j.last ? `<small>Apply by ${esc(nice(j.last))}</small>` : '')}
          ${j.title ? `<h3>${esc(j.title)}</h3>` : ''}${j.company ? `<p class="co">${esc(j.company)}${j.location ? ' · ' + esc(j.location) : ''}</p>` : ''}
          ${j.salary ? `<p class="sal">${esc(j.salary)}</p>` : ''}
          <ul>${row('Timing', j.timing)}${row('Eligibility', j.eligibility)}${row('Skills', j.skills)}${row('Work', j.details)}</ul>
          <div class="ja"><a class="btn wa-btn" href="https://wa.me/${waNo(j.apply)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Apply on WhatsApp</a>${j.flyer ? `<button type="button" class="btn line" data-i="${i}">View flyer</button>` : ''}</div>
        </div></article>`;
    }).join('');
    const lb = $('#lb');
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-i]'); if (!b) return; const j = list[+b.dataset.i];
      if (!lb) { window.open(j.flyerFull || j.flyer, '_blank', 'noopener'); return; }
      $('#lbi').src = j.flyer; $('#lbi').alt = j.title; $('#lbc').innerHTML = `<b>${esc(j.title)}</b> ${esc(j.company || '')}`;
      lb.hidden = false; document.body.style.overflow = 'hidden';
    });
    if (lb) { const close = () => { lb.hidden = true; document.body.style.overflow = ''; }; $('#lbx').onclick = close; lb.onclick = e => { if (e.target === lb) close(); }; addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) close(); }); }
  }).catch(() => { if (!limit) box.innerHTML = '<div class="none">Could not load job openings right now. Please try again later, or <a href="' + esc(wa('Hi MARS, are there any job openings?')) + '" target="_blank" rel="noopener">ask us on WhatsApp</a>.</div>'; });
}

/* Corporate enquiry: the questions come from the "Corporate Form" tab of the Google Sheet */
const CORP_FALLBACK = [
  { q: 'Company / Organisation name', type: 'text', required: true }, { q: 'Contact person', type: 'text', required: true },
  { q: 'Designation', type: 'text', help: 'e.g. HR Manager, L&D Head' }, { q: 'Work email', type: 'email', required: true },
  { q: 'Mobile number', type: 'phone', required: true }, { q: 'City / Location', type: 'text', required: true },
  { q: 'Number of participants', type: 'number', required: true },
  { q: 'Training required', type: 'multi', required: true, options: COURSES.map(c => c.title).concat('Other'), help: 'Not in the list? Tick Other and type it' },
  { q: 'Training mode', type: 'radio', required: true, options: ['On-site at our office', 'Live online', 'At MARS training centre', 'Hybrid'] },
  { q: 'Preferred start date', type: 'date' }, { q: 'Requirements / message', type: 'textarea' }];
function corporatePage() {
  const form = $('#cform'), box = $('#cfields'), err = $('#cerr'), btn = $('#cbtn');
  let fields = [];
  const id = i => 'cf' + i, isOther = o => /^other\b/i.test(String(o).trim());
  const othBox = i => `<input class="othtxt" id="${id(i)}o" type="text" maxlength="300" placeholder="Please specify…" hidden>`;
  function draw(list) {
    fields = list;
    box.innerHTML = list.map((f, i) => {
      const req = f.required ? ' <em>*</em>' : '', help = f.help ? `<span class="help">${esc(f.help)}</span>` : '', nm = `name="${id(i)}"`;
      const opts = f.options || [], oth = opts.find(isOther), main = opts.filter(o => !isOther(o)), big = main.length > 8;
      if (f.type === 'multi') return `<fieldset class="wide" data-i="${i}"><legend>${esc(f.q)}${req} <span class="mcount" id="${id(i)}n"></span></legend>${help}
        ${big ? `<input class="mfind" type="search" placeholder="Search…" data-find="${i}">` : ''}
        <div class="${big ? 'mlist' : 'opts'}">${main.map(o => `<label class="${big ? '' : 'opt'}"><input type="checkbox" ${nm} value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>
        ${oth ? `<div class="opts othrow"><label class="opt"><input type="checkbox" ${nm} value="${esc(oth)}"><span>${esc(oth)}</span></label></div>${othBox(i)}` : ''}</fieldset>`;
      if (f.type === 'radio') return `<fieldset class="wide" data-i="${i}"><legend>${esc(f.q)}${req}</legend>${help}<div class="opts">${opts.map(o => `<label class="opt"><input type="radio" ${nm} value="${esc(o)}"><span>${esc(o)}</span></label>`).join('')}</div>${oth ? othBox(i) : ''}</fieldset>`;
      if (f.type === 'textarea') return `<label class="wide"><span>${esc(f.q)}${req}</span><textarea ${nm} rows="4" placeholder="${esc(f.help || '')}"></textarea></label>`;
      if (f.type === 'select') return `<label><span>${esc(f.q)}${req}</span><select ${nm}><option value="">Select</option>${opts.map(o => `<option>${esc(o)}</option>`).join('')}</select>${help}${oth ? othBox(i) : ''}</label>`;
      const t = { email: 'email', phone: 'tel', number: 'number', date: 'date' }[f.type] || 'text';
      const extra = f.type === 'phone' ? ' inputmode="tel" autocomplete="tel"' : f.type === 'email' ? ' autocomplete="email"' : f.type === 'number' ? ' min="0" inputmode="numeric"' : '';
      return `<label><span>${esc(f.q)}${req}</span><input type="${t}" ${nm}${extra} placeholder="${f.type === 'date' ? '' : esc(f.help || '')}"></label>`;
    }).join('');
  }
  box.addEventListener('input', e => {
    const fi = e.target.dataset.find;
    if (fi !== undefined) { const q = e.target.value.toLowerCase(); $$('.mlist label', e.target.parentNode).forEach(l => { l.hidden = q && !l.textContent.toLowerCase().includes(q); }); }
  });
  const picked = i => $$(`[name="${id(i)}"]`, form).some(x => (x.tagName === 'SELECT' || x.checked) && isOther(x.value));
  box.addEventListener('change', e => {
    const fs = e.target.closest('fieldset');
    if (fs && e.target.type === 'checkbox') { const n = $$('input:checked', fs).length; $('#' + id(fs.dataset.i) + 'n').textContent = n ? n + ' selected' : ''; }
    const m = /^cf(\d+)$/.exec(e.target.name || ''), t = m && $('#' + id(m[1]) + 'o');
    if (t) { const on = picked(+m[1]); t.hidden = !on; if (on && e.target.value && isOther(e.target.value)) t.focus(); }
  });
  const api = /^https:\/\/script\.google\.com\//.test(SITE.api);
  (api ? fetch(SITE.api + '?action=corpform').then(r => r.json()) : Promise.reject()).then(d => {
    if (!d || !d.ok || !d.fields || !d.fields.length) throw 0;
    if (d.title) $('#ctitle').textContent = d.title; if (d.intro) $('#cintro').textContent = d.intro; if (d.success) $('#cok').textContent = d.success;
    draw(d.fields);
  }).catch(() => draw(CORP_FALLBACK));
  const fail = m => { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = 'Send enquiry'; err.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.hidden = true;
    const answers = {};
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i], els = $$(`[name="${id(i)}"]`, form);
      let v = f.type === 'multi' ? els.filter(x => x.checked).map(x => x.value) : f.type === 'radio' ? (els.find(x => x.checked) || {}).value || '' : (els[0] ? els[0].value.trim() : '');
      const ot = $('#' + id(i) + 'o');
      if (ot && picked(i)) {
        const txt = ot.value.trim();
        if (!txt) { ot.hidden = false; ot.focus(); return fail('Please type what you need under "Other" for: ' + f.q); }
        v = Array.isArray(v) ? v.map(x => isOther(x) ? 'Other: ' + txt : x) : 'Other: ' + txt;
      }
      if (f.required && (Array.isArray(v) ? !v.length : !v)) return fail('Please fill in: ' + f.q);
      if (v && f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return fail('Please enter a valid email address.');
      if (v && f.type === 'phone' && v.replace(/\D/g, '').length < 10) return fail('Please enter a valid 10-digit mobile number.');
      answers[f.q] = v;
    }
    if (!api) return fail('Online enquiries are not set up yet. Please email contactus@marstraining.in.');
    btn.disabled = true; btn.textContent = 'Sending…';
    try {
      const res = await fetch(SITE.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'submitCorporate', answers, website: form.website.value }) }).then(r => r.json());
      if (!res.ok) return fail(res.error || 'Something went wrong. Please try again.');
      form.hidden = true; $('#cdone').hidden = false; $('#cdone').scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (x) { fail('Could not send. Check your internet connection, or email contactus@marstraining.in.'); }
  });
}


/* Trainers: filter buttons, and cards read from the "Trainers" tab of the Google Sheet through Apps Script.
   If the sheet can't be reached, the cards already written in index.html stay as they are. */
function trainersSection() {
  const list = $('#trlist'), bar = $('.tr-filters'); if (!list) return;
  const applyFilter = f => $$('.tr-lead,.trc', list).forEach(e => { e.hidden = !(f === 'all' || (e.dataset.cat || '').split(' ').includes(f)); });
  if (bar) bar.addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b) return;
    $$('button', bar).forEach(x => x.setAttribute('aria-pressed', x === b)); applyFilter(b.dataset.f);
  });
  if (!/^https:\/\/script\.google\.com\//.test(SITE.api)) return;
  const photo = u => {
    u = String(u || '').trim(); if (!u) return '';
    const m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/.exec(u) || /[?&]id=([\w-]+)/.exec(/drive\.google\.com/.test(u) ? u : '');
    return m ? `https://lh3.googleusercontent.com/d/${encodeURIComponent(m[1])}=w600` : u;
  };
  const initials = n => String(n || '').replace(/^(prof|dr|mr|mrs|ms)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const cats = f => String(f || '').toLowerCase().split(/[,;]/).map(x => x.trim()).filter(Boolean).map(x => x.startsWith('ex') ? 'excel' : x.startsWith('da') || x.includes('power bi') ? 'data' : x.startsWith('ai') || x.includes('autom') ? 'ai' : x.startsWith('erp') || x.includes('soft') || x.includes('proj') ? 'erp' : x).join(' ');
  const chips = s => String(s || '').split(',').map(x => x.trim()).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('');
  const lines = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const labelled = s => { const i = String(s || '').indexOf(':'); return i > 0 ? `${esc(s.slice(0, i))} <strong>${esc(s.slice(i + 1).trim())}</strong>` : esc(s); };
  const av = (t, cls, w, h) => { const src = photo(t.photo); const ini = `<span class="${cls === 'tr-ph' ? 'tr-ph trc-ini' : 'trc-av trc-ini'}" role="img" aria-label="${esc(t.name)}">${esc(initials(t.name))}</span>`;
    return src ? `<img class="${cls}" src="${esc(src)}" alt="${esc(t.name)}" width="${w}" height="${h}" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=this.dataset.f" data-f="${esc(ini)}">` : ini; };
  fetch(SITE.api + '?action=trainers', { cache: 'no-store' }).then(r => r.json()).then(d => {
    const rows = ((d && d.trainers) || []).filter(t => t && t.name);
    if (!rows.length) return;
    const feat = rows.filter(t => /^feat/i.test(t.type)), full = rows.filter(t => !/^(feat|name)/i.test(t.type)), names = rows.filter(t => /^name/i.test(t.type));
    const lead = t => {
      const stats = lines(t.stats).map(l => { const [v, ...r] = l.split('|'); return `<div><b>${esc(v.trim())}</b><span>${esc(r.join('|').trim())}</span></div>`; }).join('');
      const tr = String(t.trusted || ''), i = tr.indexOf(':');
      return `<article class="tr-lead" data-cat="${esc(cats(t.filters))}">${av(t, 'tr-ph', 350, 450)}
        <div class="tr-col">${t.exp ? `<span class="tr-tag">${esc(t.exp)}</span>` : ''}<h4>${esc(t.name)}</h4>${t.role ? `<p class="trc-role">${esc(t.role)}</p>` : ''}
          ${t.skills ? `<div class="trc-chips">${chips(t.skills)}</div>` : ''}${stats ? `<div class="tr-stats">${stats}</div>` : ''}</div>
        <div class="tr-col">${t.highlights ? `<h5>From the field</h5><ul>${lines(t.highlights).map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : (t.field ? `<h5>From the field</h5><p>${esc(t.field)}</p>` : '')}</div>
        ${tr ? `<div class="tr-trusted">${i > 0 ? `<h5>${esc(tr.slice(0, i))}</h5><p>${esc(tr.slice(i + 1).trim())}</p>` : `<p>${esc(tr)}</p>`}</div>` : ''}</article>`;
    };
    const card = t => `<article class="trc" data-cat="${esc(cats(t.filters))}">
        <div class="trc-top">${av(t, 'trc-av', 72, 72)}<div><h4>${esc(t.name)}</h4>${t.role ? `<p class="trc-role">${esc(t.role)}</p>` : ''}${t.exp ? `<span class="trc-exp">${esc(t.exp)}</span>` : ''}</div></div>
        ${t.field ? `<div class="trc-proof"><b>From the field</b>${esc(t.field)}</div>` : ''}
        ${t.skills ? `<div class="trc-chips">${chips(t.skills)}</div>` : ''}
        ${t.footer ? `<p class="trc-cl">${labelled(t.footer)}</p>` : ''}</article>`;
    const more = names.length ? `Including ${names.map(t => esc(t.name)).join(', ').replace(/, ([^,]*)$/, ' and $1')}, with experienced trainers across Excel, data, SAP, programming and more` : 'Experienced trainers across Excel, data, SAP, programming and more';
    list.innerHTML = feat.map(lead).join('') + (full.length ? `<div class="tr-grid">${full.map(card).join('')}</div>` : '');
    const mp = $('.faculty .fm.more p'); if (mp) mp.innerHTML = more;
    const on = bar && $('button[aria-pressed="true"]', bar); applyFilter(on ? on.dataset.f : 'all');
  }).catch(() => {});
}

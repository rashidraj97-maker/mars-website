/* MARS Training & Solution – website script */

/* ===== Settings you may change ===== */
const SITE = {
  // Link to your enquiry / enroll app on Netlify (for example 'https://mars-app.netlify.app').
  // Leave as it is and the Enquire buttons open WhatsApp instead.
  enquiryApp: 'https://marstraining.netlify.app',
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

/* ===== Shared behaviour ===== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hasApp = /^https:\/\//.test(SITE.enquiryApp);
const wa = msg => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg || 'Hi MARS, I would like to know more about your courses.')}`;
const enquire = course => hasApp ? SITE.enquiryApp.replace(/\/?$/, '/') + '#enquire' : wa(course ? `Hi MARS, I would like to know more about ${course}.` : '');

document.addEventListener('DOMContentLoaded', () => {
  // menu on phones
  const nav = $('#nav'), burger = $('#burger');
  if (burger) burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); if (burger) burger.setAttribute('aria-expanded', 'false'); }));
  // enquire buttons
  $$('[data-enquire]').forEach(a => { a.href = a.dataset.enroll !== undefined && !hasApp ? wa('Hi MARS, I would like to enroll in a course.') : enquire(a.dataset.enquire); if (!hasApp) { a.target = '_blank'; a.rel = 'noopener'; } else if (a.dataset.enroll !== undefined) a.href = SITE.enquiryApp.replace(/\/?$/, '/') + '#enroll'; });
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
  if (document.body.dataset.page === 'home') home();
  if (document.body.dataset.page === 'courses') coursesPage();
  if (document.body.dataset.page === 'gallery') galleryPage();
  if (document.body.dataset.page === 'join') joinPage();
  if (document.body.dataset.page === 'jobs') jobsPage('#jobsAll', 0);
  if (document.body.dataset.page === 'home') jobsPage('#jobsHome', 3);
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
  function draw() {
    const s = q.value.trim().toLowerCase();
    const l = COURSES.filter(c => (cat === 'All' || c.cat === cat) && (!s || (c.title + ' ' + c.cat + ' ' + c.desc).toLowerCase().includes(s)));
    count.textContent = l.length + (l.length === 1 ? ' course' : ' courses');
    list.innerHTML = l.map(c => `<article class="cc"><small>${esc(c.cat)}${c.badge ? ' · ' + esc(c.badge) : ''}</small><h3>${esc(c.title)}</h3><p>${esc(c.desc)}</p>
      <div class="row"><span>${c.dur ? esc(c.dur) + ' · ' : ''}Online / Classroom · Certificate</span><div class="ra">${outlineFor(c.title) ? `<a class="dl" href="${esc(outlineFor(c.title))}" download rel="noopener" aria-label="Download the ${esc(c.title)} course outline (PDF)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>Outline</a>` : ''}<a href="${esc(enquire(c.title))}"${hasApp ? '' : ' target="_blank" rel="noopener"'}>Enquire</a></div></div></article>`).join('')
      || `<div class="none">No course matches “${esc(q.value)}”. <a href="${esc(wa('Hi MARS, do you teach ' + q.value + '?'))}" target="_blank" rel="noopener">Ask us on WhatsApp</a>; we may still teach it.</div>`;
  }
  draw();
  loadOutlines().then(draw);
}

/* Gallery: year filter, photo grid and full-screen viewer */
function galleryPage() {
  const G = window.GALLERY || [];
  const groups = [['All', () => true], ['2022 – 2026', e => e.y >= 2022], ['2019 – 2021', e => e.y >= 2019 && e.y <= 2021], ['2015 – 2018', e => e.y >= 2015 && e.y <= 2018], ['Before 2015', e => e.y < 2015]];
  let cur = 0, shown = [], idx = 0;
  const chips = $('#gchips'), gal = $('#gal'), count = $('#gcount'), lb = $('#lb'), img = $('#lbi'), cap = $('#lbc');
  chips.innerHTML = groups.map((g, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${g[0]}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; $$('button', chips).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  const label = e => [e.s, e.d].filter(Boolean).join(' · ');
  function draw() {
    const ev = G.filter(groups[cur][1]); shown = [];
    gal.innerHTML = ev.map(e => {
      const items = e.p.map(src => { const i = shown.push({ src, t: e.t, l: label(e) }) - 1;
        return `<button type="button" class="ph" data-k="${i}"><img src="${esc(src)}" alt="${esc(e.t)} Training" loading="lazy" onerror="this.closest('.ph').remove()"></button>`; }).join('');
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
}

/* Join as a Trainer: sends the form and resume to the Google Sheet through Apps Script */
function joinPage() {
  const form = $('#jform'), err = $('#jerr'), btn = $('#jbtn');
  const fail = m => { err.textContent = m; err.hidden = false; btn.disabled = false; btn.textContent = 'Send application'; };
  form.addEventListener('submit', async e => {
    e.preventDefault(); err.hidden = true;
    const d = Object.fromEntries(new FormData(form)); const file = form.resume.files[0];
    if (!String(d.name).trim()) return fail('Please enter your name.');
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

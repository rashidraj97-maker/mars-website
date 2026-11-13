/**
 * marstraining.in – static website + "Ask MARS AI" chat API.
 * Static files are served straight from the assets; this code only runs for /api/* (and for paths with no file).
 *   GET  /api/catalog  compact course data (fees, offer, batches, EMI, hours) for the chat widget
 *   GET  /api/gallery  photo albums from the Drive folder "MARS Website Gallery" (saved copy, so the Gallery page shows them at once)
 *   GET  /course/<slug> Courses page with that course's link preview; the page opens the course (used by Share links)
 *   POST /api/chat     { messages: [{ role: 'user'|'assistant', content }] } -> { ok, reply, courses: [titles], callback, cert }
 * AI: Cloudflare Workers AI (free daily allowance). If it fails or the allowance is used up, the widget answers from its own rules.
 */
const DATA_URL = 'https://script.google.com/macros/s/AKfycbyXxbiBJtACn_OVfPzgAOb0vXe2xJJZUjW0ouAekolDCbmyvLh4OVPH4QVZKEcaXm72/exec?action=data';
const MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
const ORIGINS = /^https:\/\/(www\.)?marstraining\.in$|^http:\/\/localhost(:\d+)?$/;
const CACHE_SECS = 600, MAX_MSGS = 8, MAX_LEN = 600, RATE_PER_10MIN = 40;

// Programmes made of modules (same list as the website's "Modules" window)
const DA = ['Advanced Excel', 'Excel VBA', 'Power BI', 'SQL', 'Python'], MIS = ['Advanced Excel', 'Excel VBA', 'Power BI'];
const MODULES = { 'data analytics': DA, 'data analytics with ai': DA.concat('Generative AI'), 'business analytics': DA.concat('Machine Learning'),
  'business analytics with gen ai': DA.concat('Machine Learning', 'Generative AI'), 'mis specialist': MIS, 'mis with gen ai': MIS.concat('Generative AI'),
  'ms office': ['MS Word', 'MS PowerPoint', 'MS Excel'], 'advanced excel with ai': ['Advanced Excel', 'Generative AI'] };
const normT = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra) });
const num = v => Number(String(v == null ? '' : v).replace(/[^\d.]/g, '')) || 0;
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const isoDay = v => { const s = String(v || '').trim(); let m = s.match(/^(\d{4})-(\d\d)-(\d\d)/); if (m) return `${m[1]}-${m[2]}-${m[3]}`; m = s.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})/); if (m) { const mi = 'janfebmaraprmayjunjulaugsepoctnovdec'.indexOf(m[2].toLowerCase()) / 3; if (mi >= 0) return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`; } m = s.match(/^(\d\d)\/(\d\d)\/(\d{4})/); if (m) return `${m[3]}-${m[2]}-${m[1]}`; const t = Date.parse(s); return isNaN(t) ? '' : new Date(t + 5.5 * 3600e3).toISOString().slice(0, 10); };   // also "Tue Nov 10 2026 00:00:00 GMT+0530"
const niceDay = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? `${+m[3]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1]} ${m[1]}` : ''; };
const todayIst = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);

/* ---------- course data (from the MARS ENQUIRY sheet via Apps Script), cached ----------
 * Served from a saved copy so pages stay fast. A copy older than FRESH_SECS is refreshed in the background,
 * so a change in the sheet (offer, batches, fees) reaches the offer window and the chat within about a minute. */
let memo = null, refreshing = null;
const CAT_KEY = 'https://marstraining.in/__ai/catalog-v2', FRESH_SECS = 60;
async function catalog(ctx) {
  if (!memo) {
    const hit = await caches.default.match(new Request(CAT_KEY));
    if (hit) { try { const j = await hit.json(); if (j && j.data) memo = { at: j.at, data: j.data }; } catch (e) { /* ignore a bad copy */ } }
  }
  if (!memo) return loadCatalog(ctx);
  if (Date.now() - memo.at > FRESH_SECS * 1000 && !refreshing) {
    refreshing = loadCatalog(ctx).catch(e => console.log('catalog refresh', String(e && e.message || e))).finally(() => { refreshing = null; });
    ctx.waitUntil(refreshing);
  }
  return memo.data;
}
async function loadCatalog(ctx) {
  const r = await fetch(DATA_URL, { redirect: 'follow', cf: { cacheTtl: 0 } });
  const d = await r.json();
  if (!d || !Array.isArray(d.courses)) throw new Error('no course data');
  const S = d.settings || {}, today = todayIst();
  const courses = d.courses.filter(c => c.Title && num(c.Fee) > 0 && !/^test$/i.test(String(c.Title).trim())).map(c => {
    const t = String(c.Title).trim(), fee = num(c.Fee), price = num(c.Price) || fee, o = c.Offer || null;
    return { t, cat: String(c.Category || ''), dur: String(c.Duration || ''), fee, price, off: o ? String(o.label || '') : '', offName: o ? String(o.name || '') : '', offEnd: o ? isoDay(o.end) : '',
      badge: String(c.Badge || ''), desc: String(c.Description || '').replace(/\s*\((?:about\s*)?\d+(?:\s*[–-]\s*\d+)?\s*hours\)/gi, '').slice(0, 260), hl: String(c['Highlights (separate with |)'] || '').split('|').map(x => x.trim()).filter(Boolean).slice(0, 6),
      mods: MODULES[normT(t)] || null, emi: ((d.emi || {})[t] || []).map(p => ({ n: p.n, extra: p.extra, total: p.total, first: (p.amounts || [])[0] || Math.ceil(p.total / p.n) })) };
  });
  const batches = (d.batches || []).map(b => ({ course: String(b.course || ''), start: isoDay(b.start), timing: String(b.timing || ''), mode: String(b.mode || ''), left: b.left }))
    .filter(b => b.course && b.start && b.start >= today && b.left !== 0).sort((a, b) => a.start < b.start ? -1 : 1);
  const offer = (d.offers || [])[0] || null;
  const data = {
    at: today, courses, batches,
    offer: offer ? { name: offer.name, text: offer.text, discount: offer.discount, end: isoDay(offer.end) } : null,
    hours: String(S.office_hours || 'Mon to Thu: 10:30 AM – 7:30 PM|Friday: On call|Sat & Sun: 9:30 AM – 6:30 PM').split('|').map(x => x.trim()).filter(Boolean),
    phones: String(S.appointment_phones || '98702 59245|74396 02303|70444 70064').split('|').map(x => x.trim()).filter(x => x.replace(/\D/g, '').length >= 10),
    whatsapp: String(S.whatsapp || '919870259245'), email: 'contactus@marstraining.in', app: String(S.app_url || 'https://app.marstraining.in'),
    lateSmall: num(S.late_fee_small) || 250, lateBig: num(S.late_fee_big) || 500, lateLimit: num(S.late_fee_limit) || 10000,
    popup: { on: /^(yes|on|true|1)$/i.test(String(S.popup_show || '').trim()), until: isoDay(S.popup_until), img: String(S.popup_image || '').trim(), btn: String(S.popup_button || '').trim(), msg: String(S.popup_message || '').trim(), link: String(S.popup_link || '').trim() },   // batch poster popup (Settings tab)
    faqs: (d.faqs || []).filter(f => f.Question && f.Answer).slice(0, 12).map(f => ({ q: String(f.Question).slice(0, 160), a: String(f.Answer).slice(0, 360) }))
  };
  const at = Date.now(); memo = { at, data };
  ctx.waitUntil(caches.default.put(new Request(CAT_KEY), new Response(JSON.stringify({ at, data }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECS}` } })));
  return data;
}

/* ---------- Gallery albums from the Drive folder (via Apps Script), cached ----------
 * Apps Script takes about 2 seconds to answer, so the Gallery page used to show the Drive albums (e.g. "Corporate Clients")
 * a few seconds after the rest. The worker keeps a saved copy (kept for a day) and refreshes it in the background
 * when it is older than GAL_FRESH, so new uploads still appear within a few minutes. */
let gmemo = null, grefreshing = null;
const GAL_URL = DATA_URL.replace('action=data', 'action=gallery'), GAL_KEY = 'https://marstraining.in/__ai/gallery-v1', GAL_FRESH = 300;
async function gallery(ctx) {
  if (!gmemo) {
    const hit = await caches.default.match(new Request(GAL_KEY));
    if (hit) { try { const j = await hit.json(); if (j && j.data) gmemo = { at: j.at, data: j.data }; } catch (e) { /* ignore a bad copy */ } }
  }
  if (!gmemo) return loadGallery(ctx);
  if (Date.now() - gmemo.at > GAL_FRESH * 1000 && !grefreshing) {
    grefreshing = loadGallery(ctx).catch(e => console.log('gallery refresh', String(e && e.message || e))).finally(() => { grefreshing = null; });
    ctx.waitUntil(grefreshing);
  }
  return gmemo.data;
}
async function loadGallery(ctx) {
  const r = await fetch(GAL_URL, { redirect: 'follow', cf: { cacheTtl: 0 } });
  const d = await r.json();
  if (!d || !Array.isArray(d.events)) throw new Error('no gallery data');
  const data = { ok: true, events: d.events.map(e => ({ t: String(e.t || ''), s: String(e.s || ''), d: String(e.d || ''), y: Number(e.y) || 0,
    ids: (Array.isArray(e.ids) ? e.ids : []).map(String).filter(x => /^[\w-]{10,}$/.test(x)) })).filter(e => e.t && e.ids.length) };
  const at = Date.now(); gmemo = { at, data };
  ctx.waitUntil(caches.default.put(new Request(GAL_KEY), new Response(JSON.stringify({ at, data }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' } })));
  return data;
}

/* ---------- the assistant's brief ---------- */
function systemPrompt(D, recent) {
  const emi = c => c.emi.length ? 'EMI ' + c.emi.map(p => `${p.n} parts (+${inr(p.extra)})`).join(' or ') : 'full payment only';
  const lines = D.courses.map(c => `- ${c.t} | ${c.cat} | ${c.dur} | fee ${inr(c.fee)}${c.price < c.fee ? ` | offer price ${inr(c.price)}` : ''} | ${emi(c)}${c.mods ? ' | modules: ' + c.mods.join(' + ') : ''}`);
  const asked = normT(recent), detail = D.courses.filter(c => asked.includes(normT(c.t)) || (c.mods && c.mods.some(m => asked.includes(normT(m))))).slice(0, 3)
    .map(c => `* ${c.t}: ${c.desc}${c.hl.length ? ' Topics: ' + c.hl.join('; ') + '.' : ''}`);
  const batches = D.batches.length ? D.batches.map(b => `- ${b.course}: starts ${niceDay(b.start)}, ${b.timing}${b.mode ? ', ' + b.mode : ''}${b.left ? `, ${b.left} seats left` : ''}`).join('\n') : '- none announced right now';
  return `You are "MARS Assistant", the friendly course advisor on the website of MARS Training & Solution, an ISO 9001:2015 certified computer and IT training institute in Kolkata, India. Today is ${niceDay(D.at)}.

RULES
- Help only with MARS: courses, fees, offers, batches, EMI, timings, location, certificates, enrolling, corporate training. For anything else, politely say you can only help with MARS courses.
- Use ONLY the facts below. Never invent courses, fees, discounts, dates, trainers, placements or job guarantees. If a fact is not listed, say you are not sure and suggest WhatsApp or a call back.
- Reply in the same language and script as the visitor (English, Hindi, Hinglish or Bengali).
- Be short and warm: 2 to 5 sentences, or a short "- " bullet list. Use **bold** for course names and prices. Write natural sentences: never copy the fact lines or use "|" separators. No tables, no headings, no links (buttons and course cards are added for you).
- Fees: give the offer price when there is one, plus the regular fee and the offer end date. The offer applies to full payment; EMI is on the regular fee plus the EMI extra.
- Never mention course hours; give the duration in months only.
- Late fee: an installment paid after its due date + 5 days gets ${inr(D.lateSmall)} added (course total up to ${inr(D.lateLimit)}) or ${inr(D.lateBig)} (above).
- To enroll, the visitor taps the Enroll button (opens our app). For a human: WhatsApp us or ask for a call back.
- You cannot see student records yourself, but this chat can fetch a certificate. Never say you are not able or not authorized to help with a certificate. If the visitor wants their own certificate (download, copy, hard copy, lost, when ready), ask them to type their Enrollment ID (looks like MARS-2611-0012) and the mobile number they enrolled with, right here in the chat (for a certificate issued before November 2026: the certificate ID printed on it), and add [[certificate]]. Add [[certificate]] also when someone asks how to verify a MARS certificate.
- Finish EVERY reply with one last line exactly like [[courses: Exact Title | Exact Title]] naming at most 2 course titles from the list: only the course the visitor asked about, or the one or two you recommend most (or [[courses: ]] if none, and always [[courses: ]] for certificate questions). Add [[callback]] ONLY when the visitor explicitly asks to be called or contacted, never on your own.

FACTS
Offer: ${D.offer ? `${D.offer.name}: ${D.offer.discount} off${D.offer.end ? ' till ' + niceDay(D.offer.end) : ''} (${D.offer.text})` : 'no offer running'}
Courses (title | area | duration | fee | offer price | payment | modules):
${lines.join('\n')}
Upcoming batches:
${batches}
- Other courses: the student picks a preferred start date when enrolling; batches usually start within 2-3 weeks. Weekday and weekend options.
Mode: live online from anywhere, or classroom at our Kolkata centre (Ground Floor, P-74 Nani Gopal Roy Chowdhury Avenue, CIT Road, Kolkata 700014). Same trainer and certificate.
Office hours: ${D.hours.join('; ')}. Call / WhatsApp ${D.phones.join(' | ')}. WhatsApp chat +${D.whatsapp}. Email ${D.email}.
Certificate: every course ends with an exam. After the student completes the course, passes the exam and pays all fees, MARS issues a Course Completion certificate (ID like MARS-2026-CL-1540). It is emailed as a PDF and can be downloaded any time from the Certificate page on this website (Enrollment ID + registered mobile number), from My Courses in our app, or right here in this chat. Hard copy: request it on the Certificate page or in this chat and collect it from our office 10 days later. Certificates issued before November 2026 (IDs like MARS2023-CL-662) are also available: download them on the Certificate page with the certificate ID + name, or type the certificate ID here. Employers can verify any MARS certificate on the Certificate page or in this chat with the certificate ID and the candidate's name.
Companies: on-site or online corporate training; they can fill the Corporate Training enquiry form.
${D.faqs.length ? 'FAQs:\n' + D.faqs.map(f => `Q: ${f.q} A: ${f.a}`).join('\n') : ''}
${detail.length ? 'Details of courses being discussed:\n' + detail.join('\n') : ''}`;
}

/* ---------- light abuse protection: same-site only, ~40 messages / 10 min per visitor ---------- */
async function tooMany(req) {
  const ip = req.headers.get('CF-Connecting-IP') || 'x', slot = Math.floor(Date.now() / 600e3);
  const key = new Request(`https://marstraining.in/__ai/rl/${encodeURIComponent(ip)}/${slot}`), c = caches.default;
  const hit = await c.match(key), n = hit ? Number(await hit.text()) || 0 : 0;
  if (n >= RATE_PER_10MIN) return true;
  await c.put(key, new Response(String(n + 1), { headers: { 'Cache-Control': 'public, max-age=660' } }));
  return false;
}

async function chat(req, env, ctx) {
  const origin = req.headers.get('Origin') || '';
  if (origin && !ORIGINS.test(origin)) return json({ ok: false, error: 'Not allowed' }, 403);
  if (Number(req.headers.get('Content-Length') || 0) > 12000) return json({ ok: false, error: 'Too long' }, 413);
  if (await tooMany(req)) return json({ ok: false, fallback: true, error: 'Too many messages. Please wait a few minutes or WhatsApp us.' }, 429);
  let body; try { body = await req.json(); } catch (e) { return json({ ok: false, error: 'Bad request' }, 400); }
  const msgs = (Array.isArray(body.messages) ? body.messages : []).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_MSGS).map(m => ({ role: m.role, content: m.content.replace(/\[\[[^\]]*\]\]/g, '').slice(0, MAX_LEN) }));
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ ok: false, error: 'Bad request' }, 400);
  let D; try { D = await catalog(ctx); } catch (e) { return json({ ok: false, fallback: true, error: 'data' }, 503); }
  const recent = msgs.slice(-4).map(m => m.content).join(' ');
  try {
    const run = env.AI.run(MODEL, { messages: [{ role: 'system', content: systemPrompt(D, recent) }].concat(msgs), max_tokens: 450, temperature: 0.3 });
    const out = await Promise.race([run, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 25000))]);
    let text = String((out && (out.response ?? out.result?.response)) || '').trim();
    if (!text) throw new Error('empty');
    const tags = [...text.matchAll(/\[\[\s*(courses|callback|certificate)\s*:?\s*([^\]]*)\]\]/gi)];
    const titles = new Set(D.courses.map(c => c.t));
    const courses = [...new Set(tags.filter(t => /courses/i.test(t[1])).flatMap(t => t[2].split('|').map(x => x.trim())).filter(x => titles.has(x)))].slice(0, 2);
    const callback = tags.some(t => /callback/i.test(t[1])) && /call|phone|contact|ring|baat|fon|ফোন|কল|कॉल|फोन|बात/i.test(msgs[msgs.length - 1].content);   // only when they asked for it
    // certificate questions get the Certificate page buttons (decided here too, not only by the AI) and only the course cards the visitor named
    const lastQ = msgs[msgs.length - 1].content, cert = /certi|\bcert\b|सर्टिफिकेट|सर्टिफिकेट|प्रमाण ?पत्र|সার্টিফিকেট|সার্টিফিকেট|সনদ/i.test(lastQ) || tags.some(t => /certificate/i.test(t[1]));
    text = text.replace(/\[\[[^\]]*\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return json({ ok: true, reply: text, courses: cert ? courses.filter(t => normT(lastQ).includes(normT(t))) : courses, callback, cert });
  } catch (e) {
    console.log('AI error', String(e && e.message || e));
    return json({ ok: false, fallback: true, error: 'ai' }, 503);
  }
}

/* ---------- shared course links: marstraining.in/course/<slug> ----------
 * Sent by the website's Share button. Serves the Courses page (which then opens that course's details window)
 * with the link preview (title, fee, duration) WhatsApp and email apps show for that course. */
const slugOf = t => normT(t).replace(/ /g, '-');
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
async function coursePage(req, env, ctx, slug) {
  const origin = new URL(req.url).origin;
  let page = await env.ASSETS.fetch(new Request(origin + '/courses.html'));
  if (page.status >= 300 && page.status < 400 && page.headers.get('Location')) page = await env.ASSETS.fetch(new Request(new URL(page.headers.get('Location'), origin)));
  let html = await page.text();
  let c = null, b = null;
  try { const d = await catalog(ctx); c = d.courses.find(x => slugOf(x.t) === slug) || null; if (c) b = d.batches.find(x => normT(x.course) === normT(c.t)) || null; } catch (e) { /* preview falls back to the general one */ }
  const name = c ? c.t : slug.split('-').map(w => w ? w[0].toUpperCase() + w.slice(1) : '').join(' ');
  const fee = c && c.fee ? (c.price < c.fee ? `${inr(c.price)} (offer, regular ${inr(c.fee)})` : inr(c.fee)) : '';
  const desc = [fee && 'Fee ' + fee, c && c.dur, b && 'Next batch ' + niceDay(b.start), 'Live online or classroom in Kolkata', 'Certificate'].filter(Boolean).join(' · ')
    + (c && c.desc ? '. ' + c.desc : '');
  const title = `${name} | MARS Training & Solution`, img = origin + '/assets/logo.png', link = origin + '/course/' + slug;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${attr(desc.slice(0, 300))}">`)
    .replace(/<meta property="og:[^>]*>\s*/g, '')
    .replace(/<head>/, `<head>\n<base href="/">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="MARS Training & Solution">\n<meta property="og:title" content="${attr(title)}">\n<meta property="og:description" content="${attr(desc.slice(0, 300))}">\n<meta property="og:url" content="${attr(link)}">\n<meta property="og:image" content="${attr(img)}">\n<meta name="twitter:card" content="summary">\n<link rel="canonical" href="${attr(link)}">`);
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/api/catalog' && req.method === 'GET') {
      try { return json(await catalog(ctx), 200, { 'Cache-Control': 'public, max-age=60' }); } catch (e) { return json({ ok: false, error: 'data' }, 503); }
    }
    if (url.pathname === '/api/gallery' && req.method === 'GET') {
      try { return json(await gallery(ctx), 200, { 'Cache-Control': 'public, max-age=120' }); } catch (e) { return json({ ok: false, events: [] }, 503); }
    }
    if (url.pathname === '/api/chat') return req.method === 'POST' ? chat(req, env, ctx) : json({ ok: false, error: 'Use POST' }, 405);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not found' }, 404);
    if (/^\/feedback(\.html)?\/?$/i.test(url.pathname)) return Response.redirect(url.origin + '/reviews' + url.search, 301);   // old link (page renamed to Reviews)
    const cm = url.pathname.match(/^\/course\/([a-z0-9-]+)\/?$/i);
    if (cm && req.method === 'GET') return coursePage(req, env, ctx, cm[1].toLowerCase());
    return env.ASSETS.fetch(req);
  }
};

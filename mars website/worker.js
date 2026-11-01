/**
 * marstraining.in – static website + "Ask MARS AI" chat API.
 * Static files are served straight from the assets; this code only runs for /api/* (and for paths with no file).
 *   GET  /api/catalog  compact course data (fees, offer, batches, EMI, hours) for the chat widget
 *   POST /api/chat     { messages: [{ role: 'user'|'assistant', content }] } -> { ok, reply, courses: [titles], callback }
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

/* ---------- course data (from the MARS ENQUIRY sheet via Apps Script), cached ---------- */
let memo = null;
async function catalog(ctx) {
  if (memo && Date.now() - memo.at < CACHE_SECS * 1000) return memo.data;
  const key = new Request('https://marstraining.in/__ai/catalog-v1'), cache = caches.default;
  const hit = await cache.match(key);
  if (hit) { const data = await hit.json(); memo = { at: Date.now(), data }; return data; }
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
    hours: String(S.office_hours || 'Mon – Thu: 10:30 AM – 7:30 PM|Friday: On call|Sat & Sun: 9:30 AM – 6:30 PM').split('|').map(x => x.trim()).filter(Boolean),
    phones: String(S.appointment_phones || '74396 02303|70444 70064').split('|').map(x => x.trim()).filter(x => x.replace(/\D/g, '').length >= 10),
    whatsapp: String(S.whatsapp || '919870259245'), email: 'contactus@marstraining.in', app: String(S.app_url || 'https://app.marstraining.in'),
    lateSmall: num(S.late_fee_small) || 250, lateBig: num(S.late_fee_big) || 500, lateLimit: num(S.late_fee_limit) || 10000,
    faqs: (d.faqs || []).filter(f => f.Question && f.Answer).slice(0, 12).map(f => ({ q: String(f.Question).slice(0, 160), a: String(f.Answer).slice(0, 360) }))
  };
  memo = { at: Date.now(), data };
  ctx.waitUntil(cache.put(key, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_SECS}` } })));
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
- Finish EVERY reply with one last line exactly like [[courses: Exact Title | Exact Title]] naming at most 2 course titles from the list: only the course the visitor asked about, or the one or two you recommend most (or [[courses: ]] if none). Add [[callback]] ONLY when the visitor explicitly asks to be called or contacted, never on your own.

FACTS
Offer: ${D.offer ? `${D.offer.name}: ${D.offer.discount} off${D.offer.end ? ' till ' + niceDay(D.offer.end) : ''} (${D.offer.text})` : 'no offer running'}
Courses (title | area | duration | fee | offer price | payment | modules):
${lines.join('\n')}
Upcoming batches:
${batches}
- Other courses: the student picks a preferred start date when enrolling; batches usually start within 2-3 weeks. Weekday and weekend options.
Mode: live online from anywhere, or classroom at our Kolkata centre (Ground Floor, P-74 Nani Gopal Roy Chowdhury Avenue, CIT Road, Kolkata 700014). Same trainer and certificate.
Office hours: ${D.hours.join('; ')}. Call ${D.phones.join(' / ')}. WhatsApp +${D.whatsapp}. Email ${D.email}.
Certificate: exam at the end; certificate after passing and paying all fees, downloadable from My Courses in our app.
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
    const tags = [...text.matchAll(/\[\[\s*(courses|callback)\s*:?\s*([^\]]*)\]\]/gi)];
    const titles = new Set(D.courses.map(c => c.t));
    const courses = [...new Set(tags.filter(t => /courses/i.test(t[1])).flatMap(t => t[2].split('|').map(x => x.trim())).filter(x => titles.has(x)))].slice(0, 2);
    const callback = tags.some(t => /callback/i.test(t[1])) && /call|phone|contact|ring|baat|fon|ফোন|কল|कॉल|फोन|बात/i.test(msgs[msgs.length - 1].content);   // only when they asked for it
    text = text.replace(/\[\[[^\]]*\]\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    return json({ ok: true, reply: text, courses, callback });
  } catch (e) {
    console.log('AI error', String(e && e.message || e));
    return json({ ok: false, fallback: true, error: 'ai' }, 503);
  }
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/api/catalog' && req.method === 'GET') {
      try { return json(await catalog(ctx), 200, { 'Cache-Control': 'public, max-age=300' }); } catch (e) { return json({ ok: false, error: 'data' }, 503); }
    }
    if (url.pathname === '/api/chat') return req.method === 'POST' ? chat(req, env, ctx) : json({ ok: false, error: 'Use POST' }, 405);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not found' }, 404);
    return env.ASSETS.fetch(req);
  }
};

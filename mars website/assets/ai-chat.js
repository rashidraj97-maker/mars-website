/* "Ask MARS AI" – chat assistant for marstraining.in.
 * Answers come from /api/chat (Cloudflare Workers AI, free daily allowance) using live course data from the MARS ENQUIRY sheet.
 * If the AI is unavailable, the widget answers common questions itself from the same data, so visitors never see an error.
 * Call-back requests go to the Apps Script server (action chatLead): Enquiries tab + email to notify_email. */
(function () {
  if (window.__marsAi) return; window.__marsAi = true;
  const LEADS = (typeof SITE !== 'undefined' && SITE.api) || 'https://script.google.com/macros/s/AKfycbyXxbiBJtACn_OVfPzgAOb0vXe2xJJZUjW0ouAekolDCbmyvLh4OVPH4QVZKEcaXm72/exec';
  const API = (window.MARS_AI_API || '').replace(/\/$/, '');
  const LOGO = 'assets/mars-round.png';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const store = (k, v) => { try { if (v === undefined) return JSON.parse(sessionStorage.getItem(k) || 'null'); sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } };
  const niceDay = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? `${+m[3]} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1]}` : ''; };

  /* ---------- styles (all scoped under #mai so the website's own styles are untouched) ---------- */
  const css = `
#mai{--mai-ink:#0B1630;--mai-text:#2A3A55;--mai-muted:#5E6E86;--mai-paper:#F4F7FC;--mai-line:#E1E8F2;--mai-brand:#2A6EB5;--mai-violet:#7B61FF;--mai-gold:#FFC23C;
  --mai-grad:linear-gradient(135deg,#2A6EB5 0%,#5B5BEF 60%,#7B61FF 100%);font:15px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--mai-text)}
#mai *{box-sizing:border-box}
#mai .mai-launch{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(90px + env(safe-area-inset-bottom,0px));z-index:45;width:58px;height:58px;padding:0;border:0;border-radius:50%;background:var(--mai-grad);color:#fff;display:grid;place-items:center;cursor:pointer;animation:mai-ring 2.4s ease-out infinite;transition:transform .2s}
#mai .mai-launch:hover{transform:scale(1.06)}
@keyframes mai-ring{0%{box-shadow:0 12px 30px -6px rgba(91,91,239,.6),0 0 0 0 rgba(123,97,255,.55)}70%{box-shadow:0 12px 30px -6px rgba(91,91,239,.6),0 0 0 14px rgba(123,97,255,0)}100%{box-shadow:0 12px 30px -6px rgba(91,91,239,.6),0 0 0 0 rgba(123,97,255,0)}}
#mai .mai-av{width:42px;height:42px;border-radius:50%;background:#fff;display:grid;place-items:center;position:relative;flex:none}
#mai .mai-av img{width:36px;height:36px;border-radius:50%;display:block}
#mai .mai-av i{position:absolute;right:0;bottom:2px;width:11px;height:11px;border-radius:50%;background:#22C55E;border:2px solid #fff}
#mai .mai-launch .mai-av{width:48px;height:48px}
#mai .mai-launch .mai-av img{width:42px;height:42px}
#mai .mai-ai{position:absolute;top:-5px;right:-7px;background:var(--mai-gold);color:var(--mai-ink);font:800 10px/1 "Plus Jakarta Sans",Inter,sans-serif;letter-spacing:.04em;padding:4px 6px;border-radius:99px;box-shadow:0 0 0 2px #fff}
#mai .mai-lbl{position:absolute;right:calc(100% + 12px);top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;background:var(--mai-ink);color:#fff;font:600 13px/1 Inter,sans-serif;padding:9px 12px;border-radius:10px;box-shadow:0 8px 20px rgba(6,18,42,.25);opacity:0;pointer-events:none;transition:opacity .15s,transform .15s}
#mai .mai-launch:hover .mai-lbl,#mai .mai-launch:focus-visible .mai-lbl{opacity:1;transform:translateY(-50%)}
#mai .mai-launch:focus-visible{outline:3px solid var(--mai-gold);outline-offset:4px}
#mai .mai-x{display:none;font-size:28px;line-height:1}
#mai .mai-launch[aria-expanded="true"] .mai-lbl,#mai .mai-launch[aria-expanded="true"] .mai-av,#mai .mai-launch[aria-expanded="true"] .mai-ai{display:none}
#mai .mai-launch[aria-expanded="true"] .mai-x{display:block}
@media(hover:none){#mai .mai-lbl{display:none}}
#mai .mai-teaser{position:fixed;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(160px + env(safe-area-inset-bottom,0px));z-index:45;width:250px;max-width:calc(100vw - 40px);background:#fff;border:1px solid var(--mai-line);border-radius:16px 16px 4px 16px;box-shadow:0 14px 34px rgba(6,18,42,.18);padding:12px 34px 12px 14px;font-size:14px;color:var(--mai-ink);cursor:pointer;animation:mai-pop .35s ease both}
#mai .mai-teaser b{font-family:"Plus Jakarta Sans",Inter,sans-serif}
#mai .mai-teaser button{position:absolute;top:6px;right:6px;border:0;background:none;color:var(--mai-muted);font-size:18px;cursor:pointer;width:26px;height:26px}
@keyframes mai-pop{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
#mai .mai-chat{position:fixed;z-index:46;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(160px + env(safe-area-inset-bottom,0px));width:min(400px,calc(100vw - 32px));height:min(640px,calc(100vh - 190px));background:#fff;border-radius:24px;box-shadow:0 30px 80px rgba(6,18,42,.32),0 0 0 1px rgba(6,18,42,.06);display:flex;flex-direction:column;overflow:hidden;transform-origin:bottom right;animation:mai-open .28s cubic-bezier(.2,1,.3,1) both}
@keyframes mai-open{from{opacity:0;transform:translateY(16px) scale(.94)}to{opacity:1;transform:none}}
#mai [hidden]{display:none!important}
@media(max-width:600px){#mai .mai-chat{left:8px;right:8px;width:auto;top:calc(8px + env(safe-area-inset-top,0px));bottom:calc(158px + env(safe-area-inset-bottom,0px));height:auto;border-radius:20px}}
#mai .mai-top{position:relative;padding:16px 16px 18px;color:#fff;background:radial-gradient(120% 160% at 100% 0%,#7B61FF 0%,transparent 55%),linear-gradient(135deg,#0B2A5B,#1F5EA8);overflow:hidden;flex:none}
#mai .mai-top::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.14) 1px,transparent 1.2px);background-size:14px 14px;-webkit-mask-image:linear-gradient(90deg,transparent,#000);mask-image:linear-gradient(90deg,transparent,#000);pointer-events:none}
#mai .mai-row1{position:relative;z-index:1;display:flex;align-items:center;gap:12px}
#mai .mai-top .mai-av{width:46px;height:46px;box-shadow:0 0 0 3px rgba(255,255,255,.25)}
#mai .mai-top .mai-av img{width:40px;height:40px}
#mai .mai-top .mai-av i{border-color:#0B2A5B}
#mai .mai-top b{display:block;font:800 16px/1.2 "Plus Jakarta Sans",Inter,sans-serif;color:#fff}
#mai .mai-top small{color:#C9D9F2;font-size:12px}
#mai .mai-tools{margin-left:auto;display:flex;gap:6px}
#mai .mai-tools button{width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;display:grid;place-items:center;padding:0}
#mai .mai-tools button:hover{background:rgba(255,255,255,.24)}
#mai .mai-tools svg{width:17px;height:17px}
#mai .mai-tools button:focus-visible{outline:2px solid var(--mai-gold)}
#mai .mai-log{flex:1;min-height:0;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;background:linear-gradient(180deg,#F6F8FD,#FFFFFF);overscroll-behavior:contain}
#mai .mai-hello{display:grid;gap:12px;animation:mai-pop .35s ease both}
#mai .mai-h{font:800 24px/1.15 "Plus Jakarta Sans",Inter,sans-serif;color:var(--mai-ink);letter-spacing:-.02em}
#mai .mai-h span{background:var(--mai-grad);-webkit-background-clip:text;background-clip:text;color:transparent}
#mai .mai-hello p{margin:0;color:var(--mai-muted);font-size:14px}
#mai .mai-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
#mai .mai-tile{display:grid;gap:8px;text-align:left;padding:12px;border-radius:16px;border:1px solid var(--mai-line);background:#fff;cursor:pointer;font:600 13.5px/1.3 Inter,sans-serif;color:var(--mai-ink);transition:transform .15s,box-shadow .15s}
#mai .mai-tile:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(11,22,48,.08)}
#mai .mai-tile:focus-visible{outline:2px solid var(--mai-brand);outline-offset:2px}
#mai .mai-ic{width:34px;height:34px;border-radius:11px;display:grid;place-items:center}
#mai .mai-ic svg{width:18px;height:18px}
#mai .mai-tile small{display:block;font-weight:500;color:var(--mai-muted);font-size:12px;margin-top:2px}
#mai .mai-ic.v{background:#F1ECFF;color:#6D28D9}#mai .mai-ic.g{background:#FFF4D6;color:#B45309}#mai .mai-ic.e{background:#E7F7EE;color:#15803D}#mai .mai-ic.b{background:#E8F0FC;color:#1D4ED8}
#mai .mai-r{display:flex;gap:8px;align-items:flex-end}
#mai .mai-r.mai-me{justify-content:flex-end}
#mai .mai-mini{width:28px;height:28px;border-radius:50%;flex:none;background:#fff;box-shadow:0 0 0 1px var(--mai-line)}
#mai .mai-m{max-width:84%;padding:10px 13px;border-radius:18px;font-size:14px;line-height:1.5;overflow-wrap:anywhere;animation:mai-pop .25s ease both}
#mai .mai-m p{margin:0}#mai .mai-m p+p{margin-top:6px}
#mai .mai-bot .mai-m{background:#fff;border:1px solid var(--mai-line);color:var(--mai-text);border-bottom-left-radius:6px;box-shadow:0 2px 8px rgba(11,22,48,.04)}
#mai .mai-me .mai-m{background:var(--mai-grad);color:#fff;border-bottom-right-radius:6px;box-shadow:0 6px 16px rgba(91,91,239,.25)}
#mai .mai-m b{color:var(--mai-ink)}#mai .mai-me .mai-m b{color:#fff}
#mai .mai-m ul{margin:6px 0 0;padding-left:18px}#mai .mai-m li{margin:2px 0}
#mai .mai-note{font-size:12px;color:var(--mai-muted)}
#mai .mai-cc{margin-top:10px;border-radius:14px;overflow:hidden;border:1px solid var(--mai-line);background:#fff}
#mai .mai-cv{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--cv);color:#fff;position:relative}
#mai .mai-cv::after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:22px 18px;pointer-events:none}
#mai .mai-tl{position:relative;z-index:1;width:34px;height:34px;border-radius:10px;background:#fff;color:var(--cv);display:grid;place-items:center;font:800 12px "Plus Jakarta Sans",Inter,sans-serif;flex:none}
#mai .mai-nm{position:relative;z-index:1;font:700 14px/1.25 "Plus Jakarta Sans",Inter,sans-serif;color:#fff}
#mai .mai-off{position:relative;z-index:1;margin-left:auto;font-size:10.5px;font-weight:800;letter-spacing:.03em;background:#fff;color:#B91C1C;border-radius:99px;padding:3px 8px;white-space:nowrap}
#mai .mai-bd{padding:10px 12px;display:grid;gap:6px}
#mai .mai-pr{display:flex;align-items:baseline;gap:8px}
#mai .mai-pr b{font:800 20px/1.2 "Plus Jakarta Sans",Inter,sans-serif;color:var(--mai-ink)}
#mai .mai-pr s{color:#94A3B8;font-size:13px}
#mai .mai-pr span{margin-left:auto;font-size:11.5px;color:#B45309;font-weight:600}
#mai .mai-mt{display:flex;flex-wrap:wrap;gap:5px}
#mai .mai-mt span{font-size:11.5px;font-weight:600;color:#334155;background:var(--mai-paper);border-radius:7px;padding:3px 7px}
#mai .mai-mt span.mai-gn{background:#E7F7EE;color:#15803D}
#mai .mai-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
#mai .mai-acts a,#mai .mai-acts button{font:600 12.5px/1.2 Inter,sans-serif;border-radius:10px;padding:8px 11px;text-decoration:none;cursor:pointer;border:1px solid var(--mai-line);background:#fff;color:var(--mai-brand);display:inline-flex;align-items:center;gap:6px}
#mai .mai-acts .mai-pri{background:var(--mai-grad);color:#fff;border-color:transparent;box-shadow:0 6px 14px rgba(91,91,239,.25)}
#mai .mai-acts .mai-wa{background:#E8F9EE;color:#0E7A3B;border-color:#BDEBCD}
#mai .mai-acts svg{width:14px;height:14px}
#mai .mai-acts button:disabled{opacity:.55;cursor:default}
#mai .mai-typing{display:flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid var(--mai-line);border-radius:18px;border-bottom-left-radius:6px}
#mai .mai-typing i{width:7px;height:7px;border-radius:50%;background:var(--mai-violet);opacity:.5;animation:mai-b 1s infinite}
#mai .mai-typing i:nth-child(2){animation-delay:.15s}#mai .mai-typing i:nth-child(3){animation-delay:.3s}
@keyframes mai-b{50%{opacity:1;transform:translateY(-3px)}}
#mai .mai-sugg{display:flex;gap:6px;overflow-x:auto;padding:10px 14px 2px;background:#fff;scrollbar-width:none;flex:none;-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent)}
#mai .mai-sugg::-webkit-scrollbar{display:none}
#mai .mai-sugg button{flex:none;font:600 12.5px/1.2 Inter,sans-serif;border:1px solid #D5E2F3;background:#EEF3FD;color:var(--mai-brand);border-radius:99px;padding:7px 12px;cursor:pointer}
#mai .mai-sugg button:focus-visible,#mai .mai-acts a:focus-visible,#mai .mai-acts button:focus-visible{outline:2px solid var(--mai-gold);outline-offset:1px}
#mai form{display:flex;gap:8px;padding:10px 12px 8px;background:#fff;margin:0;flex:none}
#mai .mai-box{flex:1;min-width:0;display:flex;align-items:center;gap:8px;border:1.5px solid var(--mai-line);border-radius:16px;padding:0 6px 0 12px;background:var(--mai-paper);transition:border-color .15s,box-shadow .15s}
#mai .mai-box:focus-within{border-color:#8DB4E6;box-shadow:0 0 0 4px rgba(42,110,181,.12);background:#fff}
#mai .mai-box svg{width:17px;height:17px;color:var(--mai-violet);flex:none}
#mai .mai-box input{flex:1;min-width:0;border:0;background:transparent;padding:12px 0;font:400 16px/1.3 Inter,sans-serif;color:var(--mai-ink);outline:none;margin:0}
#mai .mai-send{width:42px;height:42px;border:0;border-radius:12px;background:var(--mai-grad);color:#fff;display:grid;place-items:center;cursor:pointer;flex:none;padding:0}
#mai .mai-send:disabled{opacity:.5;cursor:default}
#mai .mai-send svg{width:18px;height:18px}
#mai .mai-send:focus-visible{outline:2px solid var(--mai-gold);outline-offset:2px}
#mai .mai-foot{font-size:11px;color:var(--mai-muted);text-align:center;padding:0 12px 10px;background:#fff;flex:none}
@media(prefers-reduced-motion:reduce){#mai .mai-launch,#mai .mai-chat,#mai .mai-m,#mai .mai-hello,#mai .mai-teaser,#mai .mai-typing i{animation:none}}`;

  /* ---------- markup ---------- */
  const IC = {
    cap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>'
  };
  const root = document.createElement('div'); root.id = 'mai';
  root.innerHTML = `<style>${css}</style>
  <button type="button" class="mai-launch" aria-expanded="false" aria-controls="mai-chat" aria-label="Ask MARS AI"><span class="mai-av"><img src="${LOGO}" alt=""></span><span class="mai-ai">AI</span><span class="mai-lbl">Ask MARS AI</span><span class="mai-x" aria-hidden="true">×</span></button>
  <div class="mai-teaser" hidden role="button" tabindex="0"><b>Hi! 👋</b> Not sure which course to pick? Ask me, I reply in seconds.<button type="button" class="mai-tx" aria-label="Hide">×</button></div>
  <section class="mai-chat" id="mai-chat" aria-label="MARS AI assistant" hidden>
    <div class="mai-top"><div class="mai-row1"><span class="mai-av"><img src="${LOGO}" alt=""><i></i></span><div><b>MARS AI Assistant</b><small>Online · replies in seconds</small></div>
      <div class="mai-tools"><button type="button" class="mai-reset" aria-label="Start over"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button><button type="button" class="mai-close" aria-label="Close chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div></div></div>
    <div class="mai-log" aria-live="polite"></div>
    <div class="mai-sugg"></div>
    <form autocomplete="off"><label class="mai-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/></svg><input id="mai-q" maxlength="500" placeholder="Ask anything about our courses…" aria-label="Type your question"></label><button class="mai-send" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>
    <div class="mai-foot">AI answers can be wrong · fees are confirmed when you enroll</div>
  </section>`;
  document.body.appendChild(root);
  const $ = s => root.querySelector(s), log = $('.mai-log'), chat = $('.mai-chat'), launch = $('.mai-launch'), teaser = $('.mai-teaser'), input = $('#mai-q'), send = $('.mai-send');

  /* ---------- course data (for cards and the built-in answers) ---------- */
  let D = null, loading = null;
  const loadData = () => loading || (loading = fetch(API + '/api/catalog').then(r => r.ok ? r.json() : null).then(d => { if (d && d.courses) D = d; return D; }).catch(() => D));
  const byT = t => D && D.courses.find(c => c.t === t);
  const offerOn = c => c && c.price < c.fee;
  function cover(t) {
    const s = t.toLowerCase(), has = (...w) => w.some(x => s.includes(x));
    if (has('ms office')) return ['#1E3A8A', 'WPX']; if (has('power bi')) return ['#2B2B2B', 'BI']; if (has('tableau')) return ['#1F3B57', 'T'];
    if (has('sql')) return ['#0B3B60', 'SQL']; if (has('python', 'machine learning')) return ['#1E2A44', 'Py']; if (has('vba', 'macro')) return ['#0F5132', 'VBA'];
    if (has('business analytics')) return ['#0B2E4F', 'BA']; if (has('data analytics')) return ['#1B1340', 'DA']; if (has('mis')) return ['#14324F', 'MIS'];
    if (has('excel', 'calc', 'power query', 'power pivot')) return ['#107C41', 'X']; if (has('google', 'app script', 'looker')) return ['#188038', 'G'];
    if (has('powerpoint', 'presentation')) return ['#B7472A', 'P']; if (has('word', 'writer')) return ['#2B579A', 'W']; if (has('outlook')) return ['#0F6CBD', 'O'];
    if (has('access')) return ['#A4373A', 'A']; if (has('tally')) return ['#0B5C5C', 'T']; if (has('sap', 'netsuite')) return ['#0A3D6B', 'ERP'];
    if (has('gen ai', 'claude')) return ['#061733', 'AI']; if (has('career', 'interview')) return ['#7C2D12', 'Hi']; if (has('web app')) return ['#111827', '</>'];
    return ['#1B4F86', t.slice(0, 2).toUpperCase()];
  }
  const batchOf = c => D && D.batches.find(b => b.course === c.t);
  function card(c) {
    const [bg, lb] = cover(c.t), b = batchOf(c), e = c.emi.map(p => p.n);
    const meta = [c.dur, c.mods ? c.mods.length + ' modules' : '', 'Certificate', 'Online / Kolkata'].filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('') +
      (e.length ? `<span class="mai-gn">EMI ${e.join(' or ')} parts</span>` : '') + (b ? `<span class="mai-gn">Batch ${esc(niceDay(b.start))}</span>` : '');
    return `<div class="mai-cc" style="--cv:${bg}"><div class="mai-cv"><span class="mai-tl">${esc(lb)}</span><span class="mai-nm">${esc(c.t)}</span>${offerOn(c) ? `<span class="mai-off">${esc((c.off || 'Offer').toUpperCase())}</span>` : ''}</div>
      <div class="mai-bd"><div class="mai-pr"><b>${inr(c.price)}</b>${offerOn(c) ? `<s>${inr(c.fee)}</s>${c.offEnd ? `<span>till ${esc(niceDay(c.offEnd))}</span>` : ''}` : ''}</div><div class="mai-mt">${meta}</div></div></div>`;
  }
  const appUrl = c => (D && D.app || 'https://app.marstraining.in').replace(/\/$/, '') + '/?course=' + encodeURIComponent(c.t) + '#enroll';
  const waUrl = msg => 'https://wa.me/' + ((D && D.whatsapp) || '919870259245') + '?text=' + encodeURIComponent(msg);
  function actions(c) {
    const mods = c && (c.mods || c.hl.length) ? `<button type="button" data-ask="What will I learn in ${esc(c.t)}?">${IC.list}${c.mods ? 'Modules' : 'Syllabus'}</button>` : '';
    return `<div class="mai-acts">${c ? `<a class="mai-pri" href="${esc(appUrl(c))}" target="_blank" rel="noopener">${IC.cap}Enroll now</a>${mods}` : `<button type="button" data-ask="Please call me back">${IC.phone}Call me back</button>`}<a class="mai-wa" href="${esc(waUrl(c ? 'Hi MARS, I have a question about ' + c.t : 'Hi MARS, I have a question'))}" target="_blank" rel="noopener">${IC.wa}WhatsApp</a></div>`;
  }
  // **bold**, "- " bullets, line breaks; everything else escaped
  function md(t) {
    const out = []; let list = null;
    String(t || '').split(/\n/).forEach(line => {
      const l = line.trim(), b = /^([-*•]|\d+[.)])\s+(.*)$/.exec(l);
      const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '$1');
      if (b) { if (!list) { list = []; out.push(list); } list.push(`<li>${fmt(b[2])}</li>`); }
      else { list = null; if (l) out.push(`<p>${fmt(l)}</p>`); }
    });
    return out.map(x => Array.isArray(x) ? `<ul>${x.join('')}</ul>` : x).join('');
  }

  /* ---------- built-in answers (used when the AI is busy or its free daily limit is used up) ---------- */
  const ALIAS = [['business analytics with gen ai', 'Business Analytics with Gen AI'], ['business analytics', 'Business Analytics'], ['data analytics with ai', 'Data Analytics with AI'], ['data analytics', 'Data Analytics'],
    ['data analyst', 'Data Analytics'], ['mis with gen ai', 'MIS with Gen AI'], ['mis', 'MIS Specialist'], ['advanced excel with ai', 'Advanced Excel with AI'], ['excel with ai', 'Advanced Excel with AI'], ['advanced excel', 'Advanced Excel'],
    ['advance excel', 'Advanced Excel'], ['basic excel', 'Basic Excel'], ['excel', 'Advanced Excel'], ['power bi', 'Power BI'], ['powerbi', 'Power BI'], ['sql', 'SQL'], ['python', 'Python with AI'], ['gen ai', 'Gen AI'],
    ['genai', 'Gen AI'], ['chatgpt', 'Gen AI'], ['claude', 'Claude AI'], ['machine learning', 'Machine Learning (ML)'], ['ms office', 'MS Office'], ['word', 'MS Word'], ['powerpoint', 'MS PowerPoint'], ['ppt', 'MS PowerPoint'],
    ['outlook', 'MS Outlook'], ['vba', 'VBA/Macros'], ['macro', 'VBA/Macros'], ['tableau', 'Tableau'], ['looker', 'Google sheets With Looker Studio'], ['app script', 'Google Sheets with App script (AUTOMATION)'],
    ['google sheet', 'Google Sheet'], ['power query', 'Power Query'], ['power pivot', 'Power Pivot'], ['tally', 'Tally'], ['sap fico', 'SAP FICO'], ['sap', 'SAP FICO'], ['netsuite', 'NetSuite'], ['computer', 'Basics of Computer'],
    ['web app', 'Web App Development (Full Stack)'], ['interview', 'Career Communication & Interview Skills Program'], ['spoken english', 'Career Communication & Interview Skills Program']];
  function findCourse(t) {
    if (!D) return null;
    for (const [w, title] of ALIAS) if (new RegExp('(^|[^a-z])' + w + '([^a-z]|$)').test(t)) { const c = byT(title) || D.courses.find(x => x.t.toLowerCase().startsWith(title.toLowerCase())); if (c) return c; }
    return D.courses.find(c => t.includes(c.t.toLowerCase())) || null;
  }
  function builtIn(raw) {
    const t = ' ' + raw.toLowerCase().replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ') + ' ', has = (...w) => w.some(x => t.includes(x));
    if (!D) return { html: `<p>Sorry, I can't reach our course list right now. Please WhatsApp us or tap <b>Call me back</b>.</p>`, course: null };
    const c = findCourse(t);
    if (has('learn in', 'module', 'syllabus', 'topics', 'cover') && c) return { html: c.mods ? `<p><b>${esc(c.t)}</b> has ${c.mods.length} modules:</p><ul>${c.mods.map((m, i) => `<li>Module ${i + 1}: ${esc(m)}</li>`).join('')}</ul>` : `<p>In <b>${esc(c.t)}</b> you'll learn:</p><ul>${c.hl.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`, course: c };
    if (has('emi', 'installment', 'instalment', 'kist')) return c && c.emi.length ? { html: `<p><b>${esc(c.t)}</b> can be paid in parts:</p><ul>${c.emi.map(p => `<li><b>${p.n} installments</b>: ${inr(p.first)} today, rest every 30 days (total ${inr(p.total)})</li>`).join('')}</ul>`, course: c }
      : { html: `<p>Most longer courses can be paid in <b>2 or 3 installments</b>, 30 days apart, with a small extra fee. Tell me the course name for exact amounts.</p>`, course: c };
    if (has('batch', 'weekend', 'start', 'when', 'kab')) return { html: D.batches.length ? `<p>Upcoming batches:</p><ul>${D.batches.slice(0, 4).map(b => `<li><b>${esc(b.course)}</b>: ${esc(niceDay(b.start))}, ${esc(b.timing)}</li>`).join('')}</ul><p>For other courses you pick your start date when you enroll.</p>` : `<p>You pick your preferred start date when you enroll; batches usually start within 2–3 weeks.</p>`, course: c };
    if (CERT_W.test(raw)) return { html: `<p>Every MARS course comes with a <b>MARS Course Completion certificate</b>. You get it after you complete the course, pass the final exam and pay all fees.</p>` + askDetails().replace(/<div class="mai-acts">[\s\S]*$/, ''), course: null, cert: true };
    if (has('office', 'timing', 'open', 'hours')) return { html: `<p>Office hours:</p><ul>${D.hours.map(h => `<li>${esc(h)}</li>`).join('')}</ul><p>Call ${esc(D.phones.join(' / '))}.</p>`, course: null };
    if (has('where', 'address', 'location', 'classroom', 'online', 'offline')) return { html: `<p>Learn <b>live online</b> from anywhere, or in a <b>classroom at our Kolkata centre</b>: Ground Floor, P-74 Nani Gopal Roy Chowdhury Avenue, CIT Road, Kolkata 700014.</p>`, course: c };
    if (c) return { html: `<p><b>${esc(c.t)}</b>: ${offerOn(c) ? `<b>${inr(c.price)}</b> with the current offer (regular ${inr(c.fee)})` : `<b>${inr(c.fee)}</b>`}, ${esc(c.dur)}.</p>${c.desc ? `<p>${esc(c.desc)}</p>` : ''}`, course: c };
    if (has('fee', 'price', 'cost', 'kitna')) return { html: `<p>A few popular courses:</p><ul>${['Advanced Excel', 'Power BI', 'SQL', 'Data Analytics', 'MS Office'].map(byT).filter(Boolean).map(x => `<li>${esc(x.t)}: <b>${inr(x.price)}</b></li>`).join('')}</ul><p>Tell me a course name for full details.</p>`, course: null };
    return { html: `<p>I'm not sure about that one. Our team can help on WhatsApp, or I can ask a counsellor to call you.</p>`, course: null };
  }

  /* ---------- certificates: the chat fetches them itself (same check as the Certificate page: Enrollment ID + registered mobile) ---------- */
  const CERT_W = /certi|\bcert\b|सर्टिफिकेट|सर्टिफिकेट|प्रमाण ?पत्र|সার্টিফিকেট|সার্টিফিকেট|সনদ/i;
  const MINE = /download|pdf|hard ?copy|soft ?copy|print|lost|\bmy\b|\bmine\b|mera|meri|mere|mujhe|apna|amar|amake|আমার|मेरा|मेरी|मुझे|get (it|mine)|send (it|me)|where (is|can|do)|kahan|kaha|kothay|কোথায়|कहाँ|kab (milega|tak|ayega|aayega)|ready|enrol+ment (id|no|number)/i;
  const VER_W = /verif|genuine|original|fake|authentic|\bvalid|\breal\b|check (a|the|this|his|her|their|candidate|employee)|असली|नकली|আসল|নকল/i;
  const enrId = s => { const m = /\bMARS[\s-]*(\d{4})[\s-]*(\d{3,5})(?!\d)/i.exec(s); return m ? `MARS-${m[1]}-${m[2]}` : ''; };
  const certNoIn = s => { const m = /\bMARS[\s-]*(\d{4})[\s-]*CL[\s-]*(\d{3,6})(?!\d)/i.exec(s); return m ? `MARS-${m[1]}-CL-${m[2]}` : ''; };
  const phoneIn = s => { const m = /(?:^|[^\d])(?:\+?91[\s-]*|0)?([6-9]\d{4})[\s-]?(\d{5})(?!\d)/.exec(String(s).replace(/\bMARS[\s-]*\d{4}[\s-]*(CL[\s-]*)?\d{3,6}/gi, ' ')); return m ? m[1] + m[2] : ''; };
  const ICC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/></svg>';
  const ICD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';
  const certLinks = (id, verify) => `<div class="mai-acts"><a class="mai-pri" href="certificate.html${id ? '?id=' + encodeURIComponent(id) : ''}">${ICC}Certificate page</a>${verify ? `<a href="certificate.html${verify === true ? '' : '?verify=' + encodeURIComponent(verify)}#verify">${IC.list}Verify a certificate</a>` : ''}<a class="mai-wa" href="${esc(waUrl('Hi MARS, I need help with my certificate'))}" target="_blank" rel="noopener">${IC.wa}WhatsApp</a></div>`;
  const askDetails = intro => `${intro || ''}<p>I can get your certificate right here. Please type your <b>Enrollment ID</b> (for example MARS-2611-0012) and the <b>mobile number</b> you enrolled with.</p><p class="mai-note">Your Enrollment ID is in your enrollment email. You can also download it on our Certificate page.</p>${certLinks('', true)}`;
  const verifyHtml = no => `<p>Companies and institutes can check any MARS certificate on our <b>Verify a certificate</b> page: enter the certificate ID${no ? ` (<b>${esc(no)}</b>)` : ', like MARS-2026-CL-1540,'} and the candidate's name. If it is genuine, the certificate opens in a preview.</p><div class="mai-acts"><a class="mai-pri" href="certificate.html${no ? '?verify=' + encodeURIComponent(no) : ''}#verify">${IC.list}Verify ${no ? 'this' : 'a'} certificate</a></div>`;
  const post = b => fetch(LEADS, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(b) }).then(x => x.json());
  async function certFetch(C) {
    typing(true); send.disabled = true;
    let r = null; try { r = await post({ action: 'certLookup', id: C.id, phone: C.ph }); } catch (e) { }
    typing(false); send.disabled = false;
    if (!r) return bubble('bot', `<p>I couldn't reach our server just now. Please try again, or download it on the Certificate page.</p>${certLinks(C.id)}`);
    if (!r.ok) {   // wrong details: let them type them again
      S.cert = /could not find/i.test(r.error || '') ? { want: 1 } : null; save();
      return bubble('bot', `<p>${esc(r.error || 'Something went wrong.')}</p>${certLinks(C.id)}`);
    }
    S.cert = null; save();
    const who = `<p>Hi <b>${esc(r.name)}</b>! I found your enrollment for <b>${esc(r.course)}</b>.</p>`;
    if (!r.ready) return bubble('bot', `${who}<p>${esc(r.reason)}</p><div class="mai-acts"><a class="mai-pri" href="${esc(((D && D.app) || 'https://app.marstraining.in').replace(/\/$/, ''))}" target="_blank" rel="noopener">${IC.cap}Open MARS app</a><a class="mai-wa" href="${esc(waUrl('Hi MARS, about my certificate. Enrollment ID ' + C.id))}" target="_blank" rel="noopener">${IC.wa}WhatsApp</a></div>`);
    bubble('bot', `<p>Here's your certificate, <b>${esc(r.name)}</b> 🎓</p><p><b>${esc(r.course)}</b><br>Certificate ID: <b>${esc(r.certNo)}</b></p>
      <div class="mai-acts"><a class="mai-pri" href="${esc(r.download)}" target="_blank" rel="noopener">${ICD}Download PDF</a><a href="${esc(r.view)}" target="_blank" rel="noopener">${ICC}View</a></div>
      <p class="mai-note" style="margin-top:10px">Want a printed copy? Collect it from our office 10 days after you request it.</p><div class="mai-acts"><button type="button" data-hc="${esc(C.id + '|' + C.ph)}">${ICC}Request hard copy</button></div>`);
  }
  async function hardCopy(btn) {
    const [id, ph] = btn.dataset.hc.split('|'); btn.disabled = true;
    typing(true); send.disabled = true;
    let r = null; try { r = await post({ action: 'certLookup', id, phone: ph, hardcopy: true }); } catch (e) { }
    typing(false); send.disabled = false;
    const h = r && r.ok && r.hardcopy;
    if (!h) { btn.disabled = false; return bubble('bot', `<p>${esc((r && (r.error || r.reason)) || "I couldn't send that just now. Please try again, or request it on the Certificate page.")}</p>${certLinks(id)}`); }
    bubble('bot', `<p><b>${h.again ? 'Hard copy already requested' : 'Hard copy requested ✓'}</b> on ${esc(h.requested)}.</p><p>Collect it from our office on or after <b>${esc(h.collectFrom)}</b>. Please bring your Enrollment ID.</p>`);
  }
  // returns true when the message was handled here (it never goes to the AI: it can hold a phone number)
  function certFlow(q) {
    const id = enrId(q), ph = phoneIn(q), no = certNoIn(q), word = CERT_W.test(q);
    if (no && !id) { S.cert = null; save(); bubble('bot', verifyHtml(no)); return true; }
    if (/^(cancel|no|stop|nahi|nahin|na)$/i.test(q.trim()) && S.cert) { S.cert = null; save(); bubble('bot', '<p>No problem. Ask me anything else.</p>'); return true; }
    if (!id && !ph) {
      if (word && VER_W.test(q) && !/\b(my|mera|meri|amar)\b/i.test(q)) { S.cert = null; save(); bubble('bot', verifyHtml('')); return true; }
      if (!(word && MINE.test(q))) { if (S.cert && !word) { S.cert = null; save(); } return false; }   // another question (or a general certificate question): the AI answers it
    }
    const C = S.cert = Object.assign({}, S.cert, id && { id }, ph && { ph });
    if (!word && !C.want && C.id && C.ph) { C.want = 1; save(); bubble('bot', `<p>Thanks! I can get your <b>certificate</b> right here. For payments, classes and course progress, please open the MARS app.</p><div class="mai-acts"><button type="button" class="mai-pri" data-ask="Get my certificate">${ICC}Get my certificate</button><a href="${esc(((D && D.app) || 'https://app.marstraining.in').replace(/\/$/, ''))}" target="_blank" rel="noopener">${IC.cap}Open MARS app</a></div>`); return true; }
    C.want = 1; save();
    if (C.id && C.ph) { certFetch(C); return true; }
    if (C.id) bubble('bot', `<p>Thanks! Now the <b>mobile number</b> you enrolled with?</p>`);
    else if (C.ph) bubble('bot', `<p>Thanks! Now your <b>Enrollment ID</b>? It looks like MARS-2611-0012 and is in your enrollment email.</p>`);
    else bubble('bot', askDetails());
    return true;
  }

  /* ---------- conversation ---------- */
  let S = store('mai_state') || { msgs: [], view: [], lead: null };   // msgs: for the AI; view: rendered bubbles
  const save = () => { S.msgs = S.msgs.slice(-12); S.view = S.view.slice(-30); store('mai_state', S); };
  const avatar = `<img class="mai-mini" src="${LOGO}" alt="">`;
  function bubble(who, html, keep = true) {
    const hello = log.querySelector('.mai-hello'); if (hello) hello.remove();
    const r = document.createElement('div'); r.className = 'mai-r mai-' + who; r.innerHTML = (who === 'bot' ? avatar : '') + `<div class="mai-m">${html}</div>`;
    log.appendChild(r); log.scrollTop = log.scrollHeight;
    if (keep) { S.view.push([who, html]); save(); }
  }
  function typing(on) {
    let t = log.querySelector('.mai-typing-row');
    if (on && !t) { t = document.createElement('div'); t.className = 'mai-r mai-bot mai-typing-row'; t.innerHTML = avatar + '<div class="mai-typing"><i></i><i></i><i></i></div>'; log.appendChild(t); log.scrollTop = log.scrollHeight; }
    if (!on && t) t.remove();
  }
  function welcome() {
    S = { msgs: [], view: [], lead: null }; save();
    log.innerHTML = `<div class="mai-hello"><div class="mai-h">Hi there 👋<br><span>How can I help you today?</span></div><p>I know every MARS course, fee, batch and EMI plan, and I can fetch your certificate. Pick a topic or ask in your own words, in English, Hindi or Bengali.</p>
    <div class="mai-tiles">
      <button type="button" class="mai-tile" data-ask="Which course is best for me?"><span class="mai-ic v"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></span><span>Find my course<small>Based on your goal</small></span></button>
      <button type="button" class="mai-tile" data-ask="What are your course fees and current offers?"><span class="mai-ic g"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12M6 9h12M14 4c3 0 3 5 0 5H6l9 11"/></svg></span><span>Fees &amp; offers<small>Prices and discounts</small></span></button>
      <button type="button" class="mai-tile" data-ask="When do the next batches start? Do you have weekend batches?"><span class="mai-ic e"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span><span>Batches &amp; timings<small>Weekday or weekend</small></span></button>
      <button type="button" class="mai-tile" data-ask="Can I pay the fees in EMI?"><span class="mai-ic b"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/></svg></span><span>Pay in EMI<small>2 or 3 parts</small></span></button>
    </div></div>`;
  }
  function restore() { if (!S.view.length) return welcome(); log.innerHTML = ''; S.view.forEach(([w, h]) => bubble(w, h, false)); }
  const SUG = ['Best course for MIS job', 'Download my certificate', 'Fees for Power BI', 'Weekend batches?', 'EMI for Data Analytics', 'MS Office kitna hai?', 'Office timings', 'Call me back'];
  $('.mai-sugg').innerHTML = SUG.map(s => `<button type="button" data-ask="${esc(s)}">${esc(s)}</button>`).join('');

  const CALL = /\b(call me|callback|call back|ring me|contact me|phone me|talk to (a |your )?(person|human|counsel+or|someone)|baat kar|call kar|phone kar)\b/i;
  const lastCourse = () => { for (let i = S.view.length - 1; i >= 0; i--) { const m = /data-ask="What will I learn in ([^"?]+)\?"|course=([^"#&]+)/.exec(S.view[i][1]); if (m) return decodeURIComponent(m[1] || m[2]).replace(/&amp;/g, '&'); } return ''; };
  function startLead() { S.lead = { step: 'name', course: lastCourse() }; save(); bubble('bot', `<p>Sure! A counsellor will call you. What's your <b>name</b>?</p>`); }
  async function leadStep(text) {
    const L = S.lead;
    if (/^(cancel|no|stop|nahi|nahin)$/i.test(text.trim())) { S.lead = null; save(); return bubble('bot', '<p>No problem. Ask me anything else.</p>'); }
    if (L.step === 'name') {
      if (text.trim().length < 2 || /\d{5}/.test(text)) return bubble('bot', '<p>Please type your name.</p>');
      L.name = text.trim().slice(0, 60); L.step = 'phone'; save(); return bubble('bot', `<p>Thanks, ${esc(L.name)}! Your <b>10-digit mobile number</b>?</p>`);
    }
    const d = text.replace(/\D/g, '').slice(-10);
    if (d.length < 10) return bubble('bot', `<p>That doesn't look like a 10-digit mobile number. Please type it again.</p>`);
    typing(true); send.disabled = true;
    const asked = S.msgs.filter(m => m.role === 'user').map(m => m.content).slice(-6).join(' → ');
    try {
      const r = await fetch(LEADS, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'chatLead', name: L.name, phone: d, course: L.course, message: asked, page: location.href }) }).then(x => x.json());
      typing(false); send.disabled = false;
      if (!r.ok) return bubble('bot', `<p>${esc(r.error || 'Something went wrong.')}</p>`);
      S.lead = null; save();
      bubble('bot', `<p>Done ✓ Our team will call <b>${esc(L.name)}</b> on <b>${esc(d.replace(/(\d{5})(\d{5})/, '$1 $2'))}</b>${L.course ? ' about <b>' + esc(L.course) + '</b>' : ''} soon, during office hours.</p>`);
    } catch (e) { typing(false); send.disabled = false; bubble('bot', `<p>I couldn't send that. Please check your internet, or WhatsApp us.</p>${actions(null)}`); }
  }
  async function ask(q) {
    q = String(q || '').trim(); if (!q || send.disabled) return;
    bubble('me', `<p>${esc(q)}</p>`);
    if (S.lead) return leadStep(q);
    if (certFlow(q)) return;
    if (CALL.test(q)) { S.msgs.push({ role: 'user', content: q }); save(); return startLead(); }
    S.msgs.push({ role: 'user', content: q }); save();
    typing(true); send.disabled = true;
    const [r] = await Promise.all([fetch(API + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: S.msgs.slice(-8) }) }).then(x => x.json()).catch(() => null), loadData(), new Promise(ok => setTimeout(ok, 450))]);
    typing(false); send.disabled = false;
    if (r && r.ok && r.reply) {
      S.msgs.push({ role: 'assistant', content: r.reply }); save();
      const cs = (r.courses || []).map(byT).filter(Boolean);
      bubble('bot', md(r.reply) + cs.map(card).join('') + (r.cert ? certLinks('', true) : actions(cs[0] || null)));
      if (r.cert) { S.cert = Object.assign({}, S.cert, { want: 1 }); save(); }   // the AI asked for their Enrollment ID + mobile: the next message is fetched here
      if (r.callback) startLead();   // the visitor asked to be called (checked on the server too)
    } else {
      const b = builtIn(q);
      S.msgs.push({ role: 'assistant', content: b.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }); save();
      if (b.cert) { S.cert = Object.assign({}, S.cert, { want: 1 }); save(); }
      bubble('bot', b.html + (b.course ? card(b.course) : '') + (b.cert ? certLinks('', true) : actions(b.course)) + (r && r.error && /Too many/.test(r.error) ? `<p class="mai-note">${esc(r.error)}</p>` : ''));
    }
    input.focus({ preventScroll: true });
  }

  /* ---------- open / close ---------- */
  const setOpen = o => {
    chat.hidden = !o; launch.setAttribute('aria-expanded', String(o)); teaser.hidden = true;
    if (o) { store('mai_seen', 1); loadData(); if (!log.childElementCount) restore(); if (!matchMedia('(max-width:600px)').matches) setTimeout(() => input.focus({ preventScroll: true }), 80); }
  };
  launch.addEventListener('click', () => setOpen(chat.hidden));
  $('.mai-close').addEventListener('click', () => setOpen(false));
  $('.mai-reset').addEventListener('click', welcome);
  teaser.addEventListener('click', e => { if (e.target.closest('.mai-tx')) { teaser.hidden = true; store('mai_seen', 1); return; } setOpen(true); });
  teaser.addEventListener('keydown', e => { if (e.key === 'Enter') setOpen(true); });
  root.addEventListener('click', e => { const h = e.target.closest('[data-hc]'); if (h && !send.disabled) { e.preventDefault(); return hardCopy(h); } const b = e.target.closest('[data-ask]'); if (b) { e.preventDefault(); ask(b.dataset.ask); } });
  $('form').addEventListener('submit', e => { e.preventDefault(); const q = input.value; input.value = ''; ask(q); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) setOpen(false); });
  if (!store('mai_seen')) setTimeout(() => { if (chat.hidden && !store('mai_seen')) teaser.hidden = false; }, 7000);
})();

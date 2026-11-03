/* Offer window: when an offer is running (Offers tab) and/or batches start soon (Batches tab), a window shows
 * the offer with a live countdown and the upcoming batches with seats left. Data: /api/catalog (same as the chat).
 * Shown once a day per visitor, a few seconds after the page opens (or once they scroll), never over an open chat. */
(function () {
  if (window.__marsOffer) return; window.__marsOffer = true;
  const FORCE = !!window.MARS_OFFER_FORCE, SOON_DAYS = 21;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = iso => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(iso || ''); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null; };
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const nice = s => String(s || '').toLowerCase().replace(/\b(sat|sun|mon|tue|wed|thu|fri)\b/g, w => w[0].toUpperCase() + w.slice(1)).replace(/(\d)\s*(am|pm)\b/g, (m, d, x) => d + ' ' + x.toUpperCase()).replace(/\s*,\s*/g, ', ').replace(/(\d)\s*to\s*(\d)/g, '$1 – $2');
  const titleCase = s => String(s || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const css = `
#ofp{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;font:15px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#0B1630}
#ofp[hidden]{display:none}
#ofp .of-bg{position:absolute;inset:0;background:rgba(6,14,32,.58);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:ofp-fade .3s ease both}
#ofp .of-win{position:relative;width:min(460px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 40px 90px -20px rgba(0,0,0,.55);animation:ofp-pop .45s cubic-bezier(.2,1,.3,1) both}
#ofp .of-head{position:relative;padding:22px 22px 20px;color:#fff;background:radial-gradient(120% 140% at 100% 0%,#7B61FF 0%,rgba(123,97,255,0) 55%),linear-gradient(140deg,#06122A 0%,#123170 60%,#2A6EB5 100%);overflow:hidden}
#ofp .of-head::after{content:"";position:absolute;right:-40px;bottom:-60px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,194,60,.35),rgba(255,194,60,0) 70%)}
#ofp .of-x{position:absolute;top:12px;right:12px;z-index:2;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:20px;line-height:1;cursor:pointer;display:grid;place-items:center}
#ofp .of-x:hover{background:rgba(255,255,255,.26)}
#ofp .of-tag{display:inline-flex;align-items:center;gap:6px;background:#FFC23C;color:#0B1630;font:800 11px/1 Inter,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:6px 10px;border-radius:99px}
#ofp .of-tag i{width:6px;height:6px;border-radius:50%;background:#DC2626;animation:ofp-blink 1.2s infinite}
#ofp h2{margin:12px 0 4px;font:800 28px/1.12 "Plus Jakarta Sans",Inter,sans-serif;letter-spacing:-.02em;color:#fff;position:relative;z-index:1}
#ofp h2 em{font-style:normal;background:linear-gradient(90deg,#FFC23C,#FFE08A);-webkit-background-clip:text;background-clip:text;color:transparent}
#ofp .of-sub{margin:0;color:#C9D6EE;font-size:14px;position:relative;z-index:1}
#ofp .of-cd{display:flex;gap:8px;margin-top:14px;position:relative;z-index:1}
#ofp .of-cd div{flex:1;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:8px 4px 6px;text-align:center}
#ofp .of-cd b{display:block;font:800 22px/1 "Plus Jakarta Sans",Inter,sans-serif;font-variant-numeric:tabular-nums;color:#fff}
#ofp .of-cd small{display:block;margin-top:4px;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#AFC0DE}
#ofp .of-body{padding:16px 18px 6px;overflow:auto}
#ofp .of-lab{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px;font:700 12px/1 Inter,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#5E6E86}
#ofp .of-lab span{color:#16A34A;letter-spacing:.02em;text-transform:none;font-weight:700}
#ofp .of-list{position:relative}
#ofp .of-list.scroll{overflow-y:auto;overscroll-behavior:contain;margin:0 -6px;padding:0 6px;-webkit-mask-image:linear-gradient(#000 calc(100% - 34px),transparent);mask-image:linear-gradient(#000 calc(100% - 34px),transparent);scrollbar-width:thin}
#ofp .of-list.scroll.end{-webkit-mask-image:none;mask-image:none}
#ofp .of-more{text-align:center;font:600 12px/1 Inter,sans-serif;color:#2A6EB5;padding:2px 0 8px;transition:opacity .25s}
#ofp .of-more.gone{opacity:0}
#ofp .of-bt{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px;border:1px solid #E1E8F2;border-radius:16px;margin-bottom:10px;background:#fff;animation:ofp-up .45s cubic-bezier(.2,1,.3,1) both;animation-delay:calc(.15s + var(--i) * .08s)}
#ofp .of-date{width:54px;border-radius:12px;overflow:hidden;text-align:center;background:#F4F7FC;border:1px solid #E1E8F2}
#ofp .of-date small{display:block;background:#2A6EB5;color:#fff;font:800 10px/1 Inter,sans-serif;letter-spacing:.08em;padding:5px 0}
#ofp .of-date b{display:block;font:800 21px/1 "Plus Jakarta Sans",Inter,sans-serif;padding:6px 0 2px}
#ofp .of-date span{display:block;font-size:10.5px;color:#5E6E86;font-weight:600;padding-bottom:5px}
#ofp .of-info{min-width:0}
#ofp .of-info b{display:block;font:700 15px/1.25 "Plus Jakarta Sans",Inter,sans-serif}
#ofp .of-info .of-time{display:block;font-size:12.5px;color:#5E6E86;margin-top:2px}
#ofp .of-seats{display:inline-flex;align-items:center;gap:5px;margin-top:6px;font-size:11.5px;font-weight:700;color:#B45309;background:#FEF3C7;border-radius:99px;padding:3px 8px}
#ofp .of-seats.of-hot{color:#B91C1C;background:#FEE2E2}
#ofp .of-price{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
#ofp .of-price b{font:800 16px/1 "Plus Jakarta Sans",Inter,sans-serif}
#ofp .of-price s{display:block;font-size:11.5px;color:#8A97AB;margin-top:2px}
#ofp .of-price a{font:700 12.5px/1 Inter,sans-serif;text-decoration:none;color:#fff;background:#2A6EB5;border-radius:10px;padding:8px 12px;white-space:nowrap}
#ofp .of-price a:hover{background:#1F5A97}
#ofp .of-foot{padding:6px 18px 18px;display:grid;gap:10px}
#ofp .of-cta{display:flex;gap:10px}
#ofp .of-cta a{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:14px;padding:13px 14px;font:700 15px/1 Inter,sans-serif;text-decoration:none}
#ofp .of-cta .of-pri{background:linear-gradient(100deg,#2A6EB5,#7B61FF);color:#fff;box-shadow:0 12px 26px -10px rgba(91,91,239,.7)}
#ofp .of-cta .of-wa{flex:0 0 auto;background:#E8F9EE;color:#0E7A3B;border:1px solid #BDEBCD}
#ofp .of-cta svg{width:17px;height:17px}
#ofp .of-later{background:none;border:0;color:#5E6E86;font:600 13px Inter,sans-serif;cursor:pointer;padding:2px;justify-self:center}
#ofp .of-later:hover{color:#0B1630;text-decoration:underline}
#ofp :focus-visible{outline:3px solid #FFC23C;outline-offset:2px}
#ofp .of-win:focus,#ofp .of-win:focus-visible{outline:none}
@keyframes ofp-fade{from{opacity:0}}
@keyframes ofp-pop{from{opacity:0;transform:translateY(16px) scale(.97)}}
@keyframes ofp-up{from{opacity:0;transform:translateY(8px)}}
@keyframes ofp-blink{50%{opacity:.25}}
@media(max-width:560px){
  #ofp{place-items:end center;padding:0}
  #ofp .of-win{width:100%;max-height:92vh;border-radius:24px 24px 0 0;animation-name:ofp-sheet}
  #ofp h2{font-size:24px}#ofp .of-cd b{font-size:19px}
  #ofp .of-bt{grid-template-columns:auto 1fr;gap:10px}
  #ofp .of-price{grid-column:1/-1;flex-direction:row;align-items:center;justify-content:space-between;border-top:1px dashed #E1E8F2;padding-top:10px;text-align:left}
  #ofp .of-price>div{display:flex;align-items:baseline;gap:8px}#ofp .of-price s{margin:0}
  #ofp .of-foot{padding-bottom:calc(16px + env(safe-area-inset-bottom,0px))}
}
@keyframes ofp-sheet{from{transform:translateY(100%)}}
@media(prefers-reduced-motion:reduce){#ofp *{animation:none!important}}`;

  function build(D) {
    const today = D.at, o = D.offer, soonEnd = new Date(day(today).getTime() + SOON_DAYS * 864e5).toISOString().slice(0, 10);
    const batches = (D.batches || []).filter(b => b.start >= today).slice(0, 12);   // all upcoming; more than 2 scroll inside the window
    if (!o && !batches.some(b => b.start <= soonEnd)) return null;   // without an offer, only when a batch starts soon
    const app = (D.app || 'https://app.marstraining.in').replace(/\/$/, ''), enroll = t => app + '/?course=' + encodeURIComponent(t) + '#enroll';
    const course = t => D.courses.find(c => c.t === t) || D.courses.find(c => c.t.toLowerCase() === String(t).toLowerCase());
    const end = o && o.end ? new Date(o.end + 'T23:59:59+05:30') : null;
    const head = o
      ? `<span class="of-tag"><i></i>${esc(titleCase(o.name || 'Special'))} offer · limited period</span><h2>Hurry! <em>${esc(o.discount || '')} off</em> every course</h2><p class="of-sub">${end ? `Offer ends ${end.getDate()} ${MON[end.getMonth()]}. Enroll before it's gone.` : esc(o.text || '')}</p>${end ? '<div class="of-cd" aria-live="off"><div><b data-u="d">0</b><small>Days</small></div><div><b data-u="h">00</b><small>Hours</small></div><div><b data-u="m">00</b><small>Mins</small></div><div><b data-u="s">00</b><small>Secs</small></div></div>' : ''}`
      : `<span class="of-tag"><i></i>Enrollment open</span><h2>New batches <em>starting soon</em></h2><p class="of-sub">Seats are limited in every batch. Book yours today.</p>`;
    const rows = batches.map((b, i) => {
      const d = day(b.start), c = course(b.course), left = Number(b.left), hot = left > 0 && left <= 5;
      const price = c ? (c.price < c.fee ? `<div><b>${inr(c.price)}</b><s>${inr(c.fee)}</s></div>` : `<div><b>${inr(c.fee)}</b></div>`) : '<div></div>';
      return `<div class="of-bt" style="--i:${i}"><div class="of-date"><small>${MON[d.getUTCMonth()].toUpperCase()}</small><b>${String(d.getUTCDate()).padStart(2, '0')}</b><span>${DAY[d.getUTCDay()]}</span></div>
        <div class="of-info"><b>${esc(c ? c.t : b.course)}</b><span class="of-time">${esc(nice(b.timing))}${b.mode ? ' · ' + esc(titleCase(b.mode)) : ''}</span>${left > 0 ? `<span class="of-seats${hot ? ' of-hot' : ''}">${hot ? '🔥 Only ' : ''}${left} seat${left === 1 ? '' : 's'} left</span>` : ''}</div>
        <div class="of-price">${price}<a href="${esc(enroll(c ? c.t : b.course))}" target="_blank" rel="noopener">Enroll</a></div></div>`;
    }).join('');
    const wa = 'https://wa.me/' + (D.whatsapp || '919870259245') + '?text=' + encodeURIComponent(o ? `Hi MARS, I'd like to know more about the ${titleCase(o.name)} offer` : 'Hi MARS, I want to join an upcoming batch');
    return `<div class="of-bg" data-x></div><div class="of-win" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="ofp-t">
      <div class="of-head"><button type="button" class="of-x" data-x aria-label="Close">×</button>${head.replace('<h2>', '<h2 id="ofp-t">')}</div>
      ${rows ? `<div class="of-body"><div class="of-lab">Upcoming batches${batches.length > 2 ? ' (' + batches.length + ')' : ''}<span>● Enrollment open</span></div><div class="of-list">${rows}</div>${batches.length > 2 ? `<div class="of-more">↓ Scroll to see ${batches.length - 2} more batch${batches.length - 2 > 1 ? 'es' : ''}</div>` : ''}</div>` : ''}
      <div class="of-foot"><div class="of-cta"><a class="of-pri" href="${esc(app + '/#enroll')}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/></svg>${o ? 'Enroll now & save ' + esc(o.discount || '') : 'Enroll now'}</a>
      <a class="of-wa" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Ask on WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>Ask</a></div>
      <button type="button" class="of-later" data-x>Maybe later</button></div></div>`;
  }

  function open(D) {
    const html = build(D); if (!html) return;
    const key = 'mars_ofp1', stamp = (D.offer ? D.offer.name + D.offer.end : 'batches') + '|' + D.at;
    if (!FORCE && store(key) === stamp) return;   // already shown today
    const chat = document.querySelector('#mai .mai-chat');
    if (!FORCE && chat && !chat.hidden) return;   // never on top of an open chat
    store(key, stamp);
    let root = document.getElementById('ofp');
    if (!root) { root = document.createElement('div'); root.id = 'ofp'; document.body.appendChild(root); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    root.hidden = false; root.innerHTML = html;
    const last = document.activeElement, prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const end = D.offer && D.offer.end ? new Date(D.offer.end + 'T23:59:59+05:30').getTime() : 0, U = {};
    root.querySelectorAll('[data-u]').forEach(b => U[b.dataset.u] = b);
    const tick = () => { const t = Math.max(0, end - Date.now()) / 1000, p = n => String(Math.floor(n)).padStart(2, '0');
      if (U.d) { U.d.textContent = Math.floor(t / 86400); U.h.textContent = p(t % 86400 / 3600); U.m.textContent = p(t % 3600 / 60); U.s.textContent = p(t % 60); } };
    tick(); const timer = end ? setInterval(tick, 1000) : 0;
    // more than 2 batches: the list shows 2 (and a peek of the 3rd) and scrolls
    const list = root.querySelector('.of-list'), cards = list ? list.querySelectorAll('.of-bt') : [], more = root.querySelector('.of-more');
    if (cards.length > 2) {
      list.classList.add('scroll'); list.style.maxHeight = (cards[2].offsetTop - cards[0].offsetTop + 30) + 'px';
      const atEnd = () => { const e = list.scrollTop + list.clientHeight >= list.scrollHeight - 4; list.classList.toggle('end', e); if (more) more.classList.toggle('gone', e); };
      list.addEventListener('scroll', atEnd, { passive: true }); atEnd();
    }
    const close = () => { clearInterval(timer); root.hidden = true; root.innerHTML = ''; document.body.style.overflow = prevOverflow; document.removeEventListener('keydown', key2); if (last && last.focus) last.focus({ preventScroll: true }); };
    const key2 = e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = [...root.querySelectorAll('a,button')]; if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    root.onclick = e => { if (e.target.closest('[data-x]')) close(); };
    document.addEventListener('keydown', key2);
    setTimeout(() => { const x = root.querySelector('.of-win'); if (x) x.focus({ preventScroll: true }); }, 50);
    window.MARS_OFFER_OPEN = () => open(D);
  }

  const API = (window.MARS_AI_API || '').replace(/\/$/, '');
  function start() {
    fetch(API + '/api/catalog').then(r => r.ok ? r.json() : null).then(D => {
      if (!D || !D.courses) return;
      window.MARS_OFFER_OPEN = () => open(D);
      if (FORCE) return setTimeout(() => open(D), 900);
      let done = false; const go = () => { if (done) return; done = true; removeEventListener('scroll', onScroll); if (!document.hidden) open(D); };
      const onScroll = () => { if (scrollY > innerHeight * .6) go(); };
      addEventListener('scroll', onScroll, { passive: true }); setTimeout(go, 6000);
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

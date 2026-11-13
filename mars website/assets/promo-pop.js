/* Batch poster popup (e.g. the new Gen AI batch). Switched on/off from the sheet, Settings tab:
 *   popup_show (Yes/No) · popup_until (last day it shows) · popup_image (blank = assets/promo/genai-batch.jpg, or a Drive link)
 *   popup_button (button text) · popup_message (WhatsApp message) · popup_link (blank = WhatsApp)
 * Never together with the offer window: if the offer window opens on this page, the poster waits until 45 s after it is closed;
 * otherwise (offer already seen today, or no offer window on this page) it shows 6 s after the page opens or once they scroll.
 * At most once a day per visitor, never over an open chat. Data: /api/catalog (sheet changes reach the site within about a minute). */
(function () {
  if (window.__marsPromo) return; window.__marsPromo = true;
  const FORCE = !!window.MARS_PROMO_FORCE, KEY = 'mars_promo1';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const today = () => new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const offerSeenAtStart = (store('mars_ofp2') || '').endsWith('|' + today());
  const DEF = { img: 'assets/promo/genai-batch.jpg', btn: 'Book your seat on WhatsApp', msg: 'Hi MARS, I would like to book a seat in the new Gen AI batch starting 6 December (2 pm to 4 pm).', alt: 'New Gen AI batch starts 6 December, 2 pm to 4 pm' };
  const imgOf = s => { s = String(s || '').trim(); const m = s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200` : (/^https:\/\//.test(s) ? s : DEF.img); };

  const css = `
#ppw{position:fixed;inset:0;z-index:61;display:grid;place-items:center;padding:16px;font:15px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
#ppw[hidden]{display:none}
#ppw .pp-bg{position:absolute;inset:0;background:rgba(6,14,32,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:pp-fade .3s ease both}
#ppw .pp-win{position:relative;width:min(430px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 40px 90px -20px rgba(0,0,0,.6);animation:pp-pop .45s cubic-bezier(.2,1,.3,1) both;outline:none}
#ppw .pp-img{display:block;width:100%;min-height:0;flex:1 1 auto;object-fit:contain;background:#eef3fb;cursor:pointer}
#ppw .pp-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:0;background:rgba(6,14,32,.72);color:#fff;font:700 20px/36px Inter,Arial;cursor:pointer;display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.3)}
#ppw .pp-x:hover{background:#06122A}
#ppw .pp-acts{display:flex;gap:8px;padding:12px;background:#fff;flex:none}
#ppw .pp-acts a{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;min-height:46px;padding:0 12px;border-radius:13px;font-weight:700;font-size:14.5px;text-decoration:none;text-align:center;line-height:1.2}
#ppw .pp-go{background:#1FAF55;color:#fff;box-shadow:0 8px 18px -8px rgba(31,175,85,.8)}
#ppw .pp-go:hover{background:#178f45}
#ppw .pp-call{flex:0 0 auto!important;border:1.5px solid #CFDAEC;color:#123170}
#ppw .pp-call:hover{background:#F2F6FC}
#ppw svg{width:18px;height:18px;flex:none}
@keyframes pp-fade{from{opacity:0}}@keyframes pp-pop{from{opacity:0;transform:translateY(24px) scale(.96)}}
@media(max-width:420px){#ppw{padding:12px}#ppw .pp-acts a{font-size:13.5px}#ppw .pp-call span{display:none}}
@media(prefers-reduced-motion:reduce){#ppw .pp-bg,#ppw .pp-win{animation:none}}`;
  const WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-2.6-.9-4.7-3.3-5.1-3.9-.4-.6-1-1.7-1-2.9s.7-1.9 1-2.1c.2-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.7-.1l.9-1.1c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.3.1.2.1.8-.2 1.4z"/></svg>';
  const PH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';

  function open(P, phone) {
    const chat = document.querySelector('#mai .mai-chat'), ofp = document.getElementById('ofp');
    if (!FORCE && ((chat && !chat.hidden) || (ofp && !ofp.hidden) || store(KEY) === today())) return;
    if (!FORCE) store(KEY, today());
    const wa = String(P.wa || '919870259245').replace(/\D/g, '');
    const link = /^https:\/\//.test(P.link || '') ? P.link : `https://wa.me/${wa}?text=${encodeURIComponent(P.msg || DEF.msg)}`;
    const tel = '+91' + String(phone || '9870259245').replace(/\D/g, '').slice(-10);
    let root = document.getElementById('ppw');
    if (!root) { root = document.createElement('div'); root.id = 'ppw'; document.body.appendChild(root); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    root.hidden = false;
    root.innerHTML = `<div class="pp-bg" data-x></div><div class="pp-win" role="dialog" aria-modal="true" aria-label="${esc(P.alt || DEF.alt)}" tabindex="-1">
      <a href="${esc(link)}" target="_blank" rel="noopener" style="display:contents"><img class="pp-img" src="${esc(imgOf(P.img))}" alt="${esc(P.alt || DEF.alt)}" onerror="this.onerror=null;this.src='${DEF.img}'"></a>
      <button type="button" class="pp-x" data-x aria-label="Close">×</button>
      <div class="pp-acts"><a class="pp-go" href="${esc(link)}" target="_blank" rel="noopener">${WA}${esc(P.btn || DEF.btn)}</a><a class="pp-call" href="tel:${tel}" aria-label="Call us">${PH}<span>Call</span></a></div></div>`;
    const last = document.activeElement, prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const close = () => { root.hidden = true; root.innerHTML = ''; document.body.style.overflow = prev; document.removeEventListener('keydown', key); if (last && last.focus) last.focus({ preventScroll: true }); };
    const key = e => { if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const f = [...root.querySelectorAll('a.pp-go,a.pp-call,button')], a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } };
    root.onclick = e => { if (e.target.closest('[data-x]')) close(); else if (e.target.closest('.pp-go,.pp-img')) setTimeout(close, 300); };
    document.addEventListener('keydown', key);
    setTimeout(() => { const w = root.querySelector('.pp-win'); if (w) w.focus({ preventScroll: true }); }, 50);
  }

  const API = (window.MARS_AI_API || '').replace(/\/$/, '');
  function start() {
    if (FORCE) return setTimeout(() => open(window.MARS_PROMO_FORCE === true ? {} : window.MARS_PROMO_FORCE, ''), 1500);
    fetch(API + '/api/catalog').then(r => r.ok ? r.json() : null).then(D => {
      const P = D && D.popup; if (!P || !P.on) return;
      if (P.until && today() > P.until) return;          // switches itself off after the last day
      if (store(KEY) === today()) return;                 // already shown today
      P.wa = D.whatsapp; const ph = (D.phones || [])[0];
      const show = () => { if (!document.hidden) open(P, ph); else addEventListener('visibilitychange', function v() { if (!document.hidden) { removeEventListener('visibilitychange', v); open(P, ph); } }); };
      const offerHere = !!window.__marsOffer && !offerSeenAtStart;
      if (!offerHere) {                                   // like the offer window: 6 s after the page opens, or once they scroll
        let done = false; const go = () => { if (done) return; done = true; removeEventListener('scroll', sc); show(); };
        const sc = () => { if (scrollY > innerHeight * .6) go(); };
        addEventListener('scroll', sc, { passive: true }); return setTimeout(go, 6000);
      }
      // the offer window may open on this page: wait for it to open and close, then 45 s
      let opened = false, t0 = Date.now();
      const watch = setInterval(() => {
        const o = document.getElementById('ofp'), isOpen = o && !o.hidden;
        if (isOpen) opened = true;
        else if (opened) { clearInterval(watch); setTimeout(show, 45000); }
        else if (Date.now() - t0 > 20000) { clearInterval(watch); if (!(store('mars_ofp2') || '').endsWith('|' + today())) show(); }   // offer window had nothing to show
      }, 500);
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

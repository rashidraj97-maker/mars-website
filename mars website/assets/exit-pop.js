/* Courses page "before you go" popup.
 * Shows when the visitor clicks a link to another page of the website (Home, Gallery, Contact…): they can still continue there.
 * Computer: shows when the mouse moves up out of the page (towards the tabs / close button).
 * Phone: shows when the visitor comes back to the page after switching to another app or tab.
 * At most once per visit, only after the visitor has spent 10 s on the page, never over another popup or the chat. */
(function () {
  if (window.__marsExit) return; window.__marsExit = true;
  const PREVIEW = /[?&]preview=exit\b/.test(location.search), LIVE = true;
  if (!LIVE && !PREVIEW) return;
  const KEY = 'mars_exit1', MIN_MS = PREVIEW ? 1500 : 5000, t0 = Date.now();
  const ss = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } };
  if (!PREVIEW && ss(KEY)) return;
  const WA = 'https://wa.me/919870259245?text=' + encodeURIComponent('Hi MARS, I was looking at your courses. Can you help me choose the right one?');

  const css = `
#exw{position:fixed;inset:0;z-index:62;display:grid;place-items:center;padding:16px;font:15px/1.45 Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
#exw[hidden]{display:none}
#exw .ex-bg{position:absolute;inset:0;background:rgba(6,14,32,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:ex-fade .3s ease both}
#exw .ex-win{position:relative;width:min(440px,100%);background:linear-gradient(160deg,#0B1630 0%,#1B3F8B 100%);color:#fff;border-radius:24px;padding:34px 28px 24px;text-align:center;box-shadow:0 40px 90px -20px rgba(0,0,0,.6);animation:ex-pop .42s cubic-bezier(.2,1.2,.3,1) both;overflow:hidden}
#exw .ex-win:before{content:"";position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(255,194,60,.28),transparent 70%);top:-110px;right:-90px;pointer-events:none}
#exw .ex-x{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font:700 19px/34px Inter,Arial;cursor:pointer}
#exw .ex-x:hover{background:rgba(255,255,255,.24)}
#exw .ex-ic{width:64px;height:64px;margin:0 auto 14px;border-radius:50%;display:grid;place-items:center;background:#FFC23C;color:#0B1630;box-shadow:0 0 0 10px rgba(255,194,60,.18)}
#exw .ex-ic svg{width:32px;height:32px}
#exw .ex-k{text-indent:.14em;font-size:.74rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#FFC23C;margin:0 0 6px}
#exw h2{color:#fff;font-size:1.75rem;line-height:1.15;font-weight:900;letter-spacing:-.02em;margin:0 0 10px}
#exw h2 em{font-style:normal;color:#FFC23C}
#exw p{margin:0 auto 20px;max-width:330px;color:rgba(255,255,255,.82)}
#exw .ex-b{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px 18px;border-radius:14px;font-weight:800;font-size:1rem;text-decoration:none;border:0;cursor:pointer}
#exw .ex-wa{background:#25D366;color:#06122A}
#exw .ex-wa:hover{filter:brightness(1.06)}
#exw .ex-wa svg{width:20px;height:20px}
#exw .ex-stay{background:none;color:rgba(255,255,255,.75);font-weight:600;font-size:.9rem;margin-top:6px;padding:10px}
#exw .ex-stay:hover{color:#fff}
#exw .ex-go{gap:5px;background:rgba(255,255,255,.1);color:#fff;font-size:.92rem;margin-top:10px;padding:12px}
#exw .ex-go:hover{background:rgba(255,255,255,.18)}
#exw .ex-go[hidden]{display:none}
@keyframes ex-fade{from{opacity:0}}
@keyframes ex-pop{from{opacity:0;transform:translateY(18px) scale(.94)}}
@media (max-width:420px){#exw h2{font-size:1.5rem}#exw .ex-win{padding:30px 20px 20px}}`;

  const html = `<div class="ex-bg" data-exclose></div>
<div class="ex-win" role="dialog" aria-modal="true" aria-labelledby="ex-t">
  <button class="ex-x" type="button" aria-label="Close" data-exclose>×</button>
  <div class="ex-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6M12 2v3"/></svg></div>
  <p class="ex-k">Wait, before you go</p>
  <h2 id="ex-t">Learn before it's too late.<br><em>Plans never end.</em></h2>
  <p>"Someday" never comes. The skill you start today is the career you'll have tomorrow. Let us help you pick the right course.</p>
  <a class="ex-b ex-wa" href="${WA}" target="_blank" rel="noopener" data-exclose><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>Help me choose a course</a>
  <a class="ex-b ex-go" href="#" hidden>Continue to<span></span>→</a>
  <button class="ex-b ex-stay" type="button" data-exclose>Stay and explore courses</button>
</div>`;

  let box = null, shown = false;
  const busy = () => {
    const vis = id => { const e = document.getElementById(id); return e && !e.hidden && getComputedStyle(e).display !== 'none'; };
    const shown = sel => [...document.querySelectorAll(sel)].some(e => e.getClientRects().length > 0);
    return vis('ppw') || vis('ofp') || shown('#mai .mai-chat, dialog[open], #cd:not([hidden])');
  };
  function show(to) {
    if (shown || Date.now() - t0 < MIN_MS || busy()) return false;
    shown = true; ss(KEY, '1');
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'exw'; box.innerHTML = html; document.body.appendChild(box);
    box.addEventListener('click', e => { if (e.target.closest('[data-exclose]')) close(); });
    addEventListener('keydown', esc);
    if (to) { const g = box.querySelector('.ex-go'); g.href = to.href; g.querySelector('span').textContent = to.name; g.hidden = false; }
    const b = box.querySelector('.ex-wa'); if (b) b.focus({ preventScroll: true });
    return true;
  }
  function close() { if (box) { box.remove(); box = null; } removeEventListener('keydown', esc); }
  function esc(e) { if (e.key === 'Escape') close(); }

  // a click on a link to another page of this website (not course details, enrol / WhatsApp / outside links, or new-tab clicks)
  const NAMES = { '': 'Home', 'index': 'Home', 'gallery': 'Gallery', 'reviews': 'Reviews', 'jobs': 'Jobs', 'join': 'Become a Trainer', 'corporate-enquiry': 'Corporate Training', 'certificate': 'Certificate' };
  document.addEventListener('click', e => {
    if (shown || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (u.origin !== location.origin || /\/courses?(\.html)?$|\/course\//.test(u.pathname) || (u.pathname === location.pathname && u.hash)) return;
    const key = u.pathname.replace(/^\/|\.html$/g, ''), label = (a.textContent || '').trim().replace(/\s+/g, ' ');
    const name = (label && label.length < 30 ? label : '') || NAMES[key] || 'that page';
    if (show({ href: u.href, name })) e.preventDefault();
  }, true);
  // computer: the mouse leaves through the top edge of the page
  document.addEventListener('mouseout', e => { if (!e.relatedTarget && e.clientY <= 8) show(); });
  // phone (and computer): the visitor switched away and came back
  let away = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) away = Date.now();
    else if (away && Date.now() - away > 3000 && matchMedia('(hover:none)').matches) show();
  });
})();

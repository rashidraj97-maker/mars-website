/* Welcome banner shown the moment the website opens: "31 Years of Corporate Exposure".
 * Once per visit (browser tab session), about 3 seconds, closes on tap / click / any key. */
(function () {
  const PREVIEW = /[?&]preview=intro\b/.test(location.search), LIVE = true;
  if (!LIVE && !PREVIEW) return;
  const KEY = 'mars_intro1';
  // show every time someone arrives at the website (typed address, Google, ads, WhatsApp link, reopened tab),
  // but not when they move from one page of the website to another
  let fromSite = false;
  try { fromSite = !!document.referrer && /(^|\.)marstraining\.in$|^localhost$/.test(new URL(document.referrer).hostname); } catch (e) {}
  if (!PREVIEW && fromSite) return;
  const YEARS = 31, STAY = 3200;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = `
#mintro{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:24px;text-align:center;color:#fff;cursor:pointer;
  background:radial-gradient(ellipse at 50% 35%,#1E4C9A 0%,#0F2A5C 45%,#07142E 100%);font-family:Inter,system-ui,sans-serif;
  transition:opacity .6s ease,transform .6s ease}
#mintro.out{opacity:0;transform:scale(1.04);pointer-events:none}
#mintro:before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 1px,transparent 1px);background-size:22px 22px;pointer-events:none}
#mintro .mi-in{position:relative;max-width:640px}
#mintro .mi-logo{display:inline-block;background:#fff;border-radius:20px;padding:14px 26px;box-shadow:0 14px 40px -12px rgba(0,0,0,.5);animation:mi-up .6s .05s both}
#mintro .mi-logo img{display:block;height:clamp(58px,11vw,78px);width:auto;max-width:72vw}
#mintro .mi-num{font:800 clamp(6rem,24vw,11rem)/.9 "Plus Jakarta Sans",Inter,sans-serif;letter-spacing:-.05em;margin:26px 0 4px;color:#FFC23C;
  text-shadow:0 10px 40px rgba(255,194,60,.35);animation:mi-up .7s .15s both}
#mintro .mi-num sup{font-size:.32em;vertical-align:.95em;margin-left:4px;letter-spacing:0}
#mintro .mi-t{font:800 clamp(1.5rem,5vw,2.4rem)/1.15 "Plus Jakarta Sans",Inter,sans-serif;letter-spacing:-.02em;margin:0;animation:mi-up .7s .35s both}
#mintro .mi-line{width:80px;height:4px;border-radius:4px;background:#FFC23C;margin:18px auto;transform-origin:center;animation:mi-grow .7s .55s both}
#mintro .mi-s{margin:0;font-size:clamp(.92rem,2.6vw,1.1rem);color:rgba(255,255,255,.82);animation:mi-up .7s .65s both}
#mintro .mi-s b{color:#fff}
#mintro .mi-skip{position:absolute;right:18px;bottom:18px;font-size:.8rem;color:rgba(255,255,255,.6);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:99px;padding:7px 14px;cursor:pointer}
#mintro .mi-bar{position:absolute;left:0;bottom:0;height:3px;background:#FFC23C;animation:mi-bar ${STAY}ms linear both}
@keyframes mi-up{from{opacity:0;transform:translateY(16px)}}
@keyframes mi-grow{from{transform:scaleX(0)}}
@keyframes mi-bar{from{width:0}to{width:100%}}
@media (prefers-reduced-motion:reduce){#mintro *{animation:none!important}}`;

  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const box = document.createElement('div'); box.id = 'mintro'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', '31 years of corporate exposure');
  box.innerHTML = `<div class="mi-in">
    <div class="mi-logo"><img src="assets/logo.png" alt="MARS Training & Solution"></div>
    <div class="mi-num"><span id="mi-n">${reduce ? YEARS : 0}</span><sup>+</sup></div>
    <p class="mi-t">Years of Corporate Exposure</p>
    <div class="mi-line"></div>
    <p class="mi-s">Trusted by <b>500+ organisations</b> · <b>3 Lakh+</b> professionals trained</p>
  </div><button class="mi-skip" type="button">Skip</button><div class="mi-bar"></div>`;
  (document.body || document.documentElement).appendChild(box);
  document.documentElement.style.overflow = 'hidden';

  // count up 0 → 31
  if (!reduce) { const n = box.querySelector('#mi-n'), t0 = performance.now() + 250, dur = 1300;
    const tick = t => { const k = Math.min(Math.max((t - t0) / dur, 0), 1); n.textContent = Math.round(YEARS * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); }

  let done = false;
  const close = () => { if (done) return; done = true; box.classList.add('out'); document.documentElement.style.overflow = ''; setTimeout(() => { box.remove(); st.remove(); }, 650); removeEventListener('keydown', close); };
  box.addEventListener('click', close); addEventListener('keydown', close);
  setTimeout(close, STAY);
})();

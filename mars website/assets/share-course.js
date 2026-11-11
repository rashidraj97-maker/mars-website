/* "Share" on every course card: a small window asks for Name, Email and/or WhatsApp number (at least one of the two)
 * and sends the course outline, fee, duration, office address, office hours and contact numbers.
 * window.MARS_SHARE_PREVIEW = 1 -> nothing is sent; the window shows exactly what would be sent. */
(function () {
  if (window.__marsShare) return; window.__marsShare = true;
  const PREVIEW = !!window.MARS_SHARE_PREVIEW;
  const ADDRESS = 'Ground Floor, P-74, Nani Gopal Roy Chowdhury Avenue, CIT Road, Kolkata – 700014';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let D = null; fetch((window.MARS_AI_API || '') + '/api/catalog').then(r => r.json()).then(d => { D = d; }).catch(() => {});

  const ICON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px;margin-right:4px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';
  // add "Share" after Enquire on every card (cards are drawn and re-drawn by the filters)
  const addLinks = () => document.querySelectorAll('.cc4 .lk').forEach(lk => {
    if (lk.querySelector('[data-share]')) return;
    const t = lk.closest('.cc4').querySelector('h3'); if (!t) return;
    lk.insertAdjacentHTML('beforeend', `<a href="#" data-share="${esc(t.textContent.trim())}">${ICON}Share</a>`);
  });
  new MutationObserver(addLinks).observe(document.body, { childList: true, subtree: true }); addLinks();

  function details(title, card) {
    const c = D && D.courses ? D.courses.find(x => norm(x.t) === norm(title)) : null;
    const out = card && card.querySelector('.lk a[download]');
    const fee = c ? (c.price < c.fee ? `${inr(c.price)} (regular ${inr(c.fee)}${c.offEnd ? ', offer till ' + (+c.offEnd.slice(8)) + ' ' + MON[+c.offEnd.slice(5, 7) - 1] : ''})` : inr(c.fee)) : 'on request';
    return { title, fee, dur: (c && c.dur) || '', outline: out ? out.href : '', hours: (D && D.hours) || ['Mon – Thu: 10:30 AM – 7:30 PM', 'Friday: On call', 'Sat & Sun: 9:30 AM – 6:30 PM'],
      phones: (D && D.phones) || ['74396 02303', '70444 70064'], wa: '+91 98702 59245', enroll: 'https://app.marstraining.in/?course=' + encodeURIComponent(title) + '#enroll' };
  }
  const message = (x, name) => `${name ? 'Hi ' + name + ',\n\n' : ''}Thank you for your interest in *${x.title}* at MARS Training & Solution.\n\n` +
    `💰 *Fee:* ${x.fee}\n⏳ *Duration:* ${x.dur || '—'}\n📄 *Course outline:* ${x.outline || 'available on request'}\n\n` +
    `📍 *Office:* ${ADDRESS}\n🕘 *Office hours:* ${x.hours.join(' | ')}\n📞 *Call:* ${x.phones.join(' / ')}\n💬 *WhatsApp:* ${x.wa}\n\n` +
    `Enroll online: ${x.enroll}\nWebsite: https://marstraining.in`;

  const css = `#shp{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:16px;font:15px/1.45 Inter,system-ui,sans-serif;color:#0B1630}
#shp[hidden]{display:none}#shp .sc-bg{position:absolute;inset:0;background:rgba(6,14,32,.55);backdrop-filter:blur(3px)}
#shp .sc-win{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:22px;box-shadow:0 40px 90px -20px rgba(0,0,0,.5);animation:shp .35s cubic-bezier(.2,1,.3,1)}
@keyframes shp{from{opacity:0;transform:translateY(14px) scale(.97)}}
#shp .sc-head{padding:20px 22px 16px;background:linear-gradient(140deg,#06122A,#123170 60%,#2A6EB5);color:#fff;position:relative}
#shp .sc-head small{display:block;color:#AFC0DE;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:700}
#shp .sc-head h3{margin:4px 0 2px;font:800 21px/1.2 "Plus Jakarta Sans",Inter,sans-serif;color:#fff}
#shp .sc-head p{margin:0;color:#C9D6EE;font-size:13.5px}
#shp .sc-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,.15);color:#fff;font-size:19px;cursor:pointer}
#shp form{margin:0!important;padding:18px 22px 20px!important;display:grid;gap:12px;background:none;box-shadow:none;border:0;max-width:none}
#shp label{display:grid;gap:5px;font-size:13px;font-weight:600;color:#33415C}
#shp label i{font-style:normal;font-weight:500;color:#8A97AB}
#shp input{font:15px Inter,sans-serif;padding:11px 13px;border:1px solid #D5DEEA;border-radius:12px;outline:none}
#shp input:focus{border-color:#2A6EB5;box-shadow:0 0 0 3px rgba(42,110,181,.15)}
#shp .sc-note{font-size:12.5px;color:#5E6E86;background:#F4F7FC;border-radius:10px;padding:8px 11px}
#shp .sc-err{color:#B91C1C;font-size:13px;font-weight:600}
#shp .sc-go{border:0;border-radius:14px;padding:13px;font:700 15px Inter,sans-serif;color:#fff;background:linear-gradient(100deg,#2A6EB5,#7B61FF);cursor:pointer}
#shp .sc-go:disabled{opacity:.6}
#shp .sc-ok{padding:20px 22px 22px}#shp .sc-ok h4{margin:0 0 6px;font:800 18px "Plus Jakarta Sans",Inter,sans-serif}
#shp .sc-ok ul{margin:0 0 12px;padding-left:18px;font-size:14px}
#shp pre{white-space:pre-wrap;font:12.5px/1.5 Inter,sans-serif;background:#F4F7FC;border:1px solid #E1E8F2;border-radius:12px;padding:12px;margin:8px 0 0;max-height:260px;overflow:auto}
@media(max-width:560px){#shp{place-items:end center;padding:0}#shp .sc-win{width:100%;border-radius:22px 22px 0 0}}`;

  let root;
  function open(title, card) {
    if (!root) { root = document.createElement('div'); root.id = 'shp'; document.body.appendChild(root); const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
    root.hidden = false; document.body.style.overflow = 'hidden';
    root.innerHTML = `<div class="sc-bg" data-x></div><div class="sc-win" role="dialog" aria-modal="true" aria-labelledby="shp-t">
      <div class="sc-head"><button type="button" class="sc-x" data-x aria-label="Close">×</button><small>Share course details</small><h3 id="shp-t">${esc(title)}</h3>
      <p>We'll send the outline, fee, duration, office address, timings and contact numbers.</p></div>
      <form novalidate><label><span>Person name <i>(optional)</i></span><input name="name" autocomplete="name" placeholder="e.g. Rahul Sharma"></label>
      <label><span>Email ID</span><input name="email" type="email" autocomplete="email" placeholder="name@example.com"></label>
      <label><span>WhatsApp number</span><input name="wa" type="tel" inputmode="tel" autocomplete="tel" placeholder="10-digit mobile number"></label>
      <div class="sc-note">Fill in the email, the WhatsApp number or both. We send to whatever you fill.</div>
      <div class="sc-err" hidden></div><button class="sc-go" type="submit">Send course details</button></form></div>`;
    const f = root.querySelector('form'), er = root.querySelector('.sc-err');
    root.onclick = e => { if (e.target.closest('[data-x]')) close(); };
    f.onsubmit = e => {
      e.preventDefault();
      const name = f.name.value.trim(), email = f.email.value.trim(), wa = f.wa.value.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
      const fail = m => { er.textContent = m; er.hidden = false; };
      if (!email && !wa) return fail('Please fill in an email ID or a WhatsApp number (or both).');
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('Please check the email ID.');
      if (f.wa.value.trim() && !/^[6-9]\d{9}$/.test(wa)) return fail('Please enter a 10-digit Indian mobile number for WhatsApp.');
      const x = details(title, card), msg = message(x, name);
      const to = [email && 'Email: ' + email, wa && 'WhatsApp: +91 ' + wa].filter(Boolean);
      root.querySelector('.sc-win').innerHTML = `<div class="sc-head"><button type="button" class="sc-x" data-x aria-label="Close">×</button><small>${PREVIEW ? 'Preview: nothing was sent' : 'Sent'}</small><h3>${PREVIEW ? 'This is what would be sent' : 'Course details sent ✓'}</h3></div>
        <div class="sc-ok"><h4>To</h4><ul>${to.map(t => `<li>${esc(t)}</li>`).join('')}</ul><h4>Message</h4><pre>${esc(msg)}</pre></div>`;
    };
    setTimeout(() => f.name.focus(), 50);
  }
  function close() { root.hidden = true; root.innerHTML = ''; document.body.style.overflow = ''; }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root && !root.hidden) close(); });
  document.addEventListener('click', e => { const a = e.target.closest('[data-share]'); if (!a) return; e.preventDefault(); open(a.dataset.share, a.closest('.cc4')); });
})();

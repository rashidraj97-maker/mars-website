/* Home hero: the report card changes by itself every few seconds, each slide a different kind of analysis
 * (Excel, Power BI, Looker Studio, SQL, Python). Slide 1 is the static HTML in index.html; the rest are built here.
 * Pauses while hovered, while the tab is hidden and while the card is off screen. No auto-change for reduced motion. */
(function () {
  const stack = document.querySelector('.dstack'); if (!stack) return;
  const sheet = stack.closest('.sheet'), tb = sheet.querySelector('.tb'), tbn = document.getElementById('tbn'), tool = document.getElementById('tbtool');
  const fxc = document.getElementById('fxc'), fx = document.getElementById('fx'), dots = sheet.querySelector('.rdots');
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches, DUR = 6000;

  /* ---------- small chart builders (SVG 320 x 142 for the wide chart, HTML for the side panel) ---------- */
  const svg = (inner, cls = '') => `<svg viewBox="0 0 320 142" class="rc ${cls}">${inner}</svg>`;
  const grid = ys => `<g class="gl">${ys.map(y => `<line x1="14" x2="310" y1="${y}" y2="${y}"/>`).join('')}</g>`;
  const card = (title, legend, body) => `<div class="ch"><div class="cht"><b>${title}</b>${legend ? `<span>${legend}</span>` : ''}</div>${body}</div>`;
  const key = (c, t, dash) => `<i style="background:${c}${dash ? ';height:2px;border-radius:0' : ''}"></i>${t}`;
  const kpis = k => `<div class="kpis">${k.map(([s, b, t, good]) => `<div class="kpi"><small>${s}</small><b>${b}</b><span class="${good ? 'up' : 'dn'}">${t}</span></div>`).join('')}</div>`;

  function hbars(rows, c) {
    const mx = Math.max(...rows.map(r => r[1]));
    return svg(rows.map(([l, v, d], i) => { const y = 8 + i * 26, w = 196 * v / mx;
      return `<text x="2" y="${y + 11}">${l}</text><rect class="g" style="--i:${i}" x="74" y="${y}" width="${w.toFixed(1)}" height="15" rx="4" fill="${c}" fill-opacity="${(1 - i * .14).toFixed(2)}"/><text class="v fi" style="--i:${i}" x="${(80 + w).toFixed(1)}" y="${y + 11}">${d}</text>`; }).join(''));
  }
  function columns(rows, target, c) {
    const top = 18, base = 116, mx = Math.max(target, ...rows.map(r => r[1])) * 1.12, h = v => (base - top) * v / mx, slot = 292 / rows.length, ty = base - h(target);
    return svg(grid([18, 51, 84, 116]) + rows.map(([l, v], i) => { const x = 18 + slot * i + (slot - 30) / 2, low = v < target;
      return `<rect class="gy" style="--i:${i}" x="${x.toFixed(1)}" y="${(base - h(v)).toFixed(1)}" width="30" height="${h(v).toFixed(1)}" rx="4" fill="${low ? '#EF4444' : c}"/><text class="v fi mid" style="--i:${i}" x="${(x + 15).toFixed(1)}" y="${(base - h(v) - 5).toFixed(1)}">${v}K</text><text class="mid" x="${(x + 15).toFixed(1)}" y="132">${l}</text>`; }).join('') +
      `<line class="tgt fi" x1="14" x2="310" y1="${ty.toFixed(1)}" y2="${ty.toFixed(1)}"/>`);
  }
  function waterfall(rows) {   // [label, value, 'total' | 'minus']
    const top = 20, base = 116, mx = rows[0][1], k = (base - top) / mx, slot = 292 / rows.length; let run = mx, out = '';
    rows.forEach(([l, v, t], i) => {
      const x = 18 + slot * i + (slot - 32) / 2, cx = (x + 16).toFixed(1);
      let y0, y1, fill, cls = 'gy';
      if (t === 'total') { y0 = base - v * k; y1 = base; fill = i ? '#22C55E' : '#2A6EB5'; }
      else { y0 = base - run * k; run -= v; y1 = base - run * k; fill = '#EF4444'; cls = 'gt'; }
      out += `<rect class="${cls}" style="--i:${i}" x="${x.toFixed(1)}" y="${y0.toFixed(1)}" width="32" height="${(y1 - y0).toFixed(1)}" rx="3" fill="${fill}"/>` +
        `<text class="v fi mid" style="--i:${i}" x="${cx}" y="${(y0 - 5).toFixed(1)}">${t === 'total' ? '₹' + v : '−' + v}</text><text class="mid" x="${cx}" y="132">${l}</text>`;
      if (i < rows.length - 1) out += `<line class="cn fi" style="--i:${i}" x1="${(x + 32).toFixed(1)}" x2="${(x + slot).toFixed(1)}" y1="${(base - run * k).toFixed(1)}" y2="${(base - run * k).toFixed(1)}"/>`;
    });
    return svg(grid([20, 116]) + out);
  }
  function funnel(rows, c) {   // [label, shown, width 0-1]
    return svg(rows.map(([l, d, w], i) => { const y = 6 + i * 33, W = 290 * w, x = 160 - W / 2;
      return `<rect class="gc" style="--i:${i}" x="${x.toFixed(1)}" y="${y}" width="${W.toFixed(1)}" height="26" rx="6" fill="${c}" fill-opacity="${(1 - i * .2).toFixed(2)}"/><text class="in fi" style="--i:${i}" x="160" y="${y + 17}">${l} · ${d}</text>`; }).join(''));
  }
  function heatmap(rows, heads) {
    let out = heads.map((h, j) => `<text class="mid" x="${(58 + j * 45).toFixed(1)}" y="11">${h}</text>`).join('');
    rows.forEach(([l, vals], i) => { const y = 17 + i * 23;
      out += `<text x="2" y="${y + 14}">${l}</text>` + vals.map((v, j) => `<rect class="fi" style="--i:${i + j}" x="${36 + j * 45}" y="${y}" width="43" height="20" rx="3" fill="#2A6EB5" fill-opacity="${(.1 + .9 * v / 100).toFixed(2)}"/><text class="fi mid ${v > 45 ? 'w' : 'v'}" style="--i:${i + j}" x="${(57.5 + j * 45).toFixed(1)}" y="${y + 13.5}">${v}%</text>`).join(''); });
    return svg(out);
  }
  function forecast(actual, fc, labels) {   // values in ₹ Cr; actual then forecast with a shaded range
    const top = 14, base = 116, lo = 3.2, hi = 6.2, X = i => 22 + i * (288 / (labels.length - 1)), Y = v => base - (base - top) * (v - lo) / (hi - lo);
    const a = actual.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`), s = actual.length - 1;
    const f = [[s, actual[s]], ...fc.map((v, i) => [s + 1 + i, v])], fl = f.map(([i, v]) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`);
    const band = f.map(([i, v], k) => `${X(i).toFixed(1)},${Y(v + k * .12).toFixed(1)}`).concat(f.slice().reverse().map(([i, v], k) => `${X(i).toFixed(1)},${Y(v - (f.length - 1 - k) * .12).toFixed(1)}`));
    return svg(grid([14, 48, 82, 116]) + `<polygon class="fi band" style="--i:6" points="${band.join(' ')}"/><polyline class="ln" pathLength="1" points="${a.join(' ')}"/><polyline class="fc fi" style="--i:8" points="${fl.join(' ')}"/>` +
      `<line class="now fi" x1="${X(s)}" x2="${X(s)}" y1="10" y2="116"/>` + labels.map((l, i) => `<text class="mid" x="${X(i).toFixed(1)}" y="132">${l}</text>`).join(''));
  }
  const bars = rows => `<ul class="rl">${rows.map(([l, w, d, c, tick], i) => `<li>${l}<b>${d}</b><span class="pb"><i style="--w:${w}%;--i:${i}${c ? ';--c:' + c : ''}"></i>${tick ? `<em style="--t:${tick}%"></em>` : ''}</span></li>`).join('')}</ul>`;
  const gauge = (pct, sub) => `<div class="gw"><svg viewBox="0 0 120 70" class="ga"><path d="M14 62 A46 46 0 0 1 106 62" class="bg"/><path d="M14 62 A46 46 0 0 1 106 62" class="fg" pathLength="100" style="--o:${100 - pct}"/><text x="60" y="56">${pct}%</text></svg><ul class="rl">${sub.map(([l, d]) => `<li>${l}<b>${d}</b></li>`).join('')}</ul></div>`;
  const stacked = rows => `<div class="gw"><div class="stk">${rows.map(([, v, c], i) => `<i style="width:${v}%;background:${c};--i:${i}"></i>`).join('')}</div><ul class="rl">${rows.map(([l, v, c]) => `<li><span><i class="sw" style="background:${c}"></i>${l}</span><b>${v}%</b></li>`).join('')}</ul></div>`;

  /* ---------- the reports ---------- */
  const XL = ['#1D6F42', '#fff', 'Excel'], PBI = ['#F2C811', '#1F2328', 'Power BI'], LS = ['#1A73E8', '#fff', 'Looker Studio'], SQL = ['#0B3B60', '#fff', 'SQL'], PY = ['#2F5F8A', '#fff', 'Python'];
  const R = [
    { t: XL, file: 'Sales_Dashboard.xlsx', cell: 'B4', fx: '=SUMIFS(Sales[Amount],Sales[Region],"East")' },   // slide 1: the HTML already on the page
    { t: PBI, file: 'HR_Attrition_Report.pbix', cell: 'DAX', fx: 'Attrition % = DIVIDE([Exits], [Avg Headcount])',
      k: [['Headcount', '1,248', '▲ 3.2%', 1], ['Attrition', '11.2%', '▼ 1.4%', 1], ['Avg tenure', '4.6 yrs', '▲ 0.3', 1]],
      a: card('Attrition by department', 'FY 2026', hbars([['Sales', 18, '18%'], ['Operations', 13, '13%'], ['IT', 9, '9%'], ['Finance', 6, '6%'], ['HR', 5, '5%']], '#7B61FF')),
      b: card('Hiring vs plan', '', gauge(82, [['Hired', '123'], ['Planned', '150'], ['Open roles', '27']])) },
    { t: LS, file: 'Marketing_Leads_Report', cell: 'Field', fx: 'CTR = SUM(Clicks) / SUM(Impressions)',
      k: [['Leads', '3,920', '▲ 14%', 1], ['Cost / lead', '₹184', '▼ 6%', 1], ['Conversion', '6.8%', '▲ 0.9 pts', 1]],
      a: card('Campaign funnel', 'Oct 2026', funnel([['Impressions', '2.4L', 1], ['Clicks', '18.6K', .74], ['Leads', '3,920', .5], ['Enrolled', '266', .3]], '#1A73E8')),
      b: card('Leads by channel', '', stacked([['Google', 41, '#1A73E8'], ['Meta', 29, '#7B61FF'], ['LinkedIn', 18, '#22C55E'], ['Referral', 12, '#FFC23C']])) },
    { t: XL, file: 'Inventory_Stock.xlsx', cell: 'D7', fx: '=XLOOKUP(A7,Stock[SKU],Stock[Qty],0)',
      k: [['Stock value', '₹1.9 Cr', '▲ 4.6%', 1], ['Turnover', '6.4x', '▲ 0.8', 1], ['Stock-outs', '14', '▼ 9', 1]],
      a: card('Stock by warehouse', key('#EF4444', 'Reorder level', 1), columns([['Kolkata', 42], ['Delhi', 35], ['Mumbai', 51], ['Pune', 24], ['Chennai', 33]], 30, '#1D6F42')),
      b: card('Stock ageing', '', bars([['0–30 days', 58, '58%', '#1D6F42'], ['31–60 days', 24, '24%', '#22C55E'], ['61–90 days', 11, '11%', '#FFC23C'], ['90+ days', 7, '7%', '#EF4444']])) },
    { t: SQL, file: 'customer_retention.sql', cell: 'SQL', fx: 'SELECT cohort, COUNT(DISTINCT customer_id) FROM orders GROUP BY cohort;',
      k: [['Customers', '8,640', '▲ 11%', 1], ['Repeat rate', '41%', '▲ 3 pts', 1], ['Avg order', '₹2,380', '▲ 5.2%', 1]],
      a: card('Retention by cohort', 'Month 0–5', heatmap([['Jan', [100, 46, 38, 33, 30, 28]], ['Feb', [100, 44, 36, 31, 29]], ['Mar', [100, 48, 40, 35]], ['Apr', [100, 51, 42]], ['May', [100, 53]]], ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'])),
      b: card('Top cities', '', bars([['Kolkata', 100, '34%'], ['Delhi', 62, '21%'], ['Mumbai', 53, '18%'], ['Bengaluru', 44, '15%']])) },
    { t: PBI, file: 'Finance_PnL_FY26.pbix', cell: 'DAX', fx: 'EBITDA % = DIVIDE([EBITDA], [Revenue])',
      k: [['Revenue', '₹12.6 Cr', '▲ 9.8%', 1], ['EBITDA', '18.4%', '▲ 1.1 pts', 1], ['Net profit', '₹1.7 Cr', '▲ 6.2%', 1]],
      a: card('Revenue to net profit', '₹ Cr', waterfall([['Revenue', 12.6, 'total'], ['COGS', 6.2, 'minus'], ['Opex', 3.9, 'minus'], ['Tax', .8, 'minus'], ['Net', 1.7, 'total']])),
      b: card('Budget vs actual', '', bars([['Sales', 78, '104%', '#2A6EB5', 75], ['Marketing', 69, '92%', '#2A6EB5', 75], ['Admin', 83, '111%', '#EF4444', 75], ['IT', 65, '87%', '#2A6EB5', 75]])) },
    { t: PY, file: 'sales_forecast.ipynb', cell: 'In [3]', fx: 'forecast = model.fit(sales).predict(periods=3)',
      k: [['Next quarter', '₹5.6 Cr', '▲ 9.4%', 1], ['Error (MAPE)', '4.8%', '▼ 0.6', 1], ['Peak month', 'Dec', 'Festive', 1]],
      a: card('Sales forecast', key('#2F5F8A', 'Actual') + key('#7B61FF', 'Forecast', 1), forecast([3.6, 3.9, 3.7, 4.2, 4.5, 4.4], [4.9, 5.3, 5.8], ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'])),
      b: card('What drives sales', '', bars([['Season', 100, '38%', '#2F5F8A'], ['Price', 63, '24%', '#2F5F8A'], ['Offers', 55, '21%', '#2F5F8A'], ['Region', 45, '17%', '#2F5F8A']])) }
  ];
  R.slice(1).forEach(r => stack.insertAdjacentHTML('beforeend', `<div class="dash">${kpis(r.k)}<div class="charts">${r.a}${r.b}</div></div>`));
  const slides = [...stack.children];
  dots.innerHTML = slides.map(() => '<span><i></i></span>').join('');
  const dl = [...dots.children];

  let cur = 0, el = 0, typer = 0, hover = false, seen = true;
  function type(text) {
    clearInterval(typer);
    if (REDUCE) { fx.textContent = text; return; }
    let i = 0; fx.textContent = '';
    typer = setInterval(() => { fx.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(typer); }, 34);
  }
  function show(n) {
    slides[cur].classList.remove('on'); dl[cur].classList.remove('on'); dl[cur].firstChild.style.width = '';
    cur = (n + slides.length) % slides.length; el = 0;
    slides[cur].classList.add('on'); dl[cur].classList.add('on');
    const r = R[cur]; tb.style.background = r.t[0]; tb.style.color = r.t[1]; tb.classList.toggle('lt', r.t[1] !== '#fff');
    tbn.textContent = r.file; tool.textContent = r.t[2]; fxc.textContent = r.cell; type(r.fx);
  }
  show(0);
  if (REDUCE) return;   // people who prefer less motion get the first report only
  dl.forEach((d, i) => d.addEventListener('click', () => show(i)));
  sheet.addEventListener('mouseenter', () => { hover = true; });
  sheet.addEventListener('mouseleave', () => { hover = false; });
  new IntersectionObserver(es => { seen = es[0].isIntersecting; }).observe(sheet);
  setInterval(() => {
    if (hover || !seen || document.hidden) return;
    el += 100; dl[cur].firstChild.style.width = Math.min(100, el / DUR * 100) + '%';
    if (el >= DUR) show(cur + 1);
  }, 100);
})();

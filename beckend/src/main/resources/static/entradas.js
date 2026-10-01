const KEY = 'entradas:v1';
const COLORS = ['#ff5a36', '#ffb020', '#3ddc84', '#6c7bff', '#ff6b9d', '#2ec4d6', '#b47cff', '#a3e635'];
let data = [];
try {
  const raw = JSON.parse(localStorage.getItem(KEY));
  if (Array.isArray(raw)) {
    data = raw
      .filter(e => e && typeof e.date === 'string' && typeof e.cat === 'string' && Number(e.val) > 0)
      .map(e => ({ ...e, val: Number(e.val) }));
  }
} catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };

const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const now = new Date();
const todayISO = iso(now.getFullYear(), now.getMonth(), now.getDate());
let view = { y: now.getFullYear(), m: now.getMonth() };
let sel = todayISO;

const colorOf = cat => {
  let h = 0;
  for (const c of cat.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COLORS[h % COLORS.length];
};
const monthPrefix = () => `${view.y}-${pad(view.m + 1)}`;
const monthData = () => data.filter(e => e.date.startsWith(monthPrefix()));
const longDate = s => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function render() {
  $('#hoje').textContent = longDate(todayISO);
  const md = monthData();
  const total = md.reduce((s, e) => s + e.val, 0);
  const dias = new Set(md.map(e => e.date));
  const byCat = {};
  md.forEach(e => byCat[e.cat] = (byCat[e.cat] || 0) + e.val);
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);

  $('#sTotal').textContent = brl(total);
  $('#sDias').textContent = dias.size;
  $('#sMedia').textContent = dias.size ? brl(total / dias.size) : '—';
  $('#sTop').textContent = cats.length ? cats[0][0] : '—';

  $('#cats').innerHTML = cats.length ? cats.map(([c, v]) => {
    const p = total ? v / total * 100 : 0;
    return `<div class="cat"><div class="row"><span>${esc(c)}</span><small>${brl(v)} · ${Math.round(p)}%</small></div>
      <div class="bar"><i style="width:${p}%;background:${colorOf(c)}"></i></div></div>`;
  }).join('') : '<p class="empty">Nenhuma entrada neste mês. Clique em um dia do calendário para lançar.</p>';

  $('#mes').textContent = new Date(view.y, view.m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const first = new Date(view.y, view.m, 1).getDay();
  const last = new Date(view.y, view.m + 1, 0).getDate();
  const withExp = new Set(data.map(e => e.date));
  let html = '<span></span>'.repeat(first);
  for (let d = 1; d <= last; d++) {
    const k = iso(view.y, view.m, d);
    html += `<button data-d="${k}" class="${withExp.has(k) ? 'has' : ''} ${k === todayISO ? 'today' : ''}">${d}</button>`;
  }
  $('#cal').innerHTML = html;
  $('#catList').innerHTML = [...new Set(data.map(e => e.cat))].map(c => `<option value="${esc(c)}">`).join('');
}

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderDay() {
  $('#mTitulo').textContent = longDate(sel);
  const items = data.filter(e => e.date === sel);
  $('#lista').innerHTML = items.map(e => `<div class="item"><i class="dot" style="background:${colorOf(e.cat)}"></i>
    <span>${esc(e.cat)}</span><b>${brl(e.val)}</b><button data-id="${e.id}" title="Remover">✕</button></div>`).join('');
}

function openDay(d) {
  sel = d;
  renderDay();
  $('#modal').hidden = false;
  $('#fCat').focus();
}
const close = () => { $('#modal').hidden = true; };

$('#cal').addEventListener('click', e => { const b = e.target.closest('button'); if (b) openDay(b.dataset.d); });
$('#btnHoje').onclick = () => { view = { y: now.getFullYear(), m: now.getMonth() }; render(); openDay(todayISO); };
$('#btnMes').onclick = () => { view = { y: now.getFullYear(), m: now.getMonth() }; render(); };
$('#prev').onclick = () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } render(); };
$('#next').onclick = () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } render(); };
$('#fechar').onclick = close;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

$('#form').addEventListener('submit', e => {
  e.preventDefault();
  let cat = $('#fCat').value.trim();
  const val = parseFloat($('#fVal').value.replace(/\./g, '').replace(',', '.'));
  if (!cat || !(val > 0)) return;
  const existing = data.find(x => x.cat.toLowerCase() === cat.toLowerCase());
  if (existing) cat = existing.cat;
  data.push({ id: Date.now() + Math.random(), date: sel, cat, val });
  save();
  $('#form').reset();
  $('#fCat').focus();
  render();
  renderDay();
});

$('#lista').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  data = data.filter(x => String(x.id) !== b.dataset.id);
  save();
  render();
  renderDay();
});

render();

const KEY = 'controle-gastos:gastos';
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
  const pendCat = {};
  md.forEach(e => { if (e.paga === false) pendCat[e.cat] = (pendCat[e.cat] || 0) + e.val; });

  $('#sTotal').textContent = brl(total);
  $('#sDias').textContent = dias.size;
  $('#sMedia').textContent = dias.size ? brl(total / dias.size) : '—';
  $('#sTop').textContent = cats.length ? cats[0][0] : '—';
  $('#sPend').textContent = brl(md.filter(e => e.paga === false).reduce((s, e) => s + e.val, 0));

  $('#cats').innerHTML = cats.length ? cats.map(([c, v]) => {
    const p = total ? v / total * 100 : 0;
    return `<div class="cat ${pendCat[c] ? 'pend' : ''}"><div class="row"><span>${esc(c)}</span><small>${brl(v)} · ${Math.round(p)}%</small></div>
      ${pendCat[c] ? `<div class="apagar">A pagar: ${brl(pendCat[c])}</div>` : ''}
      <div class="bar"><i style="width:${p}%;background:${colorOf(c)}"></i></div></div>`;
  }).join('') : '<p class="empty">Nenhum gasto neste mês. Clique em um dia do calendário para lançar.</p>';

  $('#mes').textContent = new Date(view.y, view.m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const first = new Date(view.y, view.m, 1).getDay();
  const last = new Date(view.y, view.m + 1, 0).getDate();
  // pend = tem dívida sem check (vermelho) | has = tudo pago (cinza)
  const status = {};
  data.forEach(e => { status[e.date] = e.paga === false ? 'pend' : (status[e.date] || 'has'); });
  let html = '<span></span>'.repeat(first);
  for (let d = 1; d <= last; d++) {
    const k = iso(view.y, view.m, d);
    html += `<button data-d="${k}" class="${status[k] || ''} ${k === todayISO ? 'today' : ''}" title="${status[k] === 'pend' ? 'Há dívida a pagar' : ''}">${d}</button>`;
  }
  $('#cal').innerHTML = html;
  $('#catList').innerHTML = [...new Set(data.map(e => e.cat))].map(c => `<option value="${esc(c)}">`).join('');
}

const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function renderDay() {
  $('#mTitulo').textContent = longDate(sel);
  const items = data.filter(e => e.date === sel);
  $('#lista').innerHTML = items.map(e => {
    const pend = e.paga === false;
    return `<div class="item ${pend ? 'pend' : ''}">
      <input type="checkbox" class="chk" data-id="${e.id}" ${pend ? '' : 'checked'} title="Marcar como pago">
      <i class="dot" style="background:${colorOf(e.cat)}"></i>
      <span>${esc(e.cat)}${e.total > 1 ? `<em class="parc">${e.parc}/${e.total}</em>` : ''}${pend ? ' <em>a pagar</em>' : ''}</span><b>${brl(e.val)}</b>
      <button class="del" data-id="${e.id}" title="Excluir">🗑</button></div>`;
  }).join('');
}

function openDay(d) {
  sel = d;
  renderDay();
  $('#fPend').checked = sel > todayISO; // data futura: já sugere "a pagar"
  $('#modal').hidden = false;
  $('#fCat').focus();
}
const close = () => { $('#modal').hidden = true; };

function prev() {
  const n = parseInt($('#fParc').value, 10) || 1;
  const v = parseFloat($('#fVal').value.replace(/\./g, '').replace(',', '.'));
  $('#lblVal').textContent = n > 1 ? 'Valor total da compra (R$)' : 'Valor (R$)';
  $('#fPrev').textContent = n > 1 && v > 0 ? `${n}x de ${brl(Math.floor(Math.round(v * 100) / n) / 100)} (total ${brl(v)})` : '';
}
$('#fVal').addEventListener('input', prev);
$('#fParc').addEventListener('input', prev);

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
  const n = Math.min(60, Math.max(1, parseInt($('#fParc').value, 10) || 1));
  const [y0, m0, d0] = sel.split('-').map(Number);
  const grupo = Date.now();
  let ultima = sel;
  const cents = Math.round(val * 100), base = Math.floor(cents / n); // valor digitado = total da compra
  for (let i = 0; i < n; i++) {
    const dt = new Date(y0, m0 - 1 + i, 1);
    const dim = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
    const date = iso(dt.getFullYear(), dt.getMonth(), Math.min(d0, dim)); // dia 31 vira o último dia do mês curto
    ultima = date;
    const parcVal = (base + (i === n - 1 ? cents - base * n : 0)) / 100; // centavos que sobram vão pra última parcela
    // 1ª parcela segue o check; parcelas futuras nascem sempre "a pagar"
    const paga = i === 0 || date <= todayISO ? !$('#fPend').checked : false;
    data.push({ id: Date.now() + Math.random(), date, cat, val: parcVal, paga, ...(n > 1 ? { grupo, parc: i + 1, total: n } : {}) });
  }
  save();
  $('#form').reset();
  $('#fPend').checked = sel > todayISO;
  prev();
  if (n > 1) $('#fPrev').textContent = `✓ ${n} parcelas de ${brl(base / 100)} lançadas, a última em ${ultima.split('-').reverse().join('/')}`;
  $('#fCat').focus();
  render();
  renderDay();
});

$('#lista').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const it = data.find(x => String(x.id) === b.dataset.id);
  if (!it) return;
  // parcelada: exclui esta + todas as parcelas da frente
  const seguintes = it.grupo ? data.filter(x => x.grupo === it.grupo && x.parc > it.parc) : [];
  if (seguintes.length && !confirm(`Excluir "${it.cat}" (${it.parc}/${it.total}) e as ${seguintes.length} parcela(s) seguinte(s)?`)) return;
  data = data.filter(x => x !== it && !seguintes.includes(x));
  save();
  render();
  renderDay();
});

render();

$('#lista').addEventListener('change', e => {
  const c = e.target.closest('.chk');
  if (!c) return;
  const it = data.find(x => String(x.id) === c.dataset.id);
  if (!it) return;
  it.paga = c.checked;
  save();
  render();
  renderDay();
});

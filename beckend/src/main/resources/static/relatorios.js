const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const r2 = n => Math.round(n * 100) / 100 + 0; // evita -0 e sobras de ponto flutuante
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const load = key => {
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(e => e && typeof e.date === 'string' && typeof e.cat === 'string' && Number(e.val) > 0)
      .map(e => ({ ...e, val: Number(e.val) }));
  } catch (e) { return []; }
};

const now = new Date();
let year = now.getFullYear();
let gastos = [], entradas = [];

function render() {
  $('#ano').textContent = year;
  $('#rel').innerHTML = MESES.map((nome, m) => {
    const p = `${year}-${pad(m + 1)}`;
    const ent = r2(entradas.filter(e => e.date.startsWith(p)).reduce((s, e) => s + e.val, 0));
    const sai = {}, pend = {};
    gastos.filter(e => e.date.startsWith(p)).forEach(e => {
      sai[e.cat] = (sai[e.cat] || 0) + e.val;
      if (e.paga === false) pend[e.cat] = true;
    });
    const lista = Object.entries(sai).sort((a, b) => b[1] - a[1]);
    const totSai = r2(lista.reduce((s, [, v]) => s + v, 0));
    const saldo = r2(ent - totSai);
    const atual = year === now.getFullYear() && m === now.getMonth();
    return `<div class="mcol ${atual ? 'atual' : ''}">
      <div class="pill mes">${nome}</div>
      <div class="pill ent"><span>Entradas</span><b>${brl(ent)}</b></div>
      ${lista.map(([c, v]) => `<div class="pill sai ${pend[c] ? 'pend' : ''}"><span>${esc(c)}</span><b>${brl(r2(v))}</b></div>`).join('') || '<div class="vazio">Sem saídas</div>'}
      <div class="pill saldo ${saldo < 0 ? 'neg' : 'pos'}"><span>Entradas − Saídas</span><b>${brl(saldo)}</b></div>
    </div>`;
  }).join('');
}

function refresh() {
  gastos = load('controle-gastos:gastos');
  entradas = load('entradas:v1');
  render();
}

$('#aPrev').onclick = () => { year--; render(); };
$('#aNext').onclick = () => { year++; render(); };
// a aba pode ficar aberta enquanto você lança coisas na outra: atualiza ao voltar pra ela
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
window.addEventListener('storage', refresh);

refresh();
const atual = $('.mcol.atual');
if (atual && atual.scrollIntoView) atual.scrollIntoView({ inline: 'center', block: 'nearest' });

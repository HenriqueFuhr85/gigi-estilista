import './style.css';
import { FABRICS, fabricFill, type Fabric } from './fabrics';
import { SHAPES, type Shape, type Slot } from './shapes';
import { installSvgDefs } from './svgDefs';
import { Mannequin, garmentMarkup } from './mannequin';
import { Gigi } from './gigi';
import { makeDraggable } from './drag';

type State = 'escolherTecido' | 'escolherCorte' | 'cortando';
type Outfit = Partial<Record<Slot, { shape: Shape; fabric: Fabric }>>;

installSvgDefs();

const shelf = document.querySelector<HTMLElement>('#prateleira')!;
const stage = document.querySelector<HTMLElement>('#palco')!;
const cutPanel = document.querySelector<HTMLElement>('#cortes')!;
const btnUndo = document.querySelector<HTMLButtonElement>('#desfazer')!;
const btnClear = document.querySelector<HTMLButtonElement>('#tirar')!;

const mannequin = new Mannequin(stage);
const gigi = new Gigi(document.querySelector<HTMLElement>('#gigi')!);

let state: State = 'escolherTecido';
let currentFabric: Fabric | null = null;
let outfit: Outfit = {};
const history: Outfit[] = [];

const COMPLIMENTS = [
  'Ficou lindo!',
  'Que arraso!',
  'Uau, que estilo!',
  'Perfeito! Você é uma ótima estilista!',
  'Maravilhoso!',
  'Que combinação incrível!',
];
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Prateleira de tecidos ---------- */

function swatchMarkup(f: Fabric): string {
  return `
    <svg viewBox="0 0 90 70" aria-hidden="true">
      <path d="M20,18 L80,18 L84,62 Q70,56 56,62 Q42,56 28,62 Z" fill="${fabricFill(f)}" stroke="rgba(40,20,60,.3)" stroke-width="1.5"/>
      <rect x="6" y="6" width="22" height="58" rx="11" fill="${fabricFill(f)}" stroke="rgba(40,20,60,.3)" stroke-width="1.5"/>
      <rect x="6" y="6" width="22" height="58" rx="11" fill="url(#rolo)"/>
      <ellipse cx="17" cy="9" rx="9" ry="3" fill="rgba(255,255,255,.35)"/>
    </svg>
    <span>${f.name}</span>`;
}

for (const f of FABRICS) {
  const item = document.createElement('div');
  item.className = 'tecido';
  item.tabIndex = 0;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Tecido ${f.name}`);
  item.innerHTML = swatchMarkup(f);
  shelf.append(item);
  makeDraggable(item, {
    target: () => stage,
    enabled: () => state !== 'cortando',
    onDragStart: () => stage.classList.add('alvo'),
    onDragEnd: () => stage.classList.remove('alvo'),
    onDrop: () => chooseFabric(f),
  });
}

/* ---------- Fluxo do jogo ---------- */

function setState(next: State): void {
  state = next;
  document.body.dataset.estado = next;
  cutPanel.hidden = next !== 'escolherCorte';
  btnUndo.disabled = history.length === 0 || next === 'cortando';
  btnClear.disabled = Object.keys(outfit).length === 0 || next === 'cortando';
}

function chooseFabric(f: Fabric): void {
  currentFabric = f;
  mannequin.showDrape(f);
  renderCutPanel(f);
  setState('escolherCorte');
  gigi.say(`Que lindo, ${f.name}! Agora escolha o formato para cortar o tecido.`);
}

function renderCutPanel(f: Fabric): void {
  cutPanel.innerHTML = '<h2>Escolha o corte</h2><div class="cortes-lista"></div>';
  const list = cutPanel.querySelector('.cortes-lista')!;
  for (const s of SHAPES) {
    const b = document.createElement('button');
    b.className = 'corte';
    b.type = 'button';
    b.innerHTML = `<svg viewBox="${s.viewBox}" aria-hidden="true">${garmentMarkup(s, f)}</svg><span>${s.name}</span>`;
    b.addEventListener('click', () => cutShape(s));
    list.append(b);
  }
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'botao secundario';
  cancel.textContent = 'Trocar tecido';
  cancel.addEventListener('click', () => {
    mannequin.hideDrape();
    currentFabric = null;
    setState('escolherTecido');
    gigi.say('Tudo bem! Escolha outro tecido e arraste até a manequim.');
  });
  cutPanel.append(cancel);
}

async function cutShape(shape: Shape): Promise<void> {
  if (!currentFabric || state !== 'escolherCorte') return;
  const fabric = currentFabric;
  setState('cortando');
  gigi.say(`Cortando ${article(shape)} ${shape.name.toLowerCase()}... ✂️`);
  await mannequin.cut(shape);

  history.push({ ...outfit });
  const next: Outfit = { ...outfit };
  if (shape.slot === 'inteiro') {
    delete next.superior;
    delete next.inferior;
  } else if (shape.slot === 'superior' || shape.slot === 'inferior') {
    delete next.inteiro;
  }
  next[shape.slot] = { shape, fabric };
  applyOutfit(next, shape.slot);

  mannequin.sparkle();
  currentFabric = null;
  setState('escolherTecido');
  gigi.say(`${pick(COMPLIMENTS)} Quer criar outra peça? Arraste mais um tecido.`, true);
}

function article(s: Shape): string {
  return ['Blusa', 'Saia', 'Calça', 'Capa'].includes(s.name) ? 'a' : 'o';
}

function applyOutfit(next: Outfit, animated?: Slot): void {
  outfit = next;
  mannequin.clearAll();
  for (const [slot, piece] of Object.entries(outfit) as [Slot, { shape: Shape; fabric: Fabric }][]) {
    mannequin.wear(slot, piece.shape, piece.fabric, slot === animated);
  }
}

btnUndo.addEventListener('click', () => {
  const prev = history.pop();
  if (!prev) return;
  applyOutfit(prev);
  setState(state);
  gigi.say('Pronto, desfiz a última peça.');
});

btnClear.addEventListener('click', () => {
  history.push({ ...outfit });
  applyOutfit({});
  setState(state);
  gigi.say('Manequim pronta para um novo look!');
});

setState('escolherTecido');
gigi.say('Oi, eu sou a Gigi! Arraste um tecido até a manequim para criarmos uma roupa.');

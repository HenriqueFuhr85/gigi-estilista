import './style.css';
import { FABRICS, fabricFill, type Fabric } from './fabrics';
import { SHAPES, type Shape, type Slot } from './shapes';
import { installSvgDefs } from './svgDefs';
import { Mannequin, bodyMarkup, garmentMarkup } from './mannequin';
import { Gigi } from './gigi';
import { makeDraggable } from './drag';
import { JEWELS, JEWEL_PREVIEW, JEWEL_SLOTS, getJewel, type Jewel, type JewelSlot } from './accessories';
import {
  FACES,
  FEATURES,
  FEATURE_KINDS,
  HAIR_COLORS,
  HAIR_STYLES,
  faceMarkup,
  featuresMarkup,
  getFace,
  getFeature,
  getHairColor,
  getHairStyle,
  hairMarkup,
  type FeatureKind,
} from './face';

type State = 'escolherTecido' | 'escolherCorte' | 'cortando';
type Outfit = Partial<Record<Slot, { shape: Shape; fabric: Fabric }>>;

/** Tudo o que está na manequim: roupas, joias, rosto e cabelo. */
interface Look {
  outfit: Outfit;
  joias: Partial<Record<JewelSlot, string>>;
  rosto: string;
  /** Olhos, nariz e boca escolhidos. */
  tracos: Record<FeatureKind, string>;
  cabelo: string;
  corCabelo: string;
}

/** O que acabou de mudar, para animar só essa parte. */
type Changed = Slot | JewelSlot | 'rosto' | 'tracos' | 'cabelo';

installSvgDefs();

const shelf = document.querySelector<HTMLElement>('#prateleira')!;
const accessoriesPanel = document.querySelector<HTMLElement>('#acessorios')!;
const facePanel = document.querySelector<HTMLElement>('#rosto')!;
const stage = document.querySelector<HTMLElement>('#palco')!;
const cutPanel = document.querySelector<HTMLElement>('#cortes')!;
const btnUndo = document.querySelector<HTMLButtonElement>('#desfazer')!;
const btnClear = document.querySelector<HTMLButtonElement>('#tirar')!;

const mannequin = new Mannequin(stage);
const gigi = new Gigi(document.querySelector<HTMLElement>('#gigi')!);

let state: State = 'escolherTecido';
let currentFabric: Fabric | null = null;
let look: Look = {
  outfit: {},
  joias: {},
  rosto: 'oval',
  tracos: { olhos: 'nenhum', nariz: 'nenhum', boca: 'nenhum' },
  cabelo: 'nenhum',
  corCabelo: 'loiro',
};
const history: Look[] = [];

const COMPLIMENTS = [
  'Ficou lindo!',
  'Que arraso!',
  'Uau, que estilo!',
  'Perfeito! Você é uma ótima estilista!',
  'Maravilhoso!',
  'Que combinação incrível!',
];
const JEWEL_COMPLIMENTS = ['Que chique!', 'Brilhou!', 'Ficou um charme!', 'Que elegante!', 'Combinou demais!'];
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ---------- Abas (Tecidos / Acessórios / Rosto) ---------- */

const tabs = [...document.querySelectorAll<HTMLButtonElement>('.aba')];

function selectTab(tab: HTMLButtonElement, focus = false): void {
  for (const t of tabs) {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')!)!.hidden = !active;
  }
  if (focus) tab.focus();
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (ev) => {
    const dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    ev.preventDefault();
    selectTab(tabs[(i + dir + tabs.length) % tabs.length], true);
  });
});

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

/* ---------- Opções de acessórios e rosto ---------- */

interface OptionButton {
  button: HTMLButtonElement;
  svg?: SVGSVGElement;
  /** Se a opção está escolhida no look atual. */
  pressed: () => boolean;
  /** Redesenha a miniatura (ela muda com o rosto e a cor do cabelo). */
  draw?: () => { viewBox: string; markup: string };
}

const options: OptionButton[] = [];

function addGroup(panel: HTMLElement, title: string, extraClass = ''): HTMLElement {
  const group = document.createElement('div');
  group.className = 'grupo';
  group.innerHTML = `<h3>${title}</h3><div class="opcoes-lista ${extraClass}"></div>`;
  panel.append(group);
  return group.querySelector('.opcoes-lista')!;
}

function addOption(
  list: HTMLElement,
  label: string,
  opt: Omit<OptionButton, 'button' | 'svg'>,
  onClick: () => void,
  swatch?: string,
): void {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = swatch ? 'opcao opcao-cor' : 'opcao';
  if (swatch) {
    button.innerHTML = `<i style="background:${swatch}"></i><span>${label}</span>`;
  } else {
    button.innerHTML = `<svg aria-hidden="true"></svg><span>${label}</span>`;
  }
  button.addEventListener('click', onClick);
  list.append(button);
  options.push({ ...opt, button, svg: button.querySelector('svg') ?? undefined });
}

function hairPreview(styleId: string): { viewBox: string; markup: string } {
  const style = getHairStyle(styleId);
  const color = getHairColor(look.corCabelo);
  return {
    viewBox: '90 -6 120 170',
    markup:
      hairMarkup(style, color, 'back') +
      bodyMarkup(getFace(look.rosto)) +
      featuresMarkup(look.tracos) +
      hairMarkup(style, color, 'front'),
  };
}

/** Miniatura do rosto atual trocando só o traço desta opção. */
function featurePreview(kind: FeatureKind, id: string): { viewBox: string; markup: string } {
  return {
    viewBox: '120 40 60 50',
    markup: faceMarkup(getFace(look.rosto)) + featuresMarkup({ ...look.tracos, [kind]: id }),
  };
}

function jewelPreview(j: Jewel): { viewBox: string; markup: string } {
  const face = getFace(look.rosto);
  return { viewBox: JEWEL_PREVIEW[j.slot](face.ears), markup: bodyMarkup(face) + j.markup(face.ears) };
}

for (const { slot, name } of JEWEL_SLOTS) {
  const list = addGroup(accessoriesPanel, name);
  for (const j of JEWELS.filter((x) => x.slot === slot)) {
    addOption(list, j.name, { pressed: () => look.joias[slot] === j.id, draw: () => jewelPreview(j) }, () =>
      toggleJewel(j),
    );
  }
}

{
  const faces = addGroup(facePanel, 'Formato do rosto');
  for (const f of FACES) {
    addOption(
      faces,
      f.name,
      {
        pressed: () => look.rosto === f.id,
        draw: () => ({ viewBox: '112 20 76 80', markup: faceMarkup(f) + featuresMarkup(look.tracos) }),
      },
      () => chooseFace(f.id),
    );
  }
  for (const { kind, name } of FEATURE_KINDS) {
    const list = addGroup(facePanel, name);
    for (const feat of FEATURES.filter((x) => x.kind === kind)) {
      addOption(
        list,
        feat.name,
        { pressed: () => look.tracos[kind] === feat.id, draw: () => featurePreview(kind, feat.id) },
        () => chooseFeature(kind, feat.id),
      );
    }
  }
  const styles = addGroup(facePanel, 'Corte de cabelo');
  for (const h of HAIR_STYLES) {
    addOption(styles, h.name, { pressed: () => look.cabelo === h.id, draw: () => hairPreview(h.id) }, () =>
      chooseHair(h.id),
    );
  }
  const colors = addGroup(facePanel, 'Cor do cabelo', 'cores');
  for (const c of HAIR_COLORS) {
    addOption(colors, c.name, { pressed: () => look.corCabelo === c.id }, () => chooseHairColor(c.id), c.fill);
  }
}

function syncOptions(): void {
  for (const o of options) {
    o.button.setAttribute('aria-pressed', String(o.pressed()));
    o.button.disabled = state === 'cortando';
    if (o.svg && o.draw) {
      const { viewBox, markup } = o.draw();
      o.svg.setAttribute('viewBox', viewBox);
      o.svg.innerHTML = markup;
    }
  }
}

/* ---------- Look e histórico ---------- */

function applyLook(next: Look, changed?: Changed): void {
  look = next;
  mannequin.clearClothes();
  for (const [slot, piece] of Object.entries(look.outfit) as [Slot, { shape: Shape; fabric: Fabric }][]) {
    mannequin.wear(slot, piece.shape, piece.fabric, slot === changed);
  }
  const face = getFace(look.rosto);
  mannequin.setFace(face, changed === 'rosto');
  mannequin.setFeatures(featuresMarkup(look.tracos), changed === 'tracos');
  mannequin.setHair(getHairStyle(look.cabelo), getHairColor(look.corCabelo), changed === 'cabelo');
  for (const { slot } of JEWEL_SLOTS) {
    const id = look.joias[slot];
    mannequin.setJewel(slot, id ? getJewel(id) : undefined, face, slot === changed);
  }
}

/** Aplica uma mudança guardando o look anterior para o Desfazer. */
function commit(next: Look, changed?: Changed): void {
  history.push(look);
  applyLook(next, changed);
  setState(state);
}

function toggleJewel(j: Jewel): void {
  if (state === 'cortando') return;
  const joias = { ...look.joias };
  if (joias[j.slot] === j.id) {
    delete joias[j.slot];
    commit({ ...look, joias });
    gigi.say(`Tirei ${j.name.toLowerCase()}.`);
  } else {
    joias[j.slot] = j.id;
    commit({ ...look, joias }, j.slot);
    mannequin.sparkle();
    gigi.say(`${j.name}! ${pick(JEWEL_COMPLIMENTS)}`, true);
  }
}

function chooseFace(id: string): void {
  if (state === 'cortando' || look.rosto === id) return;
  commit({ ...look, rosto: id }, 'rosto');
  gigi.say(`Rosto ${getFace(id).name.toLowerCase()}! Agora escolha os olhos, o nariz e a boca.`);
}

const FEATURE_PHRASES: Record<FeatureKind, { removed: string; chosen: string }> = {
  olhos: { removed: 'os olhos', chosen: 'Que olhar lindo!' },
  nariz: { removed: 'o nariz', chosen: 'Que narizinho fofo!' },
  boca: { removed: 'a boca', chosen: 'Que expressão linda!' },
};

function chooseFeature(kind: FeatureKind, id: string): void {
  if (state === 'cortando' || look.tracos[kind] === id) return;
  commit({ ...look, tracos: { ...look.tracos, [kind]: id } }, 'tracos');
  const phrase = FEATURE_PHRASES[kind];
  if (id === 'nenhum') {
    gigi.say(`Tirei ${phrase.removed}.`);
  } else {
    gigi.say(`${getFeature(kind, id).name}! ${phrase.chosen}`, true);
  }
}

function chooseHair(id: string): void {
  if (state === 'cortando' || look.cabelo === id) return;
  commit({ ...look, cabelo: id }, 'cabelo');
  if (id === 'nenhum') {
    gigi.say('Sem cabelo: estilo manequim clássico!');
  } else {
    mannequin.sparkle();
    gigi.say(`Corte ${getHairStyle(id).name.toLowerCase()}! ${pick(COMPLIMENTS)}`, true);
  }
}

function chooseHairColor(id: string): void {
  if (state === 'cortando' || (look.corCabelo === id && look.cabelo !== 'nenhum')) return;
  // Sem cabelo não dá para ver a cor: coloca um corte longo junto.
  const cabelo = look.cabelo === 'nenhum' ? 'longo' : look.cabelo;
  commit({ ...look, corCabelo: id, cabelo }, 'cabelo');
  gigi.say(`Cabelo ${getHairColor(id).name.toLowerCase()}! Que lindo!`, true);
}

/* ---------- Fluxo do jogo ---------- */

function setState(next: State): void {
  state = next;
  document.body.dataset.estado = next;
  cutPanel.hidden = next !== 'escolherCorte';
  const hasPieces = Object.keys(look.outfit).length > 0 || Object.keys(look.joias).length > 0;
  btnUndo.disabled = history.length === 0 || next === 'cortando';
  btnClear.disabled = !hasPieces || next === 'cortando';
  syncOptions();
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

  const outfit: Outfit = { ...look.outfit };
  if (shape.slot === 'inteiro') {
    delete outfit.superior;
    delete outfit.inferior;
  } else if (shape.slot === 'superior' || shape.slot === 'inferior') {
    delete outfit.inteiro;
  }
  outfit[shape.slot] = { shape, fabric };
  currentFabric = null;
  state = 'escolherTecido';
  commit({ ...look, outfit }, shape.slot);

  mannequin.sparkle();
  gigi.say(`${pick(COMPLIMENTS)} Quer criar outra peça? Arraste mais um tecido ou escolha acessórios.`, true);
}

function article(s: Shape): string {
  return ['Blusa', 'Saia', 'Calça', 'Capa'].includes(s.name) ? 'a' : 'o';
}

btnUndo.addEventListener('click', () => {
  const prev = history.pop();
  if (!prev) return;
  applyLook(prev);
  setState(state);
  gigi.say('Pronto, desfiz a última mudança.');
});

btnClear.addEventListener('click', () => {
  commit({ ...look, outfit: {}, joias: {} });
  gigi.say('Manequim pronta para um novo look!');
});

applyLook(look);
setState('escolherTecido');
gigi.say('Oi, eu sou a Gigi! Arraste um tecido até a manequim, ou escolha acessórios e um penteado nas abas.');

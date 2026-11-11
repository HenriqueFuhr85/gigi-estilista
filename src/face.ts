/**
 * Formatos de rosto, cortes e cores de cabelo da manequim.
 * Coordenadas no mesmo sistema da manequim (viewBox 0 0 300 560);
 * a cabeça fica centrada em x=150, entre y≈28 (topo) e y≈88 (queixo).
 */

/** Pontos onde os brincos ficam pendurados (lado esquerdo e direito). */
export interface Ears {
  lx: number;
  rx: number;
  y: number;
}

export interface FaceShape {
  id: string;
  name: string;
  path: string;
  ears: Ears;
}

export interface HairStyle {
  id: string;
  name: string;
  /** Partes atrás da cabeça e do corpo. */
  back: string[];
  /** Partes na frente do rosto e dos ombros. */
  front: string[];
  /** Enfeites extras (elásticos, risca), desenhados por cima. */
  extras?: string;
}

export interface HairColor {
  id: string;
  name: string;
  fill: string;
  stroke: string;
}

const ellipse = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;
const circle = (cx: number, cy: number, r: number): string => ellipse(cx, cy, r, r);

export const FACES: FaceShape[] = [
  { id: 'oval', name: 'Oval', path: ellipse(150, 58, 26, 30), ears: { lx: 125, rx: 175, y: 66 } },
  { id: 'redondo', name: 'Redondo', path: ellipse(150, 60, 29, 28), ears: { lx: 122, rx: 178, y: 66 } },
  {
    id: 'coracao',
    name: 'Coração',
    path: 'M150,88 Q128,78 124,56 Q122,30 150,29 Q178,30 176,56 Q172,78 150,88 Z',
    ears: { lx: 126, rx: 174, y: 64 },
  },
  {
    id: 'quadrado',
    name: 'Quadrado',
    path: 'M125,42 Q125,28 150,28 Q175,28 175,42 L175,70 Q175,86 150,88 Q125,86 125,70 Z',
    ears: { lx: 125, rx: 175, y: 66 },
  },
  {
    id: 'diamante',
    name: 'Diamante',
    path: 'M150,28 Q168,34 176,56 Q170,78 150,88 Q130,78 124,56 Q132,34 150,28 Z',
    ears: { lx: 126, rx: 174, y: 62 },
  },
];

/** Topo de cabeça usado por vários cortes (com risca de lado ou no meio). */
const CAP_SIDE = 'M119,60 Q116,16 150,16 Q184,16 181,60 Q172,38 146,36 Q130,40 119,60 Z';
const CAP_CENTER = 'M120,58 Q116,17 150,17 Q184,17 180,58 Q174,36 150,33 Q126,36 120,58 Z';

function curlyBack(): string[] {
  const parts = [circle(150, 54, 38)];
  for (let deg = 130; deg <= 410; deg += 20) {
    const a = (deg * Math.PI) / 180;
    parts.push(circle(+(150 + 40 * Math.cos(a)).toFixed(1), +(54 + 38 * Math.sin(a)).toFixed(1), 15));
  }
  return parts;
}

function curlyFront(): string[] {
  const parts: string[] = [];
  for (let x = 127; x <= 173; x += 11.5) {
    const y = 33 + Math.abs(x - 150) * 0.18;
    parts.push(circle(+x.toFixed(1), +y.toFixed(1), 9));
  }
  parts.push(circle(121, 48, 8), circle(179, 48, 8));
  return parts;
}

function braid(side: -1 | 1): string[] {
  const parts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const cx = 150 + side * (29 + i * 0.6);
    parts.push(ellipse(+cx.toFixed(1), 66 + i * 11, 7, 7.5));
  }
  return parts;
}

export const HAIR_STYLES: HairStyle[] = [
  { id: 'nenhum', name: 'Sem cabelo', back: [], front: [] },
  {
    id: 'curtinho',
    name: 'Curtinho',
    back: [],
    front: ['M120,60 Q114,20 150,17 Q186,20 180,60 Q178,44 170,40 Q152,50 128,40 Q122,46 120,60 Z'],
  },
  {
    id: 'chanel',
    name: 'Chanel',
    back: ['M119,54 Q116,18 150,17 Q184,18 181,54 L184,92 Q170,98 150,94 Q130,98 116,92 Z'],
    front: [
      'M119,58 Q116,17 150,17 Q184,17 181,58 L177,46 Q150,40 123,46 Z',
      'M119,50 L116,92 Q124,96 130,92 L126,50 Z',
      'M181,50 L184,92 Q176,96 170,92 L174,50 Z',
    ],
  },
  {
    id: 'longo',
    name: 'Longo',
    back: ['M118,54 Q116,16 150,16 Q184,16 182,54 L190,160 Q150,172 110,160 Z'],
    front: [
      CAP_SIDE,
      'M119,54 Q112,104 116,156 Q126,162 134,154 Q126,112 128,70 Z',
      'M181,54 Q188,104 184,156 Q174,162 166,154 Q174,112 172,70 Z',
    ],
  },
  {
    id: 'rabo',
    name: 'Rabo de cavalo',
    back: ['M170,30 Q208,30 204,86 Q200,118 184,128 Q192,92 172,56 Z'],
    front: [CAP_CENTER],
    extras: `<circle cx="176" cy="34" r="5" fill="#ff4f93" stroke="#c2185b" stroke-width="1.5"/>`,
  },
  {
    id: 'coque',
    name: 'Coque',
    back: [circle(150, 13, 16)],
    front: [CAP_CENTER],
    extras: `<path d="M136,24 Q150,30 164,24" fill="none" stroke="#ff4f93" stroke-width="3.5" stroke-linecap="round"/>`,
  },
  { id: 'cacheado', name: 'Cacheado', back: curlyBack(), front: curlyFront() },
  {
    id: 'trancas',
    name: 'Tranças',
    back: [],
    front: [CAP_CENTER, ...braid(-1), ...braid(1)],
    extras: `
      <path d="M150,18 L150,33" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>
      <circle cx="118" cy="148" r="4" fill="#ff4f93" stroke="#c2185b" stroke-width="1.2"/>
      <circle cx="182" cy="148" r="4" fill="#ff4f93" stroke="#c2185b" stroke-width="1.2"/>`,
  },
];

export const HAIR_COLORS: HairColor[] = [
  { id: 'loiro', name: 'Loiro', fill: '#f2c94c', stroke: '#c9971f' },
  { id: 'castanho', name: 'Castanho', fill: '#8a5a35', stroke: '#5e3a1f' },
  { id: 'preto', name: 'Preto', fill: '#2f2838', stroke: '#17121c' },
  { id: 'ruivo', name: 'Ruivo', fill: '#e0703a', stroke: '#a84a1e' },
  { id: 'rosa', name: 'Rosa', fill: '#ff8cc6', stroke: '#d9589c' },
  { id: 'azul', name: 'Azul', fill: '#63a4ff', stroke: '#2f6fd1' },
  { id: 'lilas', name: 'Lilás', fill: '#b48cf2', stroke: '#7a52c4' },
];

/* ---------- Traços do rosto: olhos, nariz e boca ---------- */

export type FeatureKind = 'olhos' | 'nariz' | 'boca';

export interface FaceFeature {
  id: string;
  name: string;
  kind: FeatureKind;
  markup: string;
}

export const FEATURE_KINDS: { kind: FeatureKind; name: string }[] = [
  { kind: 'olhos', name: 'Olhos' },
  { kind: 'nariz', name: 'Nariz' },
  { kind: 'boca', name: 'Boca' },
];

const INK = '#2b1b3d';
const SKIN_LINE = '#c9926e';
const EYE_L = 139;
const EYE_R = 161;
const EYE_Y = 60;

const roundEye = (x: number): string =>
  `<ellipse cx="${x}" cy="${EYE_Y}" rx="3.2" ry="4" fill="${INK}"/>
   <circle cx="${x + 1}" cy="${EYE_Y - 1.5}" r="1.2" fill="#fff"/>`;
const closedEye = (x: number): string =>
  `<path d="M${x - 4},${EYE_Y + 1} Q${x},${EYE_Y - 3} ${x + 4},${EYE_Y + 1}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;
/** Cílios no canto de fora do olho (side -1 = esquerdo, 1 = direito). */
const lashes = (x: number, side: -1 | 1): string => {
  const o = side * 3;
  return `<path d="M${x + o},${EYE_Y - 2.5} l${side * 2.6},-2 M${x + o * 0.4},${EYE_Y - 3.6} l${side * 1.6},-2.6"
            fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
};
const bigEye = (x: number): string =>
  `<ellipse cx="${x}" cy="${EYE_Y}" rx="4.6" ry="5.6" fill="${INK}"/>
   <ellipse cx="${x}" cy="${EYE_Y + 2}" rx="3" ry="2.4" fill="#7a3fd1"/>
   <circle cx="${x - 1.4}" cy="${EYE_Y - 2}" r="1.8" fill="#fff"/>
   <circle cx="${x + 1.6}" cy="${EYE_Y + 1.8}" r=".9" fill="#fff"/>`;

export const FEATURES: FaceFeature[] = [
  { id: 'nenhum', name: 'Nenhum', kind: 'olhos', markup: '' },
  { id: 'redondos', name: 'Redondinhos', kind: 'olhos', markup: roundEye(EYE_L) + roundEye(EYE_R) },
  {
    id: 'cilios',
    name: 'Com cílios',
    kind: 'olhos',
    markup: roundEye(EYE_L) + roundEye(EYE_R) + lashes(EYE_L, -1) + lashes(EYE_R, 1),
  },
  { id: 'brilhantes', name: 'Brilhantes', kind: 'olhos', markup: bigEye(EYE_L) + bigEye(EYE_R) },
  { id: 'fechados', name: 'Fechadinhos', kind: 'olhos', markup: closedEye(EYE_L) + closedEye(EYE_R) },
  {
    id: 'piscadinha',
    name: 'Piscadinha',
    kind: 'olhos',
    markup: roundEye(EYE_L) + lashes(EYE_L, -1) + closedEye(EYE_R),
  },

  { id: 'nenhum', name: 'Nenhum', kind: 'nariz', markup: '' },
  { id: 'pontinho', name: 'Pontinho', kind: 'nariz', markup: `<circle cx="150" cy="70" r="1.4" fill="${SKIN_LINE}"/>` },
  {
    id: 'botao',
    name: 'Botãozinho',
    kind: 'nariz',
    markup: `<path d="M147,70.5 Q150,74 153,70.5" fill="none" stroke="${SKIN_LINE}" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  {
    id: 'arrebitado',
    name: 'Arrebitado',
    kind: 'nariz',
    markup: `<path d="M150,63 L148,71 Q150,73.5 152.5,71" fill="none" stroke="${SKIN_LINE}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'redondinho',
    name: 'Redondinho',
    kind: 'nariz',
    markup: `<ellipse cx="150" cy="70" rx="3" ry="2.4" fill="#efc0a0"/>
             <circle cx="149" cy="69.2" r=".8" fill="#fff" opacity=".7"/>`,
  },

  { id: 'nenhum', name: 'Nenhuma', kind: 'boca', markup: '' },
  {
    id: 'sorriso',
    name: 'Sorriso',
    kind: 'boca',
    markup: `<path d="M144,78 Q150,83 156,78" fill="none" stroke="#c2185b" stroke-width="2" stroke-linecap="round"/>`,
  },
  {
    id: 'sorrisao',
    name: 'Sorrisão',
    kind: 'boca',
    markup: `<path d="M143,77 Q150,87 157,77 Z" fill="#a3164d" stroke="#a3164d" stroke-width="1" stroke-linejoin="round"/>
             <path d="M144.6,77.6 L155.4,77.6 Q154.8,79.4 150,79.6 Q145.2,79.4 144.6,77.6 Z" fill="#fff"/>
             <path d="M146.5,81.8 Q150,80 153.5,81.8 Q150,84.4 146.5,81.8 Z" fill="#ff7eb6"/>`,
  },
  {
    id: 'batom',
    name: 'Batom',
    kind: 'boca',
    markup: `<path d="M143,78 Q146.5,74.6 150,76.8 Q153.5,74.6 157,78 Q150,79.6 143,78 Z" fill="#e8343f" stroke="#9b1b24" stroke-width=".8" stroke-linejoin="round"/>
             <path d="M143,78 Q150,79.6 157,78 Q150,84.6 143,78 Z" fill="#e8343f" stroke="#9b1b24" stroke-width=".8" stroke-linejoin="round"/>
             <path d="M147,80.6 Q150,81.6 152,80.8" fill="none" stroke="#fff" stroke-width=".9" opacity=".6" stroke-linecap="round"/>`,
  },
  {
    id: 'biquinho',
    name: 'Biquinho',
    kind: 'boca',
    markup: `<path d="M150,82 C146,79.5 146.8,76 150,77.6 C153.2,76 154,79.5 150,82 Z" fill="#ff5c9d" stroke="#c2185b" stroke-width=".8"/>`,
  },
  {
    id: 'surpresa',
    name: 'Surpresa',
    kind: 'boca',
    markup: `<ellipse cx="150" cy="79" rx="2.6" ry="3.4" fill="#8b1e4a"/>`,
  },
];

export const getFeature = (kind: FeatureKind, id: string): FaceFeature =>
  FEATURES.find((f) => f.kind === kind && f.id === id) ?? FEATURES.find((f) => f.kind === kind)!;

/** Olhos, nariz e boca juntos, desenhados por cima da cabeça. */
export function featuresMarkup(sel: Record<FeatureKind, string>): string {
  return FEATURE_KINDS.map(({ kind }) => getFeature(kind, sel[kind]).markup).join('');
}

export const getFace = (id: string): FaceShape => FACES.find((f) => f.id === id) ?? FACES[0];
export const getHairStyle = (id: string): HairStyle => HAIR_STYLES.find((h) => h.id === id) ?? HAIR_STYLES[0];
export const getHairColor = (id: string): HairColor => HAIR_COLORS.find((c) => c.id === id) ?? HAIR_COLORS[0];

export function faceMarkup(face: FaceShape): string {
  return `<path d="${face.path}" fill="url(#pele-manequim)"/>`;
}

/**
 * Desenha uma parte do cabelo. Primeiro um contorno grosso escuro e depois o
 * preenchimento por cima, para que só a borda externa do conjunto apareça.
 */
export function hairMarkup(style: HairStyle, color: HairColor, part: 'back' | 'front'): string {
  const paths = style[part];
  if (paths.length === 0) return '';
  const outline = paths.map((d) => `<path d="${d}" fill="${color.stroke}" stroke="${color.stroke}" stroke-width="4" stroke-linejoin="round"/>`).join('');
  const fill = paths.map((d) => `<path d="${d}" fill="${color.fill}"/>`).join('');
  let extra = '';
  if (part === 'front') {
    extra = `<path d="M132,26 Q150,19 168,26" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
    extra += style.extras ?? '';
  }
  return outline + fill + extra;
}

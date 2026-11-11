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

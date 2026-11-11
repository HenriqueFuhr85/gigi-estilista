/**
 * Joias e bijuterias: brincos, colares e pulseiras.
 * Coordenadas no sistema da manequim (viewBox 0 0 300 560).
 */
import type { Ears } from './face';

export type JewelSlot = 'brincos' | 'colar' | 'pulseiras';

export interface Jewel {
  id: string;
  name: string;
  slot: JewelSlot;
  /** Marcação SVG da peça, posicionada conforme as orelhas do rosto atual. */
  markup: (ears: Ears) => string;
}

export const JEWEL_SLOTS: { slot: JewelSlot; name: string }[] = [
  { slot: 'brincos', name: 'Brincos' },
  { slot: 'colar', name: 'Colares' },
  { slot: 'pulseiras', name: 'Pulseiras' },
];

const OURO = { fill: '#f5c542', stroke: '#b8860b' };
const PRATA = { fill: '#e3e8ef', stroke: '#8a94a3' };
const ROSA = { fill: '#ff7eb6', stroke: '#c2185b' };
const PEROLA = { fill: '#fffaf2', stroke: '#cdbca5' };
const MICANGAS = ['#ff4f93', '#ffd23f', '#38d1b8', '#7a3fd1', '#3d7bf2', '#ff8a3d'];

type Pt = [number, number];

/** Pontos ao longo de uma curva quadrática. */
function along(p0: Pt, c: Pt, p2: Pt, n: number, t0 = 0, t1 = 1): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? (t0 + t1) / 2 : t0 + ((t1 - t0) * i) / (n - 1);
    const u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1]]);
  }
  return pts;
}

const bead = ([x, y]: Pt, r: number, fill: string, stroke: string): string =>
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="0.8"/>`;

const shine = (x: number, y: number, r: number): string =>
  `<circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.35).toFixed(1)}" r="${(r * 0.35).toFixed(1)}" fill="#fff" opacity=".8"/>`;

function heart(cx: number, cy: number, s: number, c: { fill: string; stroke: string }): string {
  return `<path d="M${cx},${cy + s * 0.9} C${cx - s * 1.4},${cy - s * 0.1} ${cx - s * 0.7},${cy - s * 1.1} ${cx},${cy - s * 0.35} C${cx + s * 0.7},${cy - s * 1.1} ${cx + s * 1.4},${cy - s * 0.1} ${cx},${cy + s * 0.9} Z" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1" stroke-linejoin="round"/>`;
}

function star(cx: number, cy: number, r: number, c: { fill: string; stroke: string }): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${c.fill}" stroke="${c.stroke}" stroke-width="1" stroke-linejoin="round"/>`;
}

const bothEars = (ears: Ears, one: (x: number, y: number) => string): string => one(ears.lx, ears.y) + one(ears.rx, ears.y);

/* ---------- Colares: fio que contorna a base do pescoço ---------- */
const NECK_L: Pt = [140, 100];
const NECK_R: Pt = [160, 100];
const chain = (c: Pt, color: string, w = 1.4): string =>
  `<path d="M${NECK_L[0]},${NECK_L[1]} Q${c[0]},${c[1]} ${NECK_R[0]},${NECK_R[1]}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

/* ---------- Pulseiras: arco na frente de cada pulso ---------- */
const WRISTS: Pt[] = [
  [83, 262],
  [217, 262],
];
const WRIST_R = 10.5;
const wristArc = ([x, y]: Pt): [Pt, Pt, Pt] => [
  [x - WRIST_R, y - 1],
  [x, y + 8],
  [x + WRIST_R, y - 1],
];
const bothWrists = (one: (w: Pt) => string): string => WRISTS.map(one).join('');
const band = (w: Pt, color: { fill: string; stroke: string }, width = 3.5): string => {
  const [a, c, b] = wristArc(w);
  const d = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  return `<path d="${d}" fill="none" stroke="${color.stroke}" stroke-width="${width + 1.6}" stroke-linecap="round"/>
          <path d="${d}" fill="none" stroke="${color.fill}" stroke-width="${width}" stroke-linecap="round"/>`;
};

export const JEWELS: Jewel[] = [
  /* Brincos */
  {
    id: 'argolas',
    name: 'Argolas douradas',
    slot: 'brincos',
    markup: (e) =>
      bothEars(
        e,
        (x, y) => `<circle cx="${x}" cy="${y + 6}" r="6" fill="none" stroke="${OURO.stroke}" stroke-width="3.4"/>
                   <circle cx="${x}" cy="${y + 6}" r="6" fill="none" stroke="${OURO.fill}" stroke-width="2"/>`,
      ),
  },
  {
    id: 'perolas',
    name: 'Brincos de pérola',
    slot: 'brincos',
    markup: (e) =>
      bothEars(
        e,
        (x, y) =>
          `<circle cx="${x}" cy="${y}" r="1.8" fill="${OURO.fill}" stroke="${OURO.stroke}" stroke-width=".6"/>
           <path d="M${x},${y + 1.5} L${x},${y + 4}" stroke="${OURO.stroke}" stroke-width="1"/>
           ${bead([x, y + 8], 4, PEROLA.fill, PEROLA.stroke)}${shine(x, y + 8, 4)}`,
      ),
  },
  {
    id: 'estrelas',
    name: 'Estrelinhas de prata',
    slot: 'brincos',
    markup: (e) => bothEars(e, (x, y) => star(x, y + 5, 5.5, PRATA)),
  },
  {
    id: 'coracoes',
    name: 'Coraçõezinhos',
    slot: 'brincos',
    markup: (e) =>
      bothEars(e, (x, y) => `<path d="M${x},${y} L${x},${y + 3}" stroke="${OURO.stroke}" stroke-width="1"/>${heart(x, y + 7, 4.5, ROSA)}`),
  },
  {
    id: 'cristais',
    name: 'Cristais azuis',
    slot: 'brincos',
    markup: (e) =>
      bothEars(
        e,
        (x, y) =>
          `<path d="M${x},${y} L${x + 4},${y + 7} L${x},${y + 16} L${x - 4},${y + 7} Z" fill="#8fd3ff" stroke="#2f6fd1" stroke-width="1" stroke-linejoin="round"/>
           <path d="M${x},${y + 2} L${x + 1.5},${y + 7} L${x},${y + 11}" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>`,
      ),
  },

  /* Colares */
  {
    id: 'colar-perolas',
    name: 'Colar de pérolas',
    slot: 'colar',
    markup: () => along(NECK_L, [150, 132], NECK_R, 11).map((p) => bead(p, 2.6, PEROLA.fill, PEROLA.stroke)).join(''),
  },
  {
    id: 'colar-coracao',
    name: 'Pingente de coração',
    slot: 'colar',
    markup: () => chain([150, 128], OURO.stroke) + heart(150, 119, 5.5, { fill: '#e8343f', stroke: '#9b1b24' }),
  },
  {
    id: 'colar-estrela',
    name: 'Pingente de estrela',
    slot: 'colar',
    markup: () => chain([150, 128], PRATA.stroke) + star(150, 120, 6.5, OURO),
  },
  {
    id: 'gargantilha',
    name: 'Gargantilha',
    slot: 'colar',
    markup: () =>
      `<path d="M140,94 Q150,98 160,94" fill="none" stroke="#3b1f4f" stroke-width="4" stroke-linecap="round"/>
       <circle cx="150" cy="97.5" r="2.6" fill="#ff7eb6" stroke="#c2185b" stroke-width=".8"/>`,
  },
  {
    id: 'colar-micangas',
    name: 'Colar de miçangas',
    slot: 'colar',
    markup: () =>
      along(NECK_L, [150, 140], NECK_R, 13)
        .map((p, i) => bead(p, 2.5, MICANGAS[i % MICANGAS.length], 'rgba(0,0,0,.25)'))
        .join(''),
  },

  /* Pulseiras */
  {
    id: 'pulseira-ouro',
    name: 'Pulseiras douradas',
    slot: 'pulseiras',
    markup: () => bothWrists((w) => band(w, OURO)),
  },
  {
    id: 'pulseira-prata',
    name: 'Prata com pingente',
    slot: 'pulseiras',
    markup: () => bothWrists((w) => band(w, PRATA, 2.2) + heart(w[0], w[1] + 8.5, 3, ROSA)),
  },
  {
    id: 'pulseira-micangas',
    name: 'Pulseiras de miçangas',
    slot: 'pulseiras',
    markup: () =>
      bothWrists((w) => {
        const [a, c, b] = wristArc(w);
        return along(a, c, b, 6)
          .map((p, i) => bead(p, 2.4, MICANGAS[i % MICANGAS.length], 'rgba(0,0,0,.25)'))
          .join('');
      }),
  },
  {
    id: 'pulseira-perolas',
    name: 'Pulseiras de pérola',
    slot: 'pulseiras',
    markup: () =>
      bothWrists((w) => {
        const [a, c, b] = wristArc(w);
        return along(a, c, b, 6).map((p) => bead(p, 2.4, PEROLA.fill, PEROLA.stroke)).join('');
      }),
  },
  {
    id: 'relogio',
    name: 'Relógio rosa',
    slot: 'pulseiras',
    markup: () => {
      const [x, y] = WRISTS[0];
      return (
        band(WRISTS[0], ROSA, 3) +
        `<circle cx="${x}" cy="${y + 3.5}" r="4.6" fill="#fff" stroke="${ROSA.stroke}" stroke-width="1.6"/>
         <path d="M${x},${y + 3.5} L${x},${y + 1} M${x},${y + 3.5} L${x + 2},${y + 4.5}" stroke="#3b1f4f" stroke-width=".9" stroke-linecap="round"/>` +
        band(WRISTS[1], OURO, 2.6)
      );
    },
  },
];

export const getJewel = (id: string): Jewel | undefined => JEWELS.find((j) => j.id === id);

/** Recorte da manequim usado na miniatura de cada tipo de joia. */
export const JEWEL_PREVIEW: Record<JewelSlot, (ears: Ears) => string> = {
  brincos: (e) => `${e.lx - 13} ${e.y - 6} 26 26`,
  colar: () => '134 88 32 38',
  pulseiras: () => `${WRISTS[0][0] - 15} ${WRISTS[0][1] - 13} 30 30`,
};

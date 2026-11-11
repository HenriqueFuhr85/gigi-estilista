import { fabricFill, type Fabric } from './fabrics';
import type { Shape, Slot } from './shapes';
import type { Jewel, JewelSlot } from './accessories';
import { faceMarkup, hairMarkup, type FaceShape, type HairColor, type HairStyle } from './face';

const NS = 'http://www.w3.org/2000/svg';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Layer = Slot | JewelSlot | 'cabelo-tras' | 'cabeca' | 'cabelo-frente';

/** Ordem de desenho, de trás para a frente. 'corpo' marca onde entra o corpo. */
const LAYER_ORDER: (Layer | 'corpo')[] = [
  'capa',
  'cabelo-tras',
  'corpo',
  'cabeca',
  'inferior',
  'inteiro',
  'superior',
  'cabelo-frente',
  'acessorio',
  'colar',
  'pulseiras',
  'brincos',
];
const CLOTHES: Slot[] = ['capa', 'inferior', 'inteiro', 'superior', 'acessorio'];

const BODY = `
  <g class="manequim-corpo">
    <ellipse cx="150" cy="540" rx="70" ry="12" fill="#c9b8d8"/>
    <rect x="146" y="508" width="8" height="32" fill="#a993bd"/>
    <!-- braços -->
    <path d="M103,114 Q86,120 85,140 L73,270 Q71,284 82,285 Q91,285 91,272 L104,160 Z" fill="url(#pele-manequim)"/>
    <path d="M197,114 Q214,120 215,140 L227,270 Q229,284 218,285 Q209,285 209,272 L196,160 Z" fill="url(#pele-manequim)"/>
    <!-- pernas -->
    <path d="M113,270 L148,270 L146,500 Q146,512 136,512 L127,512 Q119,512 120,500 Z" fill="url(#pele-manequim)"/>
    <path d="M187,270 L152,270 L154,500 Q154,512 164,512 L173,512 Q181,512 180,500 Z" fill="url(#pele-manequim)"/>
    <!-- tronco -->
    <path d="M104,112 Q150,98 196,112 L201,130 Q187,170 177,214 Q191,244 190,276 L110,276 Q109,244 123,214 Q113,170 99,130 Z" fill="url(#pele-manequim)"/>
    <!-- pescoço (a cabeça fica em uma camada própria) -->
    <rect x="140" y="84" width="20" height="24" rx="6" fill="url(#pele-manequim)"/>
    <path d="M116,214 Q150,222 184,214" fill="none" stroke="#d8b996" stroke-width="1.5" stroke-dasharray="4 4"/>
  </g>`;

const DRAPE_PATH =
  'M80,96 Q150,82 220,96 L238,382 Q216,398 194,384 Q172,400 150,386 Q128,400 106,384 Q84,398 62,382 Z';

const SCISSORS = `
  <g class="tesoura">
    <circle cx="-14" cy="-7" r="6" fill="none" stroke="#ff4f93" stroke-width="3.5"/>
    <circle cx="-14" cy="7" r="6" fill="none" stroke="#ff4f93" stroke-width="3.5"/>
    <path d="M-9,-4 L16,3 M-9,4 L16,-3" stroke="#6b7280" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="0" cy="0" r="1.8" fill="#374151"/>
  </g>`;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string> = {}): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** Marcação SVG de uma peça pronta, preenchida com o tecido. */
export function garmentMarkup(shape: Shape, fabric: Fabric): string {
  const fill = fabricFill(fabric);
  const body = shape.paths
    .map(
      (d) => `<path d="${d}" fill="${fill}" stroke="rgba(40,20,60,.35)" stroke-width="2" stroke-linejoin="round"/>
              <path d="${d}" fill="url(#dobra)" pointer-events="none"/>`,
    )
    .join('');
  const details = (shape.details ?? [])
    .map(
      (d) =>
        `<path d="${d}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.6" stroke-dasharray="4 3" stroke-linecap="round"/>`,
    )
    .join('');
  return body + details;
}

/** Corpo da manequim com a cabeça no formato indicado (usado nas miniaturas). */
export function bodyMarkup(face: FaceShape): string {
  return BODY + faceMarkup(face);
}

export class Mannequin {
  readonly svg: SVGSVGElement;
  private layers = new Map<Layer, SVGGElement>();
  private drapeLayer: SVGGElement;

  constructor(container: HTMLElement) {
    this.svg = el('svg', {
      viewBox: '0 0 300 560',
      class: 'manequim',
      role: 'img',
      'aria-label': 'Manequim',
    });
    for (const name of LAYER_ORDER) {
      if (name === 'corpo') {
        this.svg.insertAdjacentHTML('beforeend', BODY);
        continue;
      }
      const g = el('g', { 'data-camada': name });
      this.svg.append(g);
      this.layers.set(name, g);
    }
    this.drapeLayer = el('g', { class: 'drape-layer' });
    this.svg.append(this.drapeLayer);
    container.append(this.svg);
  }

  /** Veste a peça no slot indicado (substitui o que houver nele). */
  wear(slot: Slot, shape: Shape, fabric: Fabric, animate = true): void {
    const layer = this.layers.get(slot)!;
    layer.innerHTML = '';
    const g = el('g', { class: animate ? 'peca peca-nova' : 'peca' });
    g.innerHTML = garmentMarkup(shape, fabric);
    layer.append(g);
  }

  clear(layer: Layer): void {
    this.layers.get(layer)!.innerHTML = '';
  }

  /** Tira todas as roupas (rosto, cabelo e joias ficam). */
  clearClothes(): void {
    for (const slot of CLOTHES) this.clear(slot);
  }

  /** Coloca uma joia (ou tira, se `jewel` for undefined). */
  setJewel(slot: JewelSlot, jewel: Jewel | undefined, face: FaceShape, animate = false): void {
    const layer = this.layers.get(slot)!;
    layer.innerHTML = '';
    if (!jewel) return;
    const g = el('g', { class: animate ? 'peca peca-nova' : 'peca' });
    g.innerHTML = jewel.markup(face.ears);
    layer.append(g);
  }

  setFace(face: FaceShape, animate = false): void {
    const layer = this.layers.get('cabeca')!;
    layer.innerHTML = `<g class="${animate ? 'peca peca-nova' : 'peca'}">${faceMarkup(face)}</g>`;
  }

  setHair(style: HairStyle, color: HairColor, animate = false): void {
    const parts = [
      ['cabelo-tras', 'back'],
      ['cabelo-frente', 'front'],
    ] as const;
    for (const [layer, part] of parts) {
      const markup = hairMarkup(style, color, part);
      this.layers.get(layer)!.innerHTML = markup
        ? `<g class="${animate ? 'peca peca-nova' : 'peca'}">${markup}</g>`
        : '';
    }
  }

  /** Mostra o tecido escolhido pendurado sobre a manequim. */
  showDrape(fabric: Fabric): void {
    this.drapeLayer.innerHTML = '';
    const g = el('g', { class: 'drape drape-entrando' });
    g.innerHTML = `
      <path d="${DRAPE_PATH}" fill="${fabricFill(fabric)}" stroke="rgba(40,20,60,.3)" stroke-width="2"/>
      <path d="${DRAPE_PATH}" fill="url(#dobra)"/>
      <path d="M96,100 L90,370 M150,92 L150,380 M204,100 L210,370" stroke="rgba(0,0,0,.08)" stroke-width="6" fill="none"/>`;
    this.drapeLayer.append(g);
  }

  hideDrape(): void {
    this.drapeLayer.innerHTML = '';
  }

  /** Anima a tesoura cortando o molde sobre o tecido. Resolve ao final. */
  cut(shape: Shape): Promise<void> {
    const duration = reduceMotion ? 250 : 1500;
    const guide = el('g', { class: 'molde-guia' });
    for (const d of shape.paths) {
      guide.append(
        el('path', {
          d,
          fill: 'rgba(255,255,255,.18)',
          stroke: '#ffffff',
          'stroke-width': '3',
          'stroke-dasharray': '7 6',
        }),
      );
    }
    const cutLine = el('path', {
      d: shape.paths[0],
      fill: 'none',
      stroke: '#2b1b3d',
      'stroke-width': '3',
      'stroke-linejoin': 'round',
    });
    guide.append(cutLine);
    this.drapeLayer.append(guide);

    const scissors = el('g');
    scissors.innerHTML = SCISSORS;
    this.drapeLayer.append(scissors);

    const length = cutLine.getTotalLength();
    cutLine.style.strokeDasharray = `${length}`;
    cutLine.style.strokeDashoffset = `${length}`;

    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const at = length * t;
        const p = cutLine.getPointAtLength(at);
        const q = cutLine.getPointAtLength(Math.min(length, at + 1));
        const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        scissors.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${angle}) scale(1.3)`);
        cutLine.style.strokeDashoffset = `${length - at}`;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          this.drapeLayer.classList.add('drape-saindo');
          window.setTimeout(
            () => {
              this.drapeLayer.classList.remove('drape-saindo');
              this.hideDrape();
              resolve();
            },
            reduceMotion ? 0 : 280,
          );
        }
      };
      requestAnimationFrame(step);
    });
  }

  /** Pequena explosão de brilhos sobre a manequim. */
  sparkle(): void {
    if (reduceMotion) return;
    const g = el('g', { class: 'brilhos' });
    for (let i = 0; i < 14; i++) {
      const x = 60 + Math.random() * 180;
      const y = 60 + Math.random() * 380;
      const s = 6 + Math.random() * 8;
      const star = el('path', {
        d: `M${x},${y - s} L${x + s * 0.3},${y - s * 0.3} L${x + s},${y} L${x + s * 0.3},${y + s * 0.3} L${x},${y + s} L${x - s * 0.3},${y + s * 0.3} L${x - s},${y} L${x - s * 0.3},${y - s * 0.3} Z`,
        fill: i % 2 ? '#ffd23f' : '#ffffff',
        style: `animation-delay:${(Math.random() * 0.4).toFixed(2)}s; transform-origin:${x}px ${y}px`,
      });
      g.append(star);
    }
    this.svg.append(g);
    window.setTimeout(() => g.remove(), 1400);
  }
}

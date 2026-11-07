import { FABRICS, type Fabric } from './fabrics';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Gerador pseudoaleatório determinístico, para o glitter ficar sempre igual. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function shimmer(f: Fabric): string {
  const anim = reduceMotion
    ? ''
    : `<animateTransform attributeName="gradientTransform" type="translate" from="0 0" to="120 120" dur="2.6s" repeatCount="indefinite"/>`;
  return `
  <linearGradient id="fab-${f.id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="60" spreadMethod="reflect">
    <stop offset="0" stop-color="${f.base}"/>
    <stop offset="0.42" stop-color="${f.base}"/>
    <stop offset="0.5" stop-color="${f.accent}"/>
    <stop offset="0.58" stop-color="${f.base}"/>
    <stop offset="1" stop-color="${f.base}"/>
    ${anim}
  </linearGradient>`;
}

function glitter(f: Fabric, seed: number): string {
  const r = rng(seed);
  const size = 28;
  let dots = '';
  for (let i = 0; i < 9; i++) {
    const x = (r() * size).toFixed(1);
    const y = (r() * size).toFixed(1);
    const rad = (0.6 + r() * 1.2).toFixed(1);
    const dur = (1 + r() * 1.6).toFixed(2);
    const begin = (r() * 2).toFixed(2);
    const anim = reduceMotion
      ? ''
      : `<animate attributeName="opacity" values="0.15;1;0.15" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
    dots += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${f.accent}">${anim}</circle>`;
  }
  return `
  <pattern id="fab-${f.id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${f.base}"/>
    ${dots}
  </pattern>`;
}

function dotsPattern(f: Fabric): string {
  return `
  <pattern id="fab-${f.id}" patternUnits="userSpaceOnUse" width="22" height="22">
    <rect width="22" height="22" fill="${f.base}"/>
    <circle cx="5.5" cy="5.5" r="3.4" fill="${f.accent}"/>
    <circle cx="16.5" cy="16.5" r="3.4" fill="${f.accent}"/>
  </pattern>`;
}

function stripes(f: Fabric): string {
  return `
  <pattern id="fab-${f.id}" patternUnits="userSpaceOnUse" width="18" height="18" patternTransform="rotate(0)">
    <rect width="18" height="18" fill="${f.base}"/>
    <rect y="0" width="18" height="6" fill="${f.accent}"/>
  </pattern>`;
}

function solid(f: Fabric): string {
  return `
  <linearGradient id="fab-${f.id}" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${f.base}"/>
    <stop offset="1" stop-color="${f.base}"/>
  </linearGradient>`;
}

/** Injeta no documento um SVG oculto com todos os padrões de tecido e gradientes globais. */
export function installSvgDefs(): void {
  const parts = FABRICS.map((f, i) => {
    switch (f.kind) {
      case 'brilho':
        return shimmer(f);
      case 'glitter':
        return glitter(f, 97 + i * 31);
      case 'bolinhas':
        return dotsPattern(f);
      case 'listras':
        return stripes(f);
      default:
        return solid(f);
    }
  }).join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    ${parts}
    <linearGradient id="dobra" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.22"/>
      <stop offset="0.25" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.18"/>
      <stop offset="0.75" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
    </linearGradient>
    <linearGradient id="pele-manequim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e9cfb3"/>
      <stop offset="0.5" stop-color="#f6e4d0"/>
      <stop offset="1" stop-color="#e2c3a3"/>
    </linearGradient>
    <linearGradient id="rolo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0.28"/>
      <stop offset="0.35" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.32"/>
    </linearGradient>
  </defs>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
}

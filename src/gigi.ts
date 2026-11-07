/** Gigi: menina loira de 9 anos, estilista. Arte original em SVG. */
const GIGI_SVG = `
<svg viewBox="0 0 200 270" class="gigi-svg" role="img" aria-label="Gigi, a estilista">
  <!-- rabo de cavalo (atrás) -->
  <path d="M146,58 Q186,64 182,120 Q178,150 160,160 Q170,124 150,96 Z" fill="#f2c94c" stroke="#d9a92b" stroke-width="2"/>
  <!-- cabelo de trás -->
  <path d="M52,80 Q50,22 100,18 Q152,20 150,82 L150,118 Q100,128 52,118 Z" fill="#f2c94c" stroke="#d9a92b" stroke-width="2"/>
  <!-- pescoço -->
  <rect x="90" y="120" width="20" height="20" rx="6" fill="#f6d2b8"/>
  <!-- vestido -->
  <path d="M70,140 Q100,130 130,140 L150,236 Q100,248 50,236 Z" fill="#ff7eb6" stroke="#e05a97" stroke-width="2"/>
  <path d="M56,226 Q100,238 144,226" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>
  <!-- fita métrica -->
  <path d="M84,138 Q80,170 76,196" fill="none" stroke="#ffd23f" stroke-width="7" stroke-linecap="round"/>
  <path d="M116,138 Q120,170 124,196" fill="none" stroke="#ffd23f" stroke-width="7" stroke-linecap="round"/>
  <path d="M84,140 Q80,170 76,196 M116,140 Q120,170 124,196" fill="none" stroke="#b7791f" stroke-width="7" stroke-dasharray="1 5"/>
  <!-- braços -->
  <path d="M72,146 Q52,170 54,206" fill="none" stroke="#f6d2b8" stroke-width="13" stroke-linecap="round"/>
  <path d="M128,146 Q154,156 162,128" fill="none" stroke="#f6d2b8" stroke-width="13" stroke-linecap="round" class="gigi-braco"/>
  <!-- pernas e sapatos -->
  <rect x="78" y="240" width="13" height="20" fill="#f6d2b8"/>
  <rect x="109" y="240" width="13" height="20" fill="#f6d2b8"/>
  <ellipse cx="84" cy="262" rx="13" ry="6" fill="#7a3fd1"/>
  <ellipse cx="116" cy="262" rx="13" ry="6" fill="#7a3fd1"/>
  <!-- rosto -->
  <ellipse cx="100" cy="82" rx="40" ry="42" fill="#f6d2b8"/>
  <!-- franja -->
  <path d="M58,76 Q60,34 100,32 Q142,34 142,76 Q128,58 112,56 Q104,66 92,58 Q76,62 58,76 Z" fill="#f2c94c" stroke="#d9a92b" stroke-width="2"/>
  <!-- prendedor -->
  <circle cx="142" cy="60" r="7" fill="#ff7eb6" stroke="#e05a97" stroke-width="2"/>
  <!-- olhos -->
  <g class="gigi-olhos">
    <ellipse cx="85" cy="86" rx="6" ry="7.5" fill="#2b1b3d"/>
    <ellipse cx="115" cy="86" rx="6" ry="7.5" fill="#2b1b3d"/>
    <circle cx="87" cy="83" r="2.2" fill="#fff"/>
    <circle cx="117" cy="83" r="2.2" fill="#fff"/>
  </g>
  <!-- bochechas e sorriso -->
  <ellipse cx="74" cy="100" rx="7" ry="4.5" fill="#ff9fc2" opacity=".7"/>
  <ellipse cx="126" cy="100" rx="7" ry="4.5" fill="#ff9fc2" opacity=".7"/>
  <path d="M88,104 Q100,116 112,104" fill="none" stroke="#c2185b" stroke-width="3" stroke-linecap="round"/>
</svg>`;

export class Gigi {
  private bubble: HTMLElement;
  private figure: HTMLElement;

  constructor(container: HTMLElement) {
    container.innerHTML = `
      <div class="gigi-balao" role="status" aria-live="polite"></div>
      <div class="gigi-figura">${GIGI_SVG}</div>`;
    this.bubble = container.querySelector('.gigi-balao')!;
    this.figure = container.querySelector('.gigi-figura')!;
  }

  say(text: string, celebrate = false): void {
    this.bubble.textContent = text;
    this.bubble.classList.remove('balao-pop');
    void this.bubble.offsetWidth; // reinicia a animação
    this.bubble.classList.add('balao-pop');
    this.figure.classList.toggle('gigi-feliz', celebrate);
    if (celebrate) window.setTimeout(() => this.figure.classList.remove('gigi-feliz'), 1200);
  }
}

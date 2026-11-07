export interface DragOptions {
  /** Elemento que serve de alvo para soltar. */
  target: () => HTMLElement;
  /** Se o arraste está permitido no momento. */
  enabled: () => boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  /** Chamado quando o item é solto sobre o alvo (ou tocado sem arrastar). */
  onDrop: () => void;
}

const TAP_TOLERANCE = 6;

/** Torna um elemento arrastável com Pointer Events (mouse e toque). */
export function makeDraggable(source: HTMLElement, opts: DragOptions): void {
  source.addEventListener('pointerdown', (ev) => {
    if (!opts.enabled() || ev.button !== 0) return;
    ev.preventDefault();
    source.setPointerCapture(ev.pointerId);

    const rect = source.getBoundingClientRect();
    const offsetX = ev.clientX - rect.left;
    const offsetY = ev.clientY - rect.top;
    const startX = ev.clientX;
    const startY = ev.clientY;
    let ghost: HTMLElement | null = null;
    let overTarget = false;

    const isOver = (x: number, y: number) => {
      const r = opts.target().getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const move = (e: PointerEvent) => {
      if (!ghost) {
        if (Math.hypot(e.clientX - startX, e.clientY - startY) < TAP_TOLERANCE) return;
        ghost = source.cloneNode(true) as HTMLElement;
        ghost.classList.add('fantasma');
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        document.body.append(ghost);
        source.classList.add('arrastando');
        opts.onDragStart?.();
      }
      ghost.style.transform = `translate(${e.clientX - offsetX}px, ${e.clientY - offsetY}px) rotate(-6deg) scale(1.08)`;
      const over = isOver(e.clientX, e.clientY);
      if (over !== overTarget) {
        overTarget = over;
        opts.target().classList.toggle('alvo-ativo', over);
      }
    };

    const finish = (e: PointerEvent) => {
      source.removeEventListener('pointermove', move);
      source.removeEventListener('pointerup', finish);
      source.removeEventListener('pointercancel', finish);
      opts.target().classList.remove('alvo-ativo');
      source.classList.remove('arrastando');

      if (!ghost) {
        // Toque simples: também coloca o tecido na manequim.
        if (e.type === 'pointerup') opts.onDrop();
        return;
      }
      opts.onDragEnd?.();
      const g = ghost;
      if (e.type === 'pointerup' && isOver(e.clientX, e.clientY)) {
        g.remove();
        opts.onDrop();
      } else {
        // Volta para a prateleira.
        g.classList.add('voltando');
        g.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
        window.setTimeout(() => g.remove(), 300);
      }
    };

    source.addEventListener('pointermove', move);
    source.addEventListener('pointerup', finish);
    source.addEventListener('pointercancel', finish);
  });

  source.addEventListener('keydown', (ev) => {
    if ((ev.key === 'Enter' || ev.key === ' ') && opts.enabled()) {
      ev.preventDefault();
      opts.onDrop();
    }
  });
}

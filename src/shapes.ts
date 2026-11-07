/**
 * Moldes de corte. Todas as coordenadas usam o mesmo sistema da manequim
 * (viewBox 0 0 300 560), para que a peça cortada encaixe diretamente nela.
 */
export type Slot = 'capa' | 'inferior' | 'superior' | 'inteiro' | 'acessorio';

export interface Shape {
  id: string;
  name: string;
  slot: Slot;
  /** Contornos preenchidos com o tecido. */
  paths: string[];
  /** Linhas decorativas (costuras), desenhadas por cima. */
  details?: string[];
  /** Recorte usado na pré-visualização do botão. */
  viewBox: string;
}

export const SHAPES: Shape[] = [
  {
    id: 'vestido',
    name: 'Vestido',
    slot: 'inteiro',
    paths: [
      'M128,104 Q150,124 172,104 L197,112 Q191,170 177,214 Q214,318 234,402 Q150,424 66,402 Q86,318 123,214 Q109,170 103,112 Z',
    ],
    details: ['M124,216 Q150,226 176,216', 'M74,392 Q150,412 226,392'],
    viewBox: '56 92 188 340',
  },
  {
    id: 'blusa',
    name: 'Blusa',
    slot: 'superior',
    paths: [
      'M128,104 Q150,122 172,104 L201,112 L224,162 L204,174 L192,150 Q186,182 180,214 L186,242 L114,242 L120,214 Q114,182 108,150 L96,174 L76,162 L99,112 Z',
    ],
    details: ['M116,234 L184,234', 'M150,120 L150,232'],
    viewBox: '66 92 168 160',
  },
  {
    id: 'saia',
    name: 'Saia',
    slot: 'inferior',
    paths: ['M122,210 L178,210 Q206,278 220,342 Q150,360 80,342 Q94,278 122,210 Z'],
    details: ['M122,222 L178,222', 'M136,224 L118,346', 'M164,224 L182,346'],
    viewBox: '70 200 160 170',
  },
  {
    id: 'calca',
    name: 'Calça',
    slot: 'inferior',
    paths: ['M111,210 L189,210 L193,282 L186,506 L154,506 L150,300 L146,506 L114,506 L107,282 Z'],
    details: ['M111,222 L189,222', 'M150,224 L150,290'],
    viewBox: '90 200 120 316',
  },
  {
    id: 'short',
    name: 'Short',
    slot: 'inferior',
    paths: ['M111,210 L189,210 L196,302 L156,308 L150,264 L144,308 L104,302 Z'],
    details: ['M111,222 L189,222', 'M150,224 L150,262'],
    viewBox: '94 200 112 118',
  },
  {
    id: 'capa',
    name: 'Capa',
    slot: 'capa',
    paths: ['M112,104 Q150,92 188,104 Q240,296 252,472 Q150,494 48,472 Q60,296 112,104 Z'],
    details: ['M112,104 Q150,126 188,104'],
    viewBox: '38 86 224 416',
  },
  {
    id: 'laco',
    name: 'Laço',
    slot: 'acessorio',
    paths: [
      'M150,30 L116,10 Q106,30 116,52 Z',
      'M150,30 L184,10 Q194,30 184,52 Z',
      'M141,30 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0 Z',
    ],
    viewBox: '100 0 100 62',
  },
];

export const getShape = (id: string): Shape => {
  const s = SHAPES.find((x) => x.id === id);
  if (!s) throw new Error(`Molde desconhecido: ${id}`);
  return s;
};

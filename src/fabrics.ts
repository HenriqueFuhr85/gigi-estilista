export type FabricKind = 'liso' | 'brilho' | 'glitter' | 'bolinhas' | 'listras';

export interface Fabric {
  id: string;
  name: string;
  base: string;
  /** Cor de destaque usada no brilho, glitter ou estampa. */
  accent: string;
  kind: FabricKind;
}

export const FABRICS: Fabric[] = [
  { id: 'rosa-brilho', name: 'Rosa Brilhante', base: '#ff6fae', accent: '#ffe0f0', kind: 'brilho' },
  { id: 'lilas', name: 'Lilás', base: '#b48cf2', accent: '#e9dcff', kind: 'liso' },
  { id: 'azul-glitter', name: 'Azul Glitter', base: '#3d7bf2', accent: '#ffffff', kind: 'glitter' },
  { id: 'verde-agua', name: 'Verde-Água', base: '#38d1b8', accent: '#d6fff7', kind: 'liso' },
  { id: 'amarelo-bolinhas', name: 'Amarelo de Bolinhas', base: '#ffd23f', accent: '#ffffff', kind: 'bolinhas' },
  { id: 'vermelho', name: 'Vermelho', base: '#e8343f', accent: '#ffc2c6', kind: 'liso' },
  { id: 'dourado', name: 'Dourado', base: '#d9a521', accent: '#fff6c9', kind: 'brilho' },
  { id: 'prata-glitter', name: 'Prata Glitter', base: '#a9b4c2', accent: '#ffffff', kind: 'glitter' },
  { id: 'laranja-listras', name: 'Laranja Listrado', base: '#ff8a3d', accent: '#fff1e3', kind: 'listras' },
  { id: 'branco', name: 'Branco', base: '#f7f5f2', accent: '#ffffff', kind: 'liso' },
  { id: 'roxo-glitter', name: 'Roxo Glitter', base: '#7a3fd1', accent: '#ffd6ff', kind: 'glitter' },
  { id: 'preto-brilho', name: 'Preto Cetim', base: '#2b2633', accent: '#8c84a3', kind: 'brilho' },
  { id: 'rosa-bolinhas', name: 'Rosa de Bolinhas', base: '#ffb3d1', accent: '#ff5c9d', kind: 'bolinhas' },
  { id: 'azul-listras', name: 'Azul Marinheiro', base: '#1f4e9c', accent: '#ffffff', kind: 'listras' },
];

export const fabricFill = (f: Fabric): string => `url(#fab-${f.id})`;

export const getFabric = (id: string): Fabric => {
  const f = FABRICS.find((x) => x.id === id);
  if (!f) throw new Error(`Tecido desconhecido: ${id}`);
  return f;
};

# Gigi Estilista

Jogo infantil para navegador em que a **Gigi**, uma estilista de 9 anos, cria roupas para a manequim.

## Como jogar

1. Escolha um tecido na prateleira (cores lisas, com brilho, glitter, bolinhas e listras).
2. Arraste o tecido até a manequim (ou apenas toque nele).
3. Escolha o formato do corte: Vestido, Blusa, Saia, Calça, Short, Capa ou Laço.
4. Veja a tesoura cortar o tecido e a manequim vestir a peça.
5. Combine peças (ex.: blusa + saia + capa + laço). Use **Desfazer** ou **Tirar roupa** quando quiser.
6. Na aba **Acessórios**, coloque brincos, colares e pulseiras (toque de novo para tirar).
7. Na aba **Rosto**, escolha o formato do rosto, o corte e a cor do cabelo.

Funciona com mouse, toque (tablet/celular) e teclado.

## Desenvolvimento

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

## Tecnologia

- TypeScript + Vite, sem engine de jogos.
- Arte original em SVG inline (Gigi, manequim, moldes e tecidos).
- Deploy automático no GitHub Pages a cada push na `main` (`.github/workflows/deploy.yml`).

## Estrutura

| Arquivo | Responsabilidade |
| --- | --- |
| `src/main.ts` | Fluxo do jogo (escolher tecido → escolher corte → cortar → vestir) |
| `src/fabrics.ts` | Catálogo de tecidos |
| `src/svgDefs.ts` | Padrões SVG dos tecidos (brilho animado, glitter, estampas) |
| `src/shapes.ts` | Moldes de corte e slots de vestimenta |
| `src/mannequin.ts` | Manequim, camadas (cabelo, rosto, roupas, joias) e animação da tesoura |
| `src/accessories.ts` | Catálogo de brincos, colares e pulseiras |
| `src/face.ts` | Formatos de rosto, cortes e cores de cabelo |
| `src/gigi.ts` | Personagem Gigi e balão de fala |
| `src/drag.ts` | Arrastar e soltar com Pointer Events |

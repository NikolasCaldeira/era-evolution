# ERA: Evolution — Ciclo 11 · O Mamute Ancestral

Roguelike isométrico em **Phaser 3.90**, JavaScript e Vite. Os testes e o build são executados pelo GitHub Actions; a versão compilada é publicada no GitHub Pages.

## Capítulos jogáveis

1. **Cretáceo (Era 01, fictícia):** 100 eliminações desbloqueiam o Tricerátops Ancestral. Ao vencê-lo, o jogador atravessa a transição para o Pleistoceno, preservando a progressão.
2. **Pré-História / Pleistoceno (Era 02):** terreno gelado, smilodontes, rinocerontes-lanosos e mamutes juvenis. Após **100 eliminações nesta era**, aparece o **Mamute Ancestral**.

A primeira era é ficcional; dinossauros e humanos não coexistiram.

## Novidades do Ciclo 11

- **Relíquias centralizadas:** estrela, brilho e anel compartilham um mesmo centro; o pulso anima somente os círculos. O mesmo componente é usado nas duas eras.
- **Mamute Ancestral:** arte original, barra de vida e três fases (70% e 35% da vida delimitam as mudanças).
- **Investida Glacial:** direção marcada antes da corrida; cria rastros de gelo temporários.
- **Pisada Sísmica:** aviso circular antes do impacto.
- **Rajada Congelante:** aviso em cone a partir da fase 2; ao acertar, reduz temporariamente a velocidade do jogador.
- **Matilha:** na fase 3, invoca até dois smilodontes de apoio por convocação, com limite de três aliados vivos e duas convocações. Esses aliados não geram eliminações ou fragmentos.
- **Vitória da Era 02:** tela de conclusão apresenta o próximo capítulo, **Civilizações Antigas (Era 03)**, como *em desenvolvimento*. Os dados de continuidade são preparados com até +2 pontos de vida, sem ativar uma era incompleta.

## Controles

- **WASD/setas:** movimentar. O ataque é automático em todas as direções.
- **Q/E:** alternar artefatos. **1–5:** selecionar um artefato disponível.
- **ESC:** pausar. **F3:** visualizar rotas. **R:** reiniciar após a derrota.
- A cada **10 eliminações**, surge uma relíquia. A cada **10 fragmentos**, o jogo pausa para escolha de melhoria.
- Dano e morte reiniciam todo o progresso da expedição, sem melhorias permanentes.

## Acessos de teste

- `?testeChefe=1` — Tricerátops Ancestral, para testar o primeiro portal.
- `?testeEra=2` — entrar diretamente no Pleistoceno sem progresso anterior.
- `?testeChefe=2` — entrar diretamente no encontro do **Mamute Ancestral**, com alguns artefatos evoluídos. Atalho de desenvolvimento que não interfere na partida normal.

## Desenvolvimento

```bash
npm install
npm test
npm run dev
npm run build
npm run export:web
```

`publicar/index.html` e `JOGAR-ERA-Evolution-Ciclo11.html` são HTMLs de página única que usam Phaser via CDN e requerem internet. Para publicar no GitHub Pages, o workflow `.github/workflows/deploy.yml` executa os testes e o build Vite a cada push em `main`.

**Ainda não implementado:** cenário e personagens da Era 03. A tela de vitória apresenta somente uma prévia do capítulo futuro.

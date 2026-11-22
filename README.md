# ERA: Evolution — Ciclo 06: Combate e Sobrevivência

Projeto 2.5D isométrico em Phaser 3.90, com Vite e JavaScript ES Modules.

## Jogar

A versão publicada no GitHub Pages está disponível em:
https://nikolascaldeira.github.io/era-evolution/

O workflow `.github/workflows/deploy.yml` executa testes e build a cada atualização da branch `main`.

## Ciclo 06

- Vida inicial de 5 pontos e dano de contato de 1 ponto por criatura.
- Invulnerabilidade de 1,25 s após receber dano; personagem pisca e pode continuar a mover-se e atacar.
- Pequeno recuo após contato, respeitando os limites e obstáculos.
- Efeito visual, números de dano e reações das criaturas aos projéteis.
- HUD reposicionado para compensar o zoom da câmera e apresentar vida, eliminações, fragmentos, nível, arma e progresso da era.
- Ao chegar a 0 de vida, fim da partida com resultados, reinício (clique, Enter ou R) e retorno ao menu.
- A melhoria Recuperação agora devolve até 2 pontos de vida, além de afastar criaturas.
- Mantidos o mapa, a navegação A*, os disparos 360° e a tela de melhorias.
- **Meta de 100 eliminações:** exibe progresso e aviso. O chefe ainda não está implementado.

## Desenvolver

```bash
npm install
npm run dev
```

## Testar e compilar

```bash
npm test
npm run build
npm run export:web
```

`npm run export:web` atualiza `publicar/index.html` e gera `JOGAR-ERA-Evolution-Ciclo06.html`, que usa o Phaser via CDN e requer internet. O GitHub Pages utiliza o build do Vite (`dist/`), não o HTML de CDN.

## Controles

- **WASD / setas:** movimentação em oito direções.
- **F3:** mostrar/ocultar rotas de navegação das criaturas.
- **ESC:** pausar/retomar durante uma partida.
- **R / Enter na tela de fim:** recomeçar do zero.
- **Mouse/clique:** iniciar, escolher melhorias e controlar os menus.

## Próximos ciclos

- Armas desbloqueadas por eliminações e tipos diferentes de projéteis.
- Inimigos com habilidades únicas e dificuldade progressiva.
- Chefe do Cretáceo e transição para a próxima era.

_Arte e criaturas estilizadas, sem representação gráfica de ferimentos._

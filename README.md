# ERA: Evolution — Ciclo 07 — Arsenal e Evolução

Protótipo roguelike isométrico em **Phaser 3.90**, desenvolvido com JavaScript e Vite. O código é publicado automaticamente no GitHub Pages.

## Como jogar

- **WASD** ou **setas:** movimentar o sobrevivente em oito direções.
- **Disparo automático:** o sobrevivente mira na criatura mais próxima dentro do alcance da arma equipada.
- **A cada 10 eliminações:** surge uma relíquia no mapa; aproxima-te para recolher e equipar. As primeiras quatro relíquias desbloqueiam **Gêmeos de Quartzo**, **Lança Solar**, **Leque Prismático** e **Orbe de Âmbar**. Dos 50 aos 90 abates, surgem níveis 2 dessas armas e da arma inicial.
- **Q/E:** alternar entre armas desbloqueadas. **1–5:** equipar diretamente na ordem de desbloqueio.
- **A cada 10 fragmentos:** o jogo pausa para escolher uma entre três melhorias aleatórias. Também podes usar **1/2/3** na tela de melhorias.
- **ESC:** pausar/continuar. **F3:** ver caminhos calculados pela navegação A*. **R:** recomeçar após perder.
- Ao perder os cinco pontos de vida, a partida termina. Não há progresso permanente.
- A meta do Cretáceo é de 100 eliminações; o chefe e a próxima era ainda estão em desenvolvimento.

## Armas disponíveis

| Arma | Característica |
| --- | --- |
| Artefato Verde | Projétil único e preciso (inicial). |
| Gêmeos de Quartzo | Dois projéteis separados. |
| Lança Solar | Atravessa até três criaturas (quatro no nível 2). |
| Leque Prismático | Três disparos em ângulos diferentes. |
| Orbe de Âmbar | Efeito de impacto em área ao atingir um inimigo. |

As melhorias por fragmentos incluem alcance, cadência, movimento, potência, ímã de coleta e recuperação de vida (quando necessária).

## Desenvolvimento

```sh
npm install
npm test
npm run dev
npm run build
```

`npm run export:web` gera `publicar/index.html` e `JOGAR-ERA-Evolution-Ciclo07.html` para uso sem Vite (Phaser é carregado por CDN e exige internet).

O workflow `.github/workflows/deploy.yml` executa testes e build a cada push em `main`, publicando `dist/` no GitHub Pages.

# ERA: Evolution — Ciclo 15 · Era Espacial

Jogo roguelike de sobrevivência 2.5D em **Phaser 3.90**, com nove eras jogáveis, progressão contínua e reinício integral após a derrota.

## Capítulos

1. Cretáceo — mundo primordial, dinossauros e Tricerátops Ancestral
2. Pré-História — Era do Gelo e Mamute Ancestral
3. Civilizações Antigas — templos, ruínas, Guardião da Esfinge
4. Medieval — fortaleza, gárgulas, Gárgula Coroada
5. Renascimento — jardins, autômatos, Autômato Magno
6. **Revolução Industrial** — chão de fábrica, caldeiras e engrenagens, rato de ferro, autômato fabril e besouro a vapor; chefe **Titã a Vapor** (jato de vapor, explosão da caldeira e chuva de escória)
7. **Contemporânea** — cidade, barreiras urbanas e veículos, cão mecânico, sentinela urbano e drone de vigilância; chefe **Colosso Blindado** (investida blindada, varredura de sinal e zonas de alerta)
8. **Digital** — circuitos, servidores e barreiras eletrônicas, bug de código, firewall vivo e espectro digital; chefe **Núcleo Corrompido** (grade de dados, pulso corrompido e tempestade de pacotes)

**Era 09 — Espacial** é jogável. A **Era 10 — Extinção** permanece em desenvolvimento.

9. **Espacial** — posto lunar, domos científicos, antenas, painéis solares e rochas espaciais; rover corrompido, sentinela astral e raia nebulosa; chefe **Sentinela Orbital** (feixes orbitais, poço gravitacional, meteoros e anel de plasma)

## Mecânicas principais

- Cada era exige **100 eliminações** para enfrentar o chefe.
- Eliminações por era recomeçam em zero; vida restante, melhorias, armas, fragmentos e total de eliminações passam à era seguinte. A transição após a Era 02 e seguintes recupera até dois pontos de vida.
- A cada 10 eliminações, aparece uma relíquia de evolução de arma. Cada 10 fragmentos oferece três melhorias diferentes.
- Projéteis automáticos em 360°; cinco armas com comportamentos próprios e alternância por Q/E ou teclas 1–5.
- Inimigos têm três pontos de vida. O desafio cresce pelo número, velocidade e agressividade das criaturas, com limites para controlar a população do mapa.
- Chefes das Eras VI–IX possuem **três fases**, ataques sinalizados e espaços de esquiva. A fase final pode convocar apoio.
- Dificuldade e fluidez das Eras 01 e 04 continuarão sendo aperfeiçoadas em ciclos futuros, depois da expansão de conteúdo.

## Comandos

| Comando | Ação |
| --- | --- |
| WASD ou setas | Caminhar em oito direções |
| Espaço | Esquiva manual (com recarga) |
| Q / E ou 1–5 | Alternar ou selecionar arma |
| ESC | Pausar / retomar |
| F3 | Exibir navegação das criaturas |
| F4 | Exibir FPS, criaturas e projéteis |
| R | Reiniciar após game over |

## Testes diretos no site

- `?testeEra=6` / `?testeChefe=6`: Revolução Industrial
- `?testeEra=7` / `?testeChefe=7`: Contemporânea
- `?testeEra=8` / `?testeChefe=8`: Digital
- `?testeEra=9` / `?testeChefe=9`: Espacial

Os parâmetros de teste criam **partidas novas de depuração**, sem progressão permanente.

## Desenvolvimento

```bash
npm install
npm test
npm run dev
npm run build
```

`npm run export:web` gera uma página HTML independente que carrega Phaser via CDN (necessita de internet). O site hospedado no GitHub Pages usa a compilação Vite gerada pelo workflow `.github/workflows/deploy.yml`.

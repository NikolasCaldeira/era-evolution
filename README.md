# ERA: Evolution — Ciclo 12 · Cinco Eras

Protótipo roguelike de sobrevivência isométrico em **Phaser 3.90**, JavaScript e Vite. O projeto é publicado automaticamente via GitHub Pages, sem necessidade de terminal para quem joga.

## Capítulos jogáveis

| Era | Cenário | Criaturas | Guardião ao completar 100 eliminações |
|---|---|---|---|
| I · Cretáceo (fantasia temporal) | Floresta tropical e rochas | Compsognato, anquilossauro, pterossauro | Tricerátops Ancestral |
| II · Pré-História (Pleistoceno) | Neve, pinheiros, geleiras | Smilodonte, rinoceronte-lanoso, mamute juvenil | Mamute Ancestral |
| III · Civilizações Antigas | Areias, ruínas e colunas | Escaravelho, guardião de arenito, espírito-chacal | Guardião da Esfinge |
| IV · Era Medieval | Fortaleza, pátio de pedra, torres | Lobo sombrio, gárgula, cavaleiro encantado | Gárgula Coroada |
| V · Renascimento | Jardins, fontes e estátuas | Autômato, quimera alquímica, sentinela de bronze | Autômato Magno |

Ao derrotar o guardião, a próxima era é desbloqueada na mesma partida. A quinta era termina com uma tela de conclusão da expedição; os capítulos VI–X ainda **não** foram construídos. A fidelidade histórica é estilizada/fantástica, especialmente no primeiro capítulo.

## Novidades do Ciclo 12

- **Rastro do Mamute** dura cerca de **6,1 segundos**; ao tocá-lo há uma **paralisação de 0,42 s**, seguida de **2,65 s de desaceleração com recuperação gradual**. A mesma marca de gelo não paralisa infinitamente quem continua sobre ela.
- **Dificuldade entre eras:** cada capítulo aumenta a quantidade, a velocidade e a agressividade de criaturas. Mantida a progressão a cada dez eliminações dentro de cada era.
- **Combate ativo:** áreas de perigo avisam antes de atingir; surgem da metade das Eras I–II e passam a ser características importantes das Eras III–V. Mover-se para fora do círculo evita o impacto.
- **Esquiva manual no ESPAÇO:** avanço curto na direção do movimento, respeitando limites e obstáculos; recarga de 4,9 s e breve proteção. Não substitui automaticamente o deslocamento.
- **Novos cenários, arte direcional, três espécies e chefes temáticos** das Eras III, IV e V. Os chefes desses capítulos são uma primeira versão funcional; animações e habilidades exclusivas poderão ser aprimoradas nos próximos ciclos.
- Vida, armas, melhorias, níveis, fragmentos, estatísticas e tempo seguem entre eras, com recuperação limitada de vida após a Era II.

## Comandos

- **WASD / setas:** mover em oito direções.
- **Espaço:** esquiva manual com recarga.
- **Q/E, 1–5:** alternar ou selecionar armas.
- **ESC:** pausa. **F3:** exibir as rotas dos inimigos.
- **R:** reiniciar depois de perder ou concluir.
- A cada **10 eliminações** surge uma relíquia; cada **10 fragmentos** abre três opções de melhoria.

## Testes de acesso direto

- `?testeEra=3`, `?testeEra=4`, `?testeEra=5` — visitar imediatamente os novos cenários com equipamento de teste.
- `?testeChefe=2` — encontro do Mamute para verificar a recuperação depois do gelo.
- `?testeChefe=3`, `?testeChefe=4`, `?testeChefe=5` — encontros dos novos chefes.
- Sem parâmetros — expedição completa desde o Cretáceo.

## Desenvolvimento

```bash
npm install
npm test
npm run dev
npm run build
npm run export:web
```

O workflow em `.github/workflows/deploy.yml` executa `npm test`, `npm run build` e publica automaticamente `dist/` no GitHub Pages. O HTML único (`JOGAR-ERA-Evolution-Ciclo12.html`) carrega Phaser via CDN e exige internet; não substitui o bundle Vite publicado pelo GitHub Pages.

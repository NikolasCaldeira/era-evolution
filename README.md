# ERA: Evolution — Ciclo 09 — Tricerátops Ancestral + Ímã de Fragmentos

Jogo roguelike isométrico em **Phaser 3.90**, JavaScript e Vite. O repositório publica automaticamente o site pelo GitHub Pages.

## Como jogar

- **WASD / setas:** mover-se em oito direções.
- **Ataques automáticos:** mirar o inimigo ou chefe mais próximo dentro do alcance da arma equipada.
- **Q/E:** alternar entre armas desbloqueadas; **1–5:** seleção direta.
- **A cada 10 eliminações (até 90):** recolher uma relíquia para ganhar arma nova ou evoluir a existente.
- **A cada 10 fragmentos:** escolher uma de três melhorias; entre elas, **Chamar Fragmentos** amplia a distância de atração do ímã.
- **Ímã de fragmentos:** estrelas no chão começam a deslocar-se sozinhas ao entrar na área magnética. Aumentar a melhoria permite atraí-las de mais longe. A coleta só acontece quando se aproximam do personagem.
- **100 eliminações:** o **Tricerátops Ancestral** aparece como primeiro chefe, interrompendo o nascimento dos inimigos comuns. A barra de vida do chefe fica na parte inferior da tela.
- **Ataques do chefe:** investida anunciada por uma linha, pisada em área marcada por círculos e rajada de projéteis em leque. Os golpes têm avisos visuais antes de causar dano. Ao perder vida, o chefe fica mais agressivo.
- **Vitória:** derrotar o chefe encerra o Cretáceo e apresenta os resultados da partida. A Próxima Era — Pré-História — será desenvolvida no Ciclo 10.
- **ESC:** pausar. **F3:** mostrar caminhos da IA. Ao perder, **R** reinicia toda a partida sem progresso permanente.

### Atalho de QA para testar o chefe

Adiciona `?testeChefe=1` ao endereço da página, por exemplo:

`https://nikolascaldeira.github.io/era-evolution/?testeChefe=1`

Este atalho entra diretamente no encontro com o chefe, com o arsenal desbloqueado, e serve **apenas para testes**. Sem o parâmetro, o chefe só aparece quando a partida atinge 100 eliminações.

## Desenvolvimento

```sh
npm install
npm test
npm run build
npm run dev
```

`npm run export:web` também gera `publicar/index.html` e `JOGAR-ERA-Evolution-Ciclo09.html` (HTML único que carrega o Phaser pela internet).

O workflow `.github/workflows/deploy.yml` executa testes e build do projeto a cada envio ao branch `main`, publicando automaticamente o diretório `dist`.

### Implementação

- `src/systems/BossSystem.js`: vida, fases, cadência e escolha dos padrões do chefe (sem dependência de Phaser).
- `src/entities/CretaceousBoss.js`: navegação, telegráficos, ataques, colisões e animação.
- `src/art/BossArt.js`: arte original do chefe, gerada por Canvas.
- `src/scenes/EraCompleteScene.js`: resultado e reinício após a vitória.
- `src/systems/MagnetSystem.js`: raio de atração, velocidade do fragmento e coleta física.

## Limites atuais

A transição interativa para a segunda era não faz parte deste ciclo; a tela de vitória informa que a Pré-História virá na próxima versão. O modo de teste do chefe não substitui testar a progressão normal até as 100 eliminações.

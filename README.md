# ERA: Evolution — Ciclo 13 — Equilíbrio e Chefes

Roguelike isométrico em Phaser 3.90.0. Cinco eras jogáveis, publicação automática no GitHub Pages.

## Melhorias deste ciclo

- **Chefes distintos por era (03–05):** Esfinge com leque de areia, areia movediça e raio solar; Gárgula com mergulho, chuva de runas e cone de petrificação; Autômato com anel de engrenagens com centro seguro, pistões de impacto e feixes paralelos que deixam uma faixa segura.
- **Avisos consistentes:** as formas de aviso e as colisões dos ataques partilham a mesma geometria. Há espaço para o jogador se desviar, incluindo a esquiva manual (Espaço).
- **Escalada equilibrada:** máximo de criaturas simultâneas por era limitado a 17, 18, 19, 20 e 21, respetivamente, com progressão a cada 10 eliminações. Três pontos de vida continuam a ser a regra para criaturas comuns.
- **Pressão por era:** velocidade e agressividade sobem gradualmente. Os chefes têm barras de vida mais robustas e intervalos de ataque legíveis.
- **Medição opcional de desempenho:** F4 exibe estimativa de FPS e contagem de criaturas/projéteis. Usar para comparar Eras 01 e 04, onde foram relatados engasgos; não se trata de correção completa de desempenho.

## Controles

- **WASD / setas:** mover; **Espaço:** esquiva com recarga.
- **Q/E** ou **1–5:** alternar as armas desbloqueadas.
- **F3:** mostrar rotas dos inimigos; **F4:** mostrar/ocultar FPS e contadores.
- **ESC:** pausa; **R:** reinicia após a derrota.
- Disparos são automáticos na direção de criaturas dentro do alcance.
- A cada dez eliminações surge uma relíquia; a cada dez fragmentos abre a escolha de três melhorias.

## Links de teste

- Jogo normal: https://nikolascaldeira.github.io/era-evolution/
- Chefe da Era 03: https://nikolascaldeira.github.io/era-evolution/?testeChefe=3
- Chefe da Era 04: https://nikolascaldeira.github.io/era-evolution/?testeChefe=4
- Chefe da Era 05: https://nikolascaldeira.github.io/era-evolution/?testeChefe=5

## Instalação

```sh
npm install
npm test
npm run build
npm run dev
```

O projeto utiliza Vite com `base: './'`. O GitHub Actions realiza testes, compilação e publicação em cada alteração na branch `main`. A exportação HTML de página única pode ser gerada com `npm run export:web` (Phaser carregado via CDN).

## Notas de implementação

Os avisos são resolvidos com as mesmas formas usadas para calcular o dano, em `CivilizationBossSystem.js`. Os padrões são construídos em pontos do mapa no início do aviso, para que não mudem arbitrariamente antes do impacto. O movimento de esquiva e a invulnerabilidade temporária permanecem intactos. As Eras 06–10 ainda não foram desenvolvidas.

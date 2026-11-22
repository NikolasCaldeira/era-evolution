# ERA: Evolution — Ciclo 10 · Transição para a Pré-História

Jogo roguelike de sobrevivência isométrico desenvolvido em **Phaser 3.90**, JavaScript e Vite. O GitHub Actions executa os testes, compila e publica o site no GitHub Pages.

## Capítulos jogáveis

1. **Era 01 — Cretáceo fictício:** vegetação tropical, compsognato, anquilossauro e pterossauro. Após 100 eliminações aparece o **Tricerátops Ancestral**, com três fases e ataques próprios.
2. **Era 02 — Pré-História (Pleistoceno):** cenário gelado com pedras de gelo, neve, pinheiros, terreno pálido; novas criaturas **smilodonte, rinoceronte-lanoso e mamute juvenil**, com sprites próprios. O personagem usa roupas de pele próprias do período e mantém seus artefatos fantásticos.

**Importante:** dinossauros não coexistiram com humanos. A primeira era é fictícia, e a segunda decorre muito tempo depois.

## Transição e continuidade

Ao derrotar o Tricerátops, surge uma sequência visual **A História Avança**. Clique em **AVANÇAR PARA A ERA DO GELO** ou pressione **Enter** para iniciar o Pleistoceno. O jogo preserva o inventário de artefatos, evoluções, saúde restante, tempo, experiência e fragmentos acumulados; as eliminações por era recomeçam do zero, enquanto o total da expedição permanece.

Na segunda era, as relíquias concedem novos níveis de aprimoramento aos artefatos existentes nos marcos de 10 em 10 eliminações. A dificuldade continua progressiva. Após 100 eliminações no Pleistoceno, aparece um aviso; o **segundo chefe** será desenvolvido num ciclo futuro. Não há transição para a terceira era nesta versão.

Quando a vida chega a zero, a expedição termina e reiniciar limpa o progresso, retornando ao Cretáceo.

## Controles

- **WASD / setas:** movimentação em oito direções.
- **Ataque automático** contra criaturas próximas.
- **Q/E:** alternar entre artefatos desbloqueados; **1–5:** selecionar.
- **ESC:** pausar; **F3:** mostrar caminhos calculados pela IA.
- **A cada 10 fragmentos:** escolher entre três melhorias.

### Acessos de teste

- `?testeChefe=1` — início direto no chefe da primeira era, para testar a transição sem repetir 100 eliminações.
- `?testeEra=2` — entrada direta na segunda era com progresso inicial, para avaliar cenário, criaturas e movimentação. É um atalho de teste, não a progressão normal.

## Desenvolvimento

```bash
npm install
npm test
npm run dev
npm run build
npm run export:web
```

O arquivo `publicar/index.html` é um HTML único, e depende de acesso à internet para carregar o Phaser 3.90 do CDN. O site oficial é compilado via Vite e publicado automaticamente a cada atualização da branch `main`.

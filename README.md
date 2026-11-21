# ERA: Evolution — Rebuild · Ciclo 05

Protótipo 2.5D isométrico em **Phaser 3.90.0**. Este ciclo aprimora o visual do Cretáceo e fornece duas formas de jogar sem terminal: HTML independente e publicação de site estático.

## Qual arquivo usar?

### Mais simples: abrir o HTML no navegador

1. Abra `JOGAR-ERA-Evolution-Ciclo05.html` no Chrome, Edge ou Firefox (duplo clique).
2. É necessário **estar conectado à internet**: o Phaser é carregado pelo CDN do jsDelivr.
3. O jogo não precisa de `npm`, terminal, Vite ou servidor local nesta modalidade.

### Jogar por um endereço público (link)

1. Acesse **https://app.netlify.com/drop**.
2. Arraste `ERA-Evolution-Ciclo05-SITE.zip` ou o conteúdo de `publicar/` para a área de publicação.
3. Abra o link `https://...netlify.app` disponibilizado pelo serviço.
4. Nas próximas versões, pode publicar uma nova versão no mesmo projeto hospedado.

**Observação:** a publicação externa é feita pelo proprietário da conta/URL; este pacote não é automaticamente hospedado na internet. Quem tiver o link público poderá acessar o jogo. Também requer conexão à internet para carregar Phaser do CDN.

### Projeto modular — desenvolvimento com Vite

1. Extraia a pasta completa.
2. Execute `npm install` e `npm run dev`.
3. Abra o endereço apresentado pelo Vite.
4. `npm test`: testes automatizados; `npm run build`: build estático em `dist/`.
5. `npm run export:web`: atualiza o HTML independente e o `publicar/index.html`.

## Controles

- **WASD / setas:** movimento em oito direções.
- **ESC:** pausa / retomar.
- **F3:** mostrar / ocultar rotas A\* das criaturas (ferramenta de depuração).
- **Mouse:** selecionar melhorias.
- **Ataque:** disparos automáticos com alvo em qualquer direção (360°).
- **Joystick:** removido a pedido, não está incluído.

## Novidades do Ciclo 05

- Personagem redesenhado como sobrevivente de ficção científica perdido no Cretáceo, com **oito direções visuais** e quatro quadros de movimento para cada uma.
- Três criaturas visualmente distintas: **compsognato**, **anquilossauro juvenil** e **pterossauro terrestre**, todas estilizadas e não realistas, cada uma com movimento animado e aparência própria.
- Cenário em camadas: **samambaias, cicadáceas, fungos, rochas facetadas, árvores tropicais, musgo e esporos ambientais**.
- Menu principal e HUD redesenhados e projéteis de energia com novo efeito luminoso.
- Texturas geradas por Canvas 2D na inicialização: não há download extra de sprites.
- Navegação A\*, colisões do mapa, coleta de fragmentos e seleção de melhorias preservadas.
- Exportação HTML de página única: sem servidor local ou Node na máquina do jogador (mas Phaser depende de CDN).

## O que ainda é protótipo

- Os gráficos são **arte vetorial procedimental**, não sprites pintados à mão nem arte final.
- Não há chefes, dez eras completas, sistema de desbloqueio de armas ou progressão de personagem entre eras.
- Não há link público hospedado automaticamente neste pacote: é necessário publicar por um serviço de hospedagem.
- O projeto e o HTML foram validados por verificação sintática, dez testes automatizados e teste de desenho dos sprites em Chromium. A execução completa do jogo com Phaser no navegador e o carregamento do CDN ainda dependem de teste externo.

## Histórico de testes

- `npm test`: **10 testes passando**, incluindo os 7 de navegação do Ciclo 04.
- `node --check`: sintaxe de todos os arquivos JavaScript da aplicação.
- Exportador gera script inline sem imports ES Modules.
- As texturas de Canvas foram desenhadas com sucesso em um navegador Chromium, sem erros JavaScript.

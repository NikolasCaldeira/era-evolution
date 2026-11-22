# Publicar ERA: Evolution no GitHub Pages

Este projeto inclui `.github/workflows/deploy.yml`, que publica o jogo sempre que a branch `main` receber uma atualização.

## Configuração inicial

1. Crie um repositório novo e vazio no GitHub, de preferência chamado `era-evolution` (a visibilidade pública disponibiliza o código a qualquer pessoa). Se quiser evitar a publicação pública do código, confirme antes o que seu plano GitHub permite para Pages em repositórios privados.
2. Envie os arquivos deste pacote **para a raiz** da branch `main` do repositório.
3. No repositório, abra **Settings → Pages** e, em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Abra a aba **Actions** e acompanhe o workflow `Publicar ERA Evolution no GitHub Pages`.
5. Após a publicação, o jogo ficará acessível pelo endereço indicado no deployment. Normalmente: `https://SEU_USUARIO.github.io/NOME_DO_REPO/`.

Se o projeto for vinculado ao ChatGPT GitHub, novas versões poderão ser enviadas pelo assistente para a branch `main` após confirmação do repositório correto e do acesso de escrita.

## Como funciona

- O workflow usa `npm install`, `npm test` e `npm run build` para criar o site (`dist`).
- `vite.config.js` define `base: './'` para funcionar sob caminhos como `/era-evolution/`.
- Phaser vem incluído no bundle do build Vite, assim **o site publicado pelo workflow não depende de CDN**.
- O arquivo `JOGAR-ERA-Evolution-Ciclo06.html` continua sendo alternativa para jogar localmente; só esta alternativa depende do CDN do Phaser.
- A publicação é automática depois que o GitHub Pages estiver configurado e o workflow concluir com sucesso.

## Observação

A publicação exige que o repositório exista e que a conta tenha permissão para GitHub Actions e GitHub Pages. Conectar o GitHub ao ChatGPT não ativa o Pages por si só.

## Ciclo 06

O ciclo 06 atualiza vida, dano por contato, invulnerabilidade, fim de partida e HUD. O build do Vite usa `src/` e publica o conteúdo de `dist/`.

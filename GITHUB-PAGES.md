# Publicação GitHub Pages — ERA: Evolution

A branch `main` tem workflow em `.github/workflows/deploy.yml`, que executa `npm install`, `npm test` e `npm run build` antes de publicar `dist/`.

- Jogo: https://nikolascaldeira.github.io/era-evolution/
- Teste direto do chefe: https://nikolascaldeira.github.io/era-evolution/?testeChefe=1

Em **Settings → Pages → Build and deployment**, usa GitHub Actions. O projeto Vite usa caminho relativo `base:'./'` para funcionar sob `/era-evolution/`.

# FERRUM — Showroom Automotivo

Site demonstrativo Or7.dev.

## Desenvolvimento

```bash
npm ci
npm run dev
```

## GitHub Pages

Repositório `showroom-automotivo-demo`, branch `main`. Em Settings → Pages, escolha **GitHub Actions**. O fluxo `.github/workflows/deploy.yml` faz build e deploy automaticamente.

URL: https://lorenzo-or7.github.io/showroom-automotivo-demo/

Rotas React usam o basename `/showroom-automotivo-demo/`. O build copia `index.html` para `404.html` para permitir atualização de páginas internas no GitHub Pages.

Fotografias carregadas do Unsplash requerem internet.

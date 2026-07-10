# HBW Website (Preview)

Statisches HTML/CSS/JS-Setup ohne npm-Abhängigkeiten. Eigenes kleines Build-Skript (`build.js`, nur Node-Bordmittel) setzt Layout, Header/Footer und Seiteninhalte zu fertigen HTML-Dateien in `dist/` zusammen.

## Lokal bauen

```
npm run build
```
(entspricht `node build.js`, keine Installation nötig)

## Struktur

- `partials/` – Layout, Header, Footer
- `pages/*.content.html` – Seiteninhalte (nur der Main-Bereich)
- `pages.config.js` – Seiten-Liste (Titel, Slug, aktive Navigation)
- `styles/main.css` – gesamtes Styling, Farb-Variablen aus dem CD
- `assets/` – Icons, Bilder, `main.js`
- `dist/` – Build-Output (nicht versioniert, wird bei jedem Build neu erzeugt)

## Vercel-Konfiguration

`vercel.json` ist bereits enthalten:
- Build Command: `node build.js`
- Output Directory: `dist`
- Install Command: übersprungen (keine Dependencies)

Beim Verbinden des Repos mit Vercel sollte das automatisch erkannt werden.

# PowderSolve

Offline-capable, static web app for thermoset powder coating troubleshooting.

## Run locally

Because browsers may block `fetch()` from `file://`, run a local server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in the `powdersolve-app` folder.

## Deployment

Upload this folder to Netlify, GitHub Pages, Cloudflare Pages, or any static hosting provider.

## Important controls

- Cure profiles are illustrative education curves, not production cure recipes.
- The app does not replace the product TDS/SDS, equipment manual, site risk assessment, or qualified process approval.
- Records should be reviewed and version-controlled before controlled production release.

# PowderSolve

Conversational, rules-first troubleshooting app for thermoset powder coating. Static site served by GitHub Pages.

## Files

| File | Role |
|---|---|
| `index.html` | Page shell and navigation |
| `app.js` | Search, diagnostic conversation, cure graphs, all rendering |
| `styles.css` | Styles |
| `data.json` | **The knowledge base the live app reads at runtime** |
| `sw.js` | Service worker (network-first; cache is an offline fallback only) |
| `manifest.webmanifest` | Install metadata |

The Excel master workbook is the editing/review source, but GitHub Pages never reads it. Any knowledge-base change must be exported into `data.json` before it appears in the app.

## data.json sections

`Problems` (88), `Diagnostic_Questions`, `Diagnostic_Rules` (linked to problems via `Applies to problem IDs`), `Visual_Guide`, `Sources`, `Source_Leads`, `Cure_Profiles` (IFS curves), `Cure_Schedules` (IFS), `Cure_Product_Windows` (PPG), `Cure_Diagnostic_Matrix`, `Conversation`, `README`.

Every cure record's `Source` / `Source ID` must match a `Source ID` in `Sources`.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080` (browsers block `fetch()` from `file://`).

## Important controls

- Cure curves, schedules and product windows are source-attributed manufacturer reference data (IFS, PPG), not universal recipes. The product-specific TDS always controls, and cure is judged by part metal temperature (PMT).
- The earlier illustrative heat-up model (aluminium / mild steel / cast iron thickness profiles, τ values) was removed and must not be restored as real cure data.
- If a source does not provide a value, PowderSolve must not invent it.
- Records marked Draft need technical review before controlled production release.
- The app does not replace the product TDS/SDS, equipment manual, site risk assessment, or qualified process approval.

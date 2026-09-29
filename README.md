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

`Problems` (88), `Diagnostic_Questions`, `Diagnostic_Rules` (linked to problems via `Applies to problem IDs`), `Diagnostic_Pathways` (branching question trees), `Visual_Guide`, `Sources`, `Source_Leads`, `Cure_Profiles` (IFS curves), `Cure_Schedules` (IFS), `Cure_Product_Windows` (PPG), `Cure_Diagnostic_Matrix`, `Conversation`, `README`.

Every cure record's `Source` / `Source ID` must match a `Source ID` in `Sources`.

## Diagnostic pathways

`Diagnostic_Pathways` holds branching question trees. Each pathway lists its `Entry problems`, a `Start` node and `Nodes`. Each option has a `next` node (or `null` to finish) and may add `focus` (problem IDs to show under "Also check") and a `note` (why). Every question and note cites the existing records it is derived from (`basis`); pathways must not introduce new technical values. Problems without a pathway fall back to a simple question list built from their own `questions` field. All pathways are currently **Draft**.

## Heat-up time by metal thickness (Cure profiles tab)

`Heat_Up_Model` in data.json drives an estimator of how long different thicknesses take to reach the cure PMT. It is **not** the removed illustrative model:

- It never assumes an oven heat-transfer rate. Relative times (e.g. 6 mm steel ≈ 2× 3 mm steel) come from density × specific heat × heated thickness alone.
- Minutes appear only after the user enters one real profiler reading from their own oven, which calibrates the model; it is labelled as an estimate for that oven and loading.
- Material constants are sourced (`SRC-PHYS-CP`, `SRC-PHYS-DENSITY`) and live in data.json, not app.js.
- Cure targets come from the manufacturer data or the user's own TDS.

## Before committing data changes

```bash
python tools/validate_data.py
```

Checks JSON validity, duplicate sections, empty problem fields, source links, rule links and pathway integrity (unknown nodes/problems, unreachable nodes, loops). It cannot judge technical correctness.

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

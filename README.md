# Chemie Trainer — MVP (Production-grade static)

Dieses Repository enthält ein **production-ready static MVP** für a chemistry teaching tool:
- Algebraic equation balancer (rational solver)
- Robust formula parser (parentheses, charges)
- Electron configuration generator (Aufbau + common exceptions)
- Stoichiometry helpers (molar mass, mol↔g)
- LocalStorage wrapper, DevTests, accessible UI, print CSS

## Files
- `index.html` — entry page (static)
- `css/style.css` — styling (responsive + print)
- `js/`:
  - `data.js` — element DB (expandable)
  - `utils.storage.js` — safe localStorage wrapper
  - `parser.js` — formula parser
  - `balancer.js` — algebraic balancer using rational arithmetic
  - `electronConfig.js` — electron configuration generator
  - `stoichiometry.js` — molar mass and conversions
  - `devtests.js` — unit tests for MVP cases
  - `main.js` — UI glue

## Deploy (Vercel)
1. Push repository to GitHub.
2. Create New Project on Vercel and import the repo.
3. Choose **Other** (static). Root: `/`.
4. Deploy — Vercel will publish the static site.

## Contact
If you want, I can:
- Expand element DB to 1..118,
- Move balancer to WebWorker and add step-by-step explanations,
- Produce an all-in-one single-file HTML for easy distribution.

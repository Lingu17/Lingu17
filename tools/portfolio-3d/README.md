# Portfolio models

Original source geometry and labels for the profile's static 3D artwork. Every scene represents a verified project workflow; see the root `PORTFOLIO-VERIFICATION.md`.

## Reproduce

From this directory:

```sh
npm ci
python -m pip install playwright
python -m playwright install chromium
python render.py
```

The script uses a local Edge installation when present, otherwise Playwright Chromium. An explicit browser executable can be supplied with `--browser`. Three 1600 × 900 project PNGs and a 1600 × 970 hero are exported to the root `assets/` directory. Use `--output` to export to a different directory.

## Edit

- `models.js`: data-derived repository relief, curved cutaway document pages, directed module-import graph, selected revision paths, camera and lighting.
- `index.html`: deterministic typography, hero/project layout and verified workflow labels.
- `render.py`: local-only rendering and PNG export.

The browser is used only to build assets. The GitHub README contains no executable renderer. Source filenames illustrate real repository entities; the scenes do not depict a recorded query or PR analysis. PR A/B are conceptual placeholders. Whitespace lines represent schematic source text, not invented code.

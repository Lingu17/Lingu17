# profile-3d

Renders every image in `assets/profile/` for the profile README: Three.js scenes captured frame by
frame in headless Chrome and encoded as looping animated WebP (static PNG for the toolkit and the
link buttons). Each image has a desktop version and a phone version, picked with `<picture>`.

```bash
npm install
npm run render                      # everything (needs Chrome or Edge, and ffmpeg on PATH)
npm run render -- hero              # only jobs whose name contains "hero"
npm run render -- hero --still 0.3  # one PNG preview per job in frames/, no encoding
npm run render -- --check           # step through every loop; report 3D labels that clip
```

The cameras are still and only the meaningful parts move (the test run, the packet, the pulses,
the passages), so each frame changes a small region and the WebP files stay small: about 2.6 MB
for the hero, under 1 MB per project card.

| File | What it is |
| --- | --- |
| `content.js` | Every word and number in the images, from the 2026 résumé and the portfolio |
| `scene.html`, `scene.css` | The card layout, in the portfolio's dark theme |
| `scene.js` | The scenes: `?view=hero\|ledgerline\|codeforge\|intervexa\|vericore\|toolkit\|button&layout=desktop\|mobile` |
| `render.mjs` | Serves the page, steps time with `window.frame(t)`, captures and encodes |
| `data/codeforge-atlas.json` | Code Forge AI's backend modules and imports at commit `62d8979`, from the portfolio snapshot |

What each scene shows:

- **Hero**: 991 cubes, one per automated test documented in the project READMEs (Ledgerline 651,
  Intervexa 185 + 14, Code Forge AI 119 + 22), with a test run rolling across them.
- **Ledgerline**: a signed answer travels from the payer's agent through three checks, and the plan
  changes from a refund to a credit.
- **Code Forge AI**: the 21 backend modules as towers, height from file size, with their 36 imports.
- **Intervexa**: two branches that each pass, merging into `KeyError: 'token'`.
- **Vericore**: passages cross a relevance gate into the answer; one below the threshold never reaches
  the model.

Every animation is periodic in `t`, so the loops have no seam. `render.mjs` reports any 3D label that
leaves the canvas or runs into the text column, with the moment it happens.

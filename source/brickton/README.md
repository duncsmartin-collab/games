# Brickton Cabs source

The game is written in `src/` and joined into one page:

- `python3 build-site.py` (run from this folder, with `site/` next to it) writes `site/index.html` for GitHub Pages.
- `python3 build.py` writes the single-file preview used for the Claude artifact (three.js from cdnjs).

`src/page.html` holds the styles and on-screen controls; `1-core.js` … `8-ui.js` are the game in load order.
After building, copy `site/index.html` into the `brickton/` folder of the games repository and bump `CACHE` in `sw.js` so tablets pick up the new version.

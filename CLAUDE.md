# Notes for Claude

- The game lives in `tactics/`. Build with `python3 tactics/tools/build.py` (it writes `tactics/index.html`).
- **Before designing or changing a stage or side story, read `tactics/MECHANICS.md`**: terrain, AI, objectives, stars,
  stage fields, what has been taught where, and the recommended-level line. Reuse mechanics across stages.
- **Keep `tactics/MECHANICS.md` up to date** whenever a mechanic is added or a stage starts using one.
- Art and data conventions are in `tactics/README.md` and in the comments at the top of each `tactics/src/js/*.js` data file.
- The installable game is hosted at https://georgefseager-pixel.github.io/rae-rabbit/toy-wars/ from the `toy-wars/` folder on
  `main` (the root of `main` is a different game). After a build worth sharing, copy `tactics/web/*` there and push `main`.

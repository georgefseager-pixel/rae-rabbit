# Notes for Claude

- The game lives in `tactics/`. Build with `python3 tactics/tools/build.py` (it writes `tactics/index.html`).
- **Before designing or changing a stage or side story, read `tactics/MECHANICS.md`**: terrain, AI, objectives, stars,
  stage fields, what has been taught where, and the recommended-level line. Reuse mechanics across stages.
- **Before writing any story text, dialogue, supports or descriptions, read `tactics/WRITING.md`** (plain, clear prose in
  each character's own voice; no quippy button endings, aphorisms or airy riffing).
- **Keep `tactics/MECHANICS.md` up to date** whenever a mechanic is added or a stage starts using one.
- Art and data conventions are in `tactics/README.md` and in the comments at the top of each `tactics/src/js/*.js` data file.
- The installable game is hosted at https://georgefseager-pixel.github.io/rae-rabbit/toy-wars/ from the `toy-wars/` folder on
  `main` (the root of `main` is a different game). After a build worth sharing, copy `tactics/web/*` there and push `main`.
- **Side stories never introduce characters that can't be drawn with existing generic art.** Their new faces (bosses,
  allies, speakers) use a generic look (`look` + `fur`/`elite` on the spawn, or a speaker's `look`), never a new plush placeholder.
- **Seasonal events open from early Chapter Two** (with the Camp, after R2-1 / F2-1). Event stories, maps, speakers, costumes
  and generic soldiers may only use characters, places and art a player is guaranteed to have met by then (e.g. Rae, Flopsy,
  Willow, Tiggle, Biggle; mine rabbits, Republic troops, frog soldiers). No later-chapter characters (pirates, monkeys, Tilly,
  Princess, gladiators…) and no banner-only characters in the story. A new event ★★★ can be a brand-new character.

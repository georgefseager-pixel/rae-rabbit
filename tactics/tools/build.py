#!/usr/bin/env python3
"""Build tactics/index.html from tactics/src/.

- src/shell.html is the page skeleton.
- src/style.css is inlined at /*@CSS*/.
- src/js/*.js are concatenated in filename order into one closure at <!--@JS-->,
  so top-level names in one file are visible to the others.
- Every image in art/ is embedded as a data URI at <!--@ART-->, because the phone
  app's artifact viewer does not reliably load images by relative path.
  Name art files <character>-<kind>.png, e.g. rae-portrait.png (front-facing,
  transparent background) and rae-battle.png (side-on battle pose, facing right).

Usage: python3 tactics/tools/build.py
"""
import base64, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

art = {}
for f in sorted((ROOT / "art").glob("*.png")):
    m = re.fullmatch(r"([a-z0-9]+)-([a-z]+)\.png", f.name)
    if not m:
        print("skipping art file with unexpected name:", f.name)
        continue
    art.setdefault(m[1], {})[m[2]] = "data:image/png;base64," + base64.b64encode(f.read_bytes()).decode()

js = "\n".join(f"// ---------------- {p.name} ----------------\n{p.read_text()}" for p in sorted((SRC / "js").glob("*.js")))
html = (SRC / "shell.html").read_text()
for marker, value in [
    ("/*@CSS*/", (SRC / "style.css").read_text()),
    ("<!--@ART-->", "<script>window.GAME_ART=" + json.dumps(art) + ";</script>"),
    ("<!--@JS-->", '<script>\n(() => {\n"use strict";\n' + js + "\n})();\n</script>"),
]:
    assert html.count(marker) == 1, f"marker {marker} must appear exactly once in shell.html"
    html = html.replace(marker, value)

out = ROOT / "index.html"
out.write_text(html)
print(f"built {out.relative_to(ROOT.parent)}: {len(html)//1024} KB, art for {', '.join(art) or 'nobody'}")

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
import base64, io, json, pathlib, re
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

art = {}
MASKS = ("mask", "skin", "armour")
SIZES = {"portrait": 720, "battle": 512, "token": 256}   # max height (token: width) as embedded   # recolour masks stay lossless PNG so they line up exactly

def embed(f, key, kind):
    """Character art is embedded as WebP (much smaller, keeps transparency); masks and JPEG
    backgrounds as they are. Images are capped at SIZES, plenty for a phone screen."""
    if f.suffix == ".jpg":
        return "data:image/jpeg;base64," + base64.b64encode(f.read_bytes()).decode()
    if key.endswith(MASKS):
        return "data:image/png;base64," + base64.b64encode(f.read_bytes()).decode()
    im = Image.open(f).convert("RGBA")
    if kind == "token" and im.width > SIZES["token"]:
        im = im.resize((SIZES["token"], round(im.height * SIZES["token"] / im.width)), Image.LANCZOS)
    elif kind in SIZES and im.height > SIZES[kind]:
        im = im.resize((round(im.width * SIZES[kind] / im.height), SIZES[kind]), Image.LANCZOS)
    # a light smoothing of the colour (not the outline) removes palette speckle, which compresses badly
    a = im.getchannel("A"); im = im.filter(ImageFilter.GaussianBlur(.5)); im.putalpha(a)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=75, method=4)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

for f in sorted([*(ROOT / "art").glob("*.png"), *(ROOT / "art").glob("*.jpg")]):
    m = re.fullmatch(r"([a-z0-9]+)-([a-z]+)\.(png|jpg)", f.name)
    if not m:
        print("skipping art file with unexpected name:", f.name)
        continue
    art.setdefault(m[1], {})[m[2]] = embed(f, m[1], m[2])

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

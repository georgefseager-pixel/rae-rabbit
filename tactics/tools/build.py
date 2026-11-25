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

import hashlib
CACHE = ROOT / "tools" / ".artcache"   # encoded images, by source file contents (slow WebP effort, so only redone when art changes)
CACHE.mkdir(exist_ok=True)
def embed(f, key, kind):
    h = hashlib.sha1(f.read_bytes() + f"{key}|{kind}|v5".encode()).hexdigest()
    c = CACHE / h
    if c.exists(): return c.read_text()
    out = _embed(f, key, kind); c.write_text(out); return out

def _embed(f, key, kind):
    """Character art is embedded as WebP (much smaller, keeps transparency); masks and JPEG
    backgrounds as they are. Images are capped at SIZES, plenty for a phone screen."""
    if f.suffix == ".jpg":   # painted backgrounds: WebP at quality 80 is visually the same and about a fifth smaller
        buf = io.BytesIO(); Image.open(f).convert("RGB").save(buf, "WEBP", quality=80, method=6)
        return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    if key.endswith(MASKS):   # lossless WebP: exactly the same pixels as the PNG, about half the size
        buf = io.BytesIO(); Image.open(f).save(buf, "WEBP", lossless=True, method=6)
        return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    im = Image.open(f).convert("RGBA")
    if kind == "token" and im.width > SIZES["token"]:
        im = im.resize((SIZES["token"], round(im.height * SIZES["token"] / im.width)), Image.LANCZOS)
    elif kind in SIZES and im.height > SIZES[kind]:
        im = im.resize((round(im.width * SIZES[kind] / im.height), SIZES[kind]), Image.LANCZOS)
    # a light smoothing of the colour (not the outline) removes palette speckle, which compresses badly
    a = im.getchannel("A"); im = im.filter(ImageFilter.GaussianBlur(.5)); im.putalpha(a)
    # method 6: same quality, smaller file. alpha_quality 60: the transparent edges compress too (lossless edges were
    # about a fifth of every character image; at 60 they look the same, even zoomed in)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=75, alpha_quality=60, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

for f in sorted([*(ROOT / "art").glob("*.png"), *(ROOT / "art").glob("*.jpg")]):
    if f.name == "loading.jpg": continue   # the loading screen: inlined at the top of the page instead (/*@LOADIMG*/)
    m = re.fullmatch(r"([a-z0-9]+)-([a-z]+)\.(png|jpg)", f.name)
    if not m:
        print("skipping art file with unexpected name:", f.name)
        continue
    art.setdefault(m[1], {})[m[2]] = embed(f, m[1], m[2])

js = "\n".join(f"// ---------------- {p.name} ----------------\n{p.read_text()}" for p in sorted((SRC / "js").glob("*.js")))
html = (SRC / "shell.html").read_text()
_lb = io.BytesIO(); Image.open(ROOT / "art" / "loading.jpg").save(_lb, "WEBP", quality=80, method=6)
load_img = "data:image/webp;base64," + base64.b64encode(_lb.getvalue()).decode()
html = html.replace("/*@LOADIMG*/", load_img)
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

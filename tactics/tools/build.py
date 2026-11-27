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
BG_Q = 62   # WebP quality for the painted backgrounds (and the loading screen)
def embed(f, key, kind):
    h = hashlib.sha1(f.read_bytes() + f"{key}|{kind}|v5{BG_Q if f.suffix == '.jpg' else ''}".encode()).hexdigest()
    c = CACHE / h
    if c.exists(): return c.read_text()
    out = _embed(f, key, kind); c.write_text(out); return out

def _embed(f, key, kind):
    """Character art is embedded as WebP (much smaller, keeps transparency); masks and JPEG
    backgrounds as they are. Images are capped at SIZES, plenty for a phone screen."""
    if f.suffix == ".jpg":   # painted backgrounds: WebP at BG_Q (side by side with 80, the same on a phone; about a third smaller)
        buf = io.BytesIO(); Image.open(f).convert("RGB").save(buf, "WEBP", quality=BG_Q, method=6)
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
_lb = io.BytesIO(); Image.open(ROOT / "art" / "loading.jpg").save(_lb, "WEBP", quality=BG_Q, method=6)
load_img = "data:image/webp;base64," + base64.b64encode(_lb.getvalue()).decode()
html = html.replace("/*@LOADIMG*/", load_img)
for marker, value in [
    ("/*@CSS*/", (SRC / "style.css").read_text()),
    ("<!--@ART-->", "<script>window.GAME_ART=" + json.dumps(art) + ";</script>"),
    ("<!--@JS-->", '<script>\n(() => {\n"use strict";\n' + js + "\n})();\n</script>"),
]:
    assert html.count(marker) == 1, f"marker {marker} must appear exactly once in shell.html"
    html = html.replace(marker, value)

# Check the game's code as one script (the files share one scope, so e.g. two files declaring the same name would stop
# the whole game from starting). Needs node; skipped if it isn't installed.
import shutil, subprocess, tempfile
if shutil.which("node"):
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as _t: _t.write('(() => {\n"use strict";\n' + js + "\n})();\n")
    _r = subprocess.run(["node", "--check", _t.name], capture_output=True, text=True); pathlib.Path(_t.name).unlink()
    if _r.returncode: raise SystemExit("The game's code doesn't parse as one script:\n" + _r.stderr)

# a build id: changes whenever the game changes, so an installed copy knows when a new version has been published
build_id = hashlib.sha1(html.encode()).hexdigest()[:12]
assert html.count("/*@BUILD*/") == 1, "the build id marker must appear exactly once (68-app.js)"
html = html.replace("/*@BUILD*/", build_id)

out = ROOT / "index.html"
out.write_text(html)

# ---- tactics/web/: the same game as an installable web app, for hosting on a website ----
# index.html (a full page that links the app manifest), manifest.webmanifest, sw.js (offline copy),
# icon-192.png / icon-512.png (a close-up of Rae's portrait over the arena), and version.json (the newest build id).
WEB = ROOT / "web"; WEB.mkdir(exist_ok=True)
head = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#120c08"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png">
</head><body>
"""
(WEB / "index.html").write_text(head + html + "\n</body></html>\n")
# the app icon: a close-up of Rae's face from her portrait (art/rae-portrait.png, her look from Chapter Two on), over a
# soft, dimmed hint of the tournament arena (art/bg-arena.jpg). Phones crop icons to a circle or a rounded square, so the
# face sits in the middle of the safe zone.
def app_icon(n):
    from PIL import ImageDraw, ImageEnhance
    S = 1024
    arena = Image.open(ROOT / "art" / "bg-arena.jpg").convert("RGB")
    a = arena.crop((150, 330, 150 + 480, 330 + 480)).resize((S, S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(9))
    a = ImageEnhance.Brightness(ImageEnhance.Color(a).enhance(.85)).enhance(.62).convert("RGBA")
    vg = Image.new("L", (S, S), 0); ImageDraw.Draw(vg).ellipse((-S*.15, -S*.15, S*1.15, S*1.15), fill=255)
    vg = vg.filter(ImageFilter.GaussianBlur(S/7)); dark = Image.new("RGBA", (S, S), (20, 10, 6, 255))
    bg = Image.composite(a, dark, vg)
    por = Image.open(ROOT / "art" / "rae-portrait.png").convert("RGBA")
    cx, cy, half = 258, 132, 165   # her face, from the brow of the ears to the top of the scarf
    face = por.crop((cx - half, cy - half, cx + half, cy + half)).resize((S, S), Image.LANCZOS)
    sh = Image.new("RGBA", (S, S), (0, 0, 0, 0)); sh.putalpha(face.getchannel("A").point(lambda v: v*.5)); sh = sh.filter(ImageFilter.GaussianBlur(S/60))
    bg.alpha_composite(sh, (S//90, S//60)); bg.alpha_composite(face)
    return bg.resize((n, n), Image.LANCZOS).convert("RGB")
for n in (192, 512): app_icon(n).save(WEB / f"icon-{n}.png", optimize=True)
(WEB / "manifest.webmanifest").write_text(json.dumps({
    "name": "Toy Wars", "short_name": "Toy Wars", "start_url": "./", "scope": "./", "display": "standalone",
    "orientation": "portrait", "background_color": "#120c08", "theme_color": "#120c08",
    "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
              {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}]}, indent=1))
(WEB / "version.json").write_text(json.dumps({"build": build_id}))
(WEB / "sw.js").write_text("""// Toy Wars offline copy. The game is one page: keep the last copy and open it straight away, online or not.
// The game itself checks version.json and fetches new versions into this cache (68-app.js).
const CACHE = 'toy-wars';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'].map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin || url.pathname.endsWith('version.json')) return;
  // the game's own update check asks for a fresh copy (cache: 'reload'): let it reach the network, not this cache
  if (req.cache === 'reload' || req.cache === 'no-store') return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.open(CACHE).then(async c => (await c.match(key)) || fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; })));
});
""")
print(f"built {out.relative_to(ROOT.parent)}: {len(html)//1024} KB, art for {', '.join(art) or 'nobody'}")

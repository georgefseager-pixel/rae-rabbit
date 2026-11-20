# Mine-rabbit art cutout and masks

One-off scripts used to cut out the generic mine-rabbit art and build its keep-masks
(`art/minermask-*.png`: the loincloth, rope, ear linings, nose and eyes that keep their
colour when the fur is recoloured). They read the original uploads and intermediate
files from a scratch folder, so they are kept as a record of how the masks were made,
not as a ready-to-run tool. In order: rembg (u2net) alpha → `cutout.py` (cut along the
ink outline, which removes the gap between arm and body) → `masks.py` (split the cloth
area at its ink lines) → `fixp*.py` (hand corrections on the portrait: thigh fur between
the ropes, torn edges) → `final.py` (ear linings by pinkness, nose, eyes; crop, resize, save).
If the generic art is replaced, the masks have to be redone.

import numpy as np
from PIL import Image, ImageFilter
from ropefix import poly
A='/home/user/rae-rabbit/tactics/art/'
o=Image.open(A+'miner-battle.png'); W,H=o.size
keep=np.array(Image.open(A+'minermask-battle.png').split()[-1]).astype(float)/255
P=poly((W,H),[(207,163),(220,142),(230,127),(237,124),(239,148),(237,166),(226,167)])
alpha=np.array(o.convert('RGBA'))[...,3]>128
add=np.array(Image.fromarray((P&alpha).astype(np.uint8)*255).filter(ImageFilter.GaussianBlur(.8))).astype(float)/255
new=np.maximum(keep,add)
out=Image.new('LA',(W,H),255); out.putalpha(Image.fromarray((new*255).astype(np.uint8))); out.save(A+'minermask-battle.png',optimize=True)

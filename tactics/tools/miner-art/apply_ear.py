import numpy as np
from PIL import Image, ImageFilter
from ropefix import poly
A='/home/user/rae-rabbit/tactics/art/'
o=Image.open(A+'miner-portrait.png'); W,H=o.size
keep=np.array(Image.open(A+'minermask-portrait.png').split()[-1]).astype(float)/255
P=poly((W,H),[(195,46),(168,56),(142,74),(122,97),(105,120),(90,140),(75,162),(70,178),(120,178),(149,155),(149,112),(160,85),(178,62),(200,50)])
alpha=np.array(o.convert('RGBA'))[...,3]>128
add=np.array(Image.fromarray((P&alpha).astype(np.uint8)*255).filter(ImageFilter.GaussianBlur(.8))).astype(float)/255
new=np.maximum(keep,add)
out=Image.new('LA',(W,H),255); out.putalpha(Image.fromarray((new*255).astype(np.uint8))); out.save(A+'minermask-portrait.png',optimize=True)

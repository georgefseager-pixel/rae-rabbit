import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import ov
from fixp import poly, SZ
x=np.array(Image.open(ov.U+ov.SRC['portrait']).convert('RGB')).astype(float); r,g,b=x[...,0],x[...,1],x[...,2]
lum=(r+g+b)/3
fig=np.load('fig_portrait.npy'); m=np.load('cloth3_portrait.npy')
EDGE=poly(SZ,[(650,745),(705,795),(705,905),(690,1000),(625,1012),(575,1085),(495,1095),(485,1010),(610,985),(640,955),(645,880)])
clothy=((r-b)<81)&(lum>110)
ink=lum<75
for _ in range(25):
    m |= ndimage.binary_dilation(m)&EDGE&fig&(clothy|ink)
# ink pixels only count if they border cloth on both sides: drop ink that ended up only touching fur
m = ndimage.binary_opening(m, iterations=1) | np.load('cloth3_portrait.npy')
m = ndimage.binary_fill_holes(m)&fig
np.save('cloth4_portrait.npy',m)
ov.ov('portrait',m,(440,740,720,1100),3,'ov4_portrait.png')

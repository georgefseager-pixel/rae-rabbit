import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from skin import hsl
A='/home/user/rae-rabbit/tactics/art/'
im=Image.open(A+'minerbulk-portrait.png').convert('RGBA'); x=np.array(im).astype(float); a=x[...,3]>128; W,H=im.size
h,s,l=hsl(x[...,:3]/255)
def poly(pts):
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
EARS=[[(135,88),(148,102),(130,130),(110,170),(95,210),(80,250),(62,290),(45,322),(26,326),(20,300),(30,255),(48,205),(70,160),(100,118)],
      [(322,98),(345,108),(372,150),(392,200),(407,250),(417,300),(422,342),(405,348),(380,302),(355,262),(332,232),(320,200),(316,150)]]
ears=np.zeros_like(a)
for p in EARS: ears|=poly(p)
ears&=(h<23.5)&(l>.22)&a
ears=ndimage.binary_fill_holes(ndimage.binary_closing(ears,iterations=3))&poly(EARS[0])|ndimage.binary_fill_holes(ndimage.binary_closing(ears,iterations=3))&poly(EARS[1])
nose=poly([(272,132),(302,135),(300,150),(287,162),(273,148)])&a
eyes=np.zeros_like(a)
for cx,cy,r in [(212,112,15),(321,148,9)]:
    yy,xx=np.mgrid[0:H,0:W]; eyes|=((xx-cx)**2+(yy-cy)**2<r*r)&(l<.3)
eyes=ndimage.binary_fill_holes(eyes)
cloth=np.load('bk_cloth.npy')
keep=ears|nose|eyes|cloth
np.save('bk_keep.npy',keep)
v=x[...,:3].copy(); v[~a]=40; v[keep]=v[keep]*.45+np.array([0,220,255])*.55
Image.fromarray(v.astype(np.uint8)).save('bk_keep.png')
k=Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8)); o=Image.new('LA',(W,H),255); o.putalpha(k); o.save(A+'minerbulkmask-portrait.png',optimize=True)

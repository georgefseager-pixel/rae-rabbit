import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from skin import hsl
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'; A='/home/user/rae-rabbit/tactics/art/'
rgb=Image.open(U+'92f66f4e-image.png').convert('RGB'); x=np.array(rgb).astype(float); f=np.load('el_final.npy'); W,H=rgb.size
h,s,l=hsl(x/255)
def poly(pts):
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
EARS=[[(170,180),(280,110),(380,140),(350,300),(320,420),(270,560),(225,580),(170,560),(150,440),(150,320)],
      [(630,170),(760,170),(800,300),(820,440),(810,590),(760,600),(700,520),(660,440),(630,330)]]
NOSE=[(585,255),(650,255),(645,300),(615,320),(590,295)]
zone=poly(EARS[0])|poly(EARS[1])
pink=(h<20.5)&(l>.25)&(s>.25)&zone&f
pink=ndimage.binary_fill_holes(ndimage.binary_closing(ndimage.binary_opening(pink,iterations=1),iterations=4))
lab,n=ndimage.label(pink); sz=ndimage.sum(pink,lab,range(1,n+1)); pink=np.isin(lab,[i+1 for i,v in enumerate(sz) if v>2000])
soft=(h<21.5)&(l>.2)&zone&f
for _ in range(25): pink|=ndimage.binary_dilation(pink)&soft
pink=ndimage.binary_fill_holes(ndimage.binary_closing(pink,iterations=3))
nose=poly(NOSE)&(h<22)&(s>.3)&f; nose=ndimage.binary_fill_holes(ndimage.binary_closing(nose,iterations=2))
eyes=np.zeros_like(f); yy,xx=np.mgrid[0:H,0:W]
for cx,cy,r in [(500,210,26),(665,240,18)]: eyes|=((xx-cx)**2+(yy-cy)**2<r*r)&(l<.3)
eyes=ndimage.binary_fill_holes(eyes)
cloth=np.load('el_c_80.npy')
keep=(pink|nose|eyes|cloth)&f
np.save('el_keep.npy',keep)
v=x.copy(); v[~f]=40; v[keep]=v[keep]*.45+np.array([0,220,255])*.55
Image.fromarray(v.astype(np.uint8)).resize((512,768)).save('el_keep.png')
bbox=Image.fromarray((f*255).astype(np.uint8)).getbbox(); ns=Image.open(A+'minerold-portrait.png').size
k=Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8)).crop(bbox).resize(ns,Image.LANCZOS)
o=Image.new('LA',ns,255); o.putalpha(k); o.save(A+'minerold' + 'mask-portrait.png',optimize=True)

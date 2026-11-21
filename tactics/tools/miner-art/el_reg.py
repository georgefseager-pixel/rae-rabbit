import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
rgb=Image.open(U+'92f66f4e-image.png').convert('RGB'); x=np.array(rgb).astype(float); lum=x.mean(-1); rb=x[...,0]-x[...,2]
f=np.load('el_final.npy')
zone=np.zeros_like(f); zone[700:1200,170:720]=True
walls=ndimage.binary_dilation(lum<95,iterations=1)
free=~walls&f&zone
lab,n=ndimage.label(free); np.save('el_lab.npy',lab)
idx=range(1,n+1); cnt=ndimage.sum(free,lab,idx); mrb=ndimage.mean(rb,lab,idx); ml=ndimage.mean(lum,lab,idx)
cols=np.random.default_rng(5).integers(40,255,(n+1,3)); v=x.copy()
for i,(c,r,L) in enumerate(zip(cnt,mrb,ml),1):
    if c<30: continue
    v[lab==i]=v[lab==i]*.3+cols[i]*.7
im=Image.fromarray(v.astype(np.uint8)).crop((170,700,720,1200)); d=ImageDraw.Draw(im)
for i,(c,r,L) in enumerate(zip(cnt,mrb,ml),1):
    if c<150: continue
    ys,xs=np.nonzero(lab==i); j=np.argmin((ys-np.median(ys))**2+(xs-np.median(xs))**2)
    d.text((xs[j]-170-8,ys[j]-700-5),f'{i}:{r:.0f}',fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
im.save('el_reglab.png')

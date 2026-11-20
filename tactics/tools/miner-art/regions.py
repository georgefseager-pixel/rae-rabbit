import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
A='/home/user/rae-rabbit/tactics/art/'
def regions(k, box, thr, s, out):
    o=Image.open(A+f'miner-{k}.png').convert('RGBA'); x=np.array(o).astype(float); lum=x[...,:3].mean(-1)
    sub=np.zeros(lum.shape,bool); sub[box[1]:box[3],box[0]:box[2]]=True
    free=(lum>thr)&(x[...,3]>128)&sub
    lab,n=ndimage.label(free); np.save(f'reg_{k}.npy',lab)
    rng=np.random.default_rng(3); cols=rng.integers(40,255,(n+1,3))
    vis=x[...,:3].copy()
    for i in range(1,n+1):
        m=lab==i
        if m.sum()>=8: vis[m]=vis[m]*.3+cols[i]*.7
    im=Image.fromarray(vis.astype(np.uint8)).crop(box).resize(((box[2]-box[0])*s,(box[3]-box[1])*s),Image.NEAREST); d=ImageDraw.Draw(im)
    for i in range(1,n+1):
        ys,xs=np.nonzero(lab==i)
        if len(ys)<8: continue
        j=np.argmin((ys-np.median(ys))**2+(xs-np.median(xs))**2)
        d.text(((xs[j]-box[0])*s-4,(ys[j]-box[1])*s-5),str(i),fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
    im.save(out)

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from masks import lining_mask
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
A='/home/user/rae-rabbit/tactics/art/'
SRC={'portrait':'b2a50bb7-image.png','battle':'a08e627e-image.png','token':'ed4620dc-image.png'}
def token_fig():
    a=np.load('u2_token.npy')>110
    a=ndimage.binary_fill_holes(ndimage.binary_closing(a,iterations=3)); a=ndimage.binary_dilation(a,iterations=5)
    lab,n=ndimage.label(a); s=ndimage.sum(a,lab,range(1,n+1)); return lab==np.argmax(s)+1
for kind,size in [('portrait',('h',900)),('battle',('h',640)),('token',('w',512))]:
    rgb=Image.open(U+SRC[kind]).convert('RGB')
    fig=np.load(f'fig_{kind}.npy') if kind!='token' else token_fig()
    keep=lining_mask(kind)&fig
    x=np.array(rgb).astype(float); nose=((x[...,0]-x[...,1])>66)&((x[...,1]-x[...,2])<40)&(x.mean(-1)>90)
    NB={'portrait':(555,235,635,295),'battle':(935,290,995,345),'token':(0,0,9999,9999)}[kind]
    nb=np.zeros_like(nose); nb[NB[1]:NB[3],NB[0]:NB[2]]=True; nose&=nb
    nose=ndimage.binary_fill_holes(ndimage.binary_closing(nose,iterations=2))
    if kind!='token':   # button eyes: the dark blobs in the face, with their highlights
        EB={'portrait':(380,150,680,260),'battle':(820,180,960,300)}[kind]
        lum=x.mean(-1); dark=lum<70; eb=np.zeros_like(dark); eb[EB[1]:EB[3],EB[0]:EB[2]]=True
        lab3,n3=ndimage.label(dark&eb); sz=ndimage.sum(dark,lab3,range(1,n3+1))
        for i in range(n3):
            c=lab3==i+1; ys,xs=np.nonzero(c)
            if sz[i]>200 and (np.ptp(xs)+1)/(np.ptp(ys)+1)<1.8: keep|=ndimage.binary_erosion(ndimage.binary_fill_holes(c),iterations=1)
    nose=ndimage.binary_opening(nose,iterations=1); keep|=ndimage.binary_dilation(nose,iterations=2)&fig
    if kind=='token':
        lab,n=ndimage.label(keep); s=ndimage.sum(keep,lab,range(1,n+1)); order=np.argsort(s)[::-1]
        keep=np.isin(lab,[i+1 for i in order[:3]])      # two ear linings and the nose
        lum=np.array(rgb.convert('L')).astype(float); inner=ndimage.binary_erosion(fig,iterations=40)
        ink=(lum<95)&inner; lab2,n2=ndimage.label(ink)
        for i in range(1,n2+1):
            c=lab2==i
            if c.sum()>150: keep|=ndimage.binary_fill_holes(ndimage.binary_dilation(c,iterations=2))   # eyes (ring + iris), brows, mouth
    else:
        cloth=np.load('cloth5_portrait.npy') if kind=='portrait' else np.load('cloth2_battle.npy')
        if kind=='battle':
            x=np.array(rgb).astype(float); pale=((x[...,0]-x[...,2])<80)&(x.mean(-1)>150)
            top=np.zeros_like(pale); top[580:612,650:725]=True
            for _ in range(8): cloth|=ndimage.binary_dilation(cloth)&pale&top&fig
        keep|=cloth
    soft=Image.fromarray((fig*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0 if kind!='token' else 1.6))
    im=rgb.copy(); im.putalpha(soft)
    bbox=Image.fromarray((fig*255).astype(np.uint8)).getbbox()
    km=Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))
    im=im.crop(bbox); km=km.crop(bbox)
    ns=(round(im.width*size[1]/im.height),size[1]) if size[0]=='h' else (size[1],round(im.height*size[1]/im.width))
    im=im.resize(ns,Image.LANCZOS); km=km.resize(ns,Image.LANCZOS)
    im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.FLOYDSTEINBERG).save(A+f'miner-{kind}.png',optimize=True)
    out=Image.new('LA',ns,255); out.putalpha(km); out.save(A+f'minermask-{kind}.png',optimize=True)
    print(kind, ns)

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from cutout import local_std
def texfig(rgb, thr=5.5, seeds='ltrb'):
    lum=np.array(rgb.convert('L')).astype(float); sd=local_std(lum,3); smooth=sd<thr
    seed=np.zeros_like(smooth)
    if 't' in seeds: seed[0,:]=True
    if 'b' in seeds: seed[-1,:]=True
    if 'l' in seeds: seed[:,0]=True
    if 'r' in seeds: seed[:,-1]=True
    lab,n=ndimage.label(smooth); bg=np.isin(lab,np.unique(lab[seed&smooth]))
    fig=ndimage.binary_opening(~bg,iterations=2)
    lab2,n2=ndimage.label(fig); sz=ndimage.sum(fig,lab2,range(1,n2+1)); fig=lab2==np.argmax(sz)+1
    return ndimage.binary_fill_holes(fig)
def save(rgb,f,path,size,blur=1.0):
    m=Image.fromarray((f*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    im=rgb.copy(); im.putalpha(m); im=im.crop(Image.fromarray((f*255).astype(np.uint8)).getbbox())
    ns=(round(im.width*size[1]/im.height),size[1]) if size[0]=='h' else (size[1],round(im.height*size[1]/im.width))
    im=im.resize(ns,Image.LANCZOS)
    im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.FLOYDSTEINBERG).save(path,optimize=True); return im

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
A='/home/user/rae-rabbit/tactics/art/'
def poly(size,pts):
    m=Image.new('L',size,0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
def refine(k, zone, thr):
    o=Image.open(A+f'miner-{k}.png').convert('RGBA'); x=np.array(o).astype(float)
    lum=x[...,:3].mean(-1); keep=np.array(Image.open(A+f'minermask-{k}.png').split()[-1]).astype(float)/255
    Z=poly(o.size,zone)
    light=(lum>thr)&Z
    light=ndimage.binary_closing(light,iterations=2)
    lab,n=ndimage.label(light); s=ndimage.sum(light,lab,range(1,n+1))
    light=np.isin(lab,[i+1 for i,v in enumerate(s) if v>25])
    light=ndimage.binary_fill_holes(light)
    new=np.where(Z, light.astype(float), keep)
    new=np.array(Image.fromarray((new*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6)))/255
    return new

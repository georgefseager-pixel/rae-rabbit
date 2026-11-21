import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from cutout import local_std
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
def trapped(src, f, thr=3.2, minsz=300):
    rgb=Image.open(U+src).convert('RGB'); x=np.array(rgb).astype(float); lum=x.mean(-1)
    sd=local_std(lum,4); sat=x.max(-1)-x.min(-1)
    cand=(sd<thr)&f&(sat<90)
    cand=ndimage.binary_opening(cand,iterations=2)
    lab,n=ndimage.label(cand); sz=ndimage.sum(cand,lab,range(1,n+1))
    return np.isin(lab,[i+1 for i,s in enumerate(sz) if s>minsz])
if __name__=='__main__':
    for name,src in [('portrait','3b4f8bab-image.png'),('battle','3f5c78fe-image.png')]:
        f=np.load(f'ff_fig_{name}.npy'); t=trapped(src,f)
        x=np.array(Image.open(U+src).convert('RGB')).astype(float); x[~f]=[30,120,30]; x[t]=[255,0,255]
        im=Image.fromarray(x.astype(np.uint8)); im=im.resize((im.width*700//im.height,700)); im.save(f'glow_{name}.png'); print(name,t.sum())

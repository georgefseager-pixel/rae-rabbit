import numpy as np
from PIL import Image
from scipy import ndimage
from cutout import local_std
from texcut import texfig
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
SRC={'portrait':'3d569497-image.png','battle':'753f80b8-image.png'}
ZONES={'portrait':[(440,0,800,280),(540,940,800,1500)],'battle':[(560,0,900,240)]}
def fix(name, thr, r=2, grow=3):
    rgb=Image.open(U+SRC[name]).convert('RGB'); lum=np.array(rgb.convert('L')).astype(float)
    f=texfig(rgb); sd=local_std(lum,r)
    zone=np.zeros_like(f)
    for x0,y0,x1,y1 in ZONES[name]: zone[y0:y1,x0:x1]=True
    sm=(sd<thr)&zone&(lum>70)
    lab,n=ndimage.label(sm)
    outside=ndimage.binary_dilation(~f)                      # touching what's already background
    ids=np.unique(lab[outside&sm]); ids=ids[ids>0]
    # also pockets fully enclosed in the zone that are large and smooth
    sz=ndimage.sum(sm,lab,range(1,n+1))
    ids=set(ids)|{i+1 for i,s in enumerate(sz) if s>250}
    bg=np.isin(lab,list(ids))
    for _ in range(grow): bg|=ndimage.binary_dilation(bg)&zone&(sd<thr*1.6)
    return rgb,f,bg
if __name__=='__main__':
    import sys
    tiles=[]
    for name,boxes in [('portrait',[(440,0,800,280),(540,940,800,1500)]),('battle',[(560,0,900,240)])]:
        for thr in [3,4.5]:
            rgb,f,bg=fix(name,thr); g=f&~bg
            x=np.array(rgb).copy(); x[~g]=[200,30,200]; x[f&bg]=[0,220,255]
            for b in boxes:
                t=Image.fromarray(x).crop(b); t=t.resize((int(t.width*300/t.height),300)); tiles.append(t)
    W=sum(t.width for t in tiles)+10*len(tiles); s=Image.new('RGB',(W,300)); X=0
    for t in tiles: s.paste(t,(X,0)); X+=t.width+10
    s.save('tg_fix.png')

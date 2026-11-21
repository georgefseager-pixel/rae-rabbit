import numpy as np
from PIL import Image
from scipy import ndimage
from cutout import local_std
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
SRC={'portrait':'6bade5db-image.png','battle':'3c7c72bc-image.png'}
def fix(name, thr=4.5, minsz=400):
    rgb=Image.open(U+SRC[name]).convert('RGB'); lum=np.array(rgb.convert('L')).astype(float)
    f=np.load(f'gr_fig_{name}.npy'); sd=local_std(lum,2)
    sm=(sd<thr)&(lum>40)&f
    sm=ndimage.binary_opening(sm,iterations=2)
    lab,n=ndimage.label(sm); sz=ndimage.sum(sm,lab,range(1,n+1))
    bg=np.isin(lab,[i+1 for i,s in enumerate(sz) if s>minsz])
    for _ in range(3): bg|=ndimage.binary_dilation(bg)&f&(sd<thr*1.6)
    return rgb,f,bg
if __name__=='__main__':
    out=[]
    for name in ['portrait','battle']:
        rgb,f,bg=fix(name); x=np.array(rgb).copy(); x[~f]=[200,30,200]; x[bg]=[0,220,255]
        out.append(Image.fromarray(x).resize((rgb.width//2,rgb.height//2)))
    s=Image.new('RGB',(out[0].width+out[1].width+10,out[0].height)); s.paste(out[0],(0,0)); s.paste(out[1],(out[0].width+10,0)); s.save('gr_pk.png')

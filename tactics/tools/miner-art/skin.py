import numpy as np
from PIL import Image
from scipy import ndimage
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
SRC={'portrait':'6bade5db-image.png','battle':'3c7c72bc-image.png','token':'ef6a9afe-image.png'}
def hsl(x):
    mx=x.max(-1); mn=x.min(-1); l=(mx+mn)/2; d=mx-mn
    s=np.where(d==0,0,d/np.maximum(1e-6,np.where(l>.5,2-mx-mn,mx+mn)))
    r,g,b=x[...,0],x[...,1],x[...,2]
    h=np.where(mx==r,((g-b)/(d+1e-9))%6,np.where(mx==g,(b-r)/(d+1e-9)+2,(r-g)/(d+1e-9)+4))*60
    return np.where(d==0,0,h),s,l
def skin_cand(name, lmin=.5):
    x=np.array(Image.open(U+SRC[name]).convert('RGB')).astype(float)/255; h,s,l=hsl(x)
    return (h>62)&(h<110)&(s>.22)&(l>lmin), h,s,l
if __name__=='__main__':
    out=[]
    for name in SRC:
        c,h,s,l=skin_cand(name); f=np.load(f'gr_final_{name}.npy')
        x=np.array(Image.open(U+SRC[name]).convert('RGB')).copy(); x[~f]=[40,40,40]; m=c&f; x[m]=(x[m]*.4+np.array([255,0,255])*.6)
        out.append(Image.fromarray(x.astype(np.uint8)).resize((x.shape[1]//2,x.shape[0]//2)))
    W=sum(o.width for o in out)+20; s=Image.new('RGB',(W,max(o.height for o in out))); X=0
    for o in out: s.paste(o,(X,0)); X+=o.width+10
    s.save('gr_skin.png')

import numpy as np
from PIL import Image
from scipy import ndimage
from skin import hsl, U, SRC
FACE={'portrait':(480,400),'battle':(710,300),'token':(760,560)}
def headmask(name):
    x=np.array(Image.open(U+SRC[name]).convert('RGB')).astype(float)/255; h,s,l=hsl(x)
    f=np.load(f'gr_final_{name}.npy')
    core=(h>48)&(h<74)&(s>.34)&(l>.46)&f
    core=ndimage.binary_closing(core,iterations=2)
    lab,n=ndimage.label(core)
    fx,fy=FACE[name]; win=lab[fy-30:fy+30,fx-30:fx+30]; ids=np.unique(win[win>0])
    sz=ndimage.sum(core,lab,ids); keep=ids[np.argmax(sz)]
    m=lab==keep
    m=ndimage.binary_fill_holes(m)
    soft=(h>42)&(h<80)&(s>.2)&(l>.17)&f            # shaded skin at the edges
    for _ in range(6): m|=ndimage.binary_dilation(m)&soft
    # the shaded neck sits just under the dark chin line: add soft-skin patches right below the face
    ys,xs=np.nonzero(m); cy=ys.mean(); x0,x1=xs.min(),xs.max(); bottom=ys.max()
    sl,sn=ndimage.label(soft&~m); near=ndimage.binary_dilation(m,iterations=8)
    for i in np.unique(sl[near&(sl>0)]):
        c=sl==i; cys,cxs=np.nonzero(c)
        if cys.mean()>ys.min()+0.35*(bottom-ys.min()) and cxs.min()>=x0-35 and cxs.max()<=x1+35 and cys.max()<=bottom+60: m|=c
    m=ndimage.binary_closing(m,iterations=2)
    # leave eyes (dark discs and their highlights), nostrils and the mouth line alone
    dark=(l<.25)&m|(l<.25)&ndimage.binary_fill_holes(m)
    dl,dn=ndimage.label(dark); dsz=ndimage.sum(dark,dl,range(1,dn+1))
    eyes=np.isin(dl,[i+1 for i,v in enumerate(dsz) if v>400])
    eyes=ndimage.binary_erosion(ndimage.binary_fill_holes(eyes),iterations=1)&(l<.5)
    m=ndimage.binary_fill_holes(m)&~eyes&(l>.2)&f
    return m
if __name__=='__main__':
    out=[]
    for name in SRC:
        c=headmask(name); np.save(f'gr_skin_{name}.npy',c); f=np.load(f'gr_final_{name}.npy')
        x=np.array(Image.open(U+SRC[name]).convert('RGB')).astype(float); x[~f]=[40,40,40]; x[c]=x[c]*.4+np.array([255,0,255])*.6
        out.append(Image.fromarray(x.astype(np.uint8)).resize((x.shape[1]//2,x.shape[0]//2)))
    W=sum(o.width for o in out)+20; s=Image.new('RGB',(W,max(o.height for o in out))); X=0
    for o in out: s.paste(o,(X,0)); X+=o.width+10
    s.save('gr_skin.png')

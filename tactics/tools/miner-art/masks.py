from PIL import Image, ImageDraw
import numpy as np, json
from scipy import ndimage
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
SRC={'portrait':'b2a50bb7-image.png','battle':'a08e627e-image.png','token':'ed4620dc-image.png'}
OLD={'portrait':(433,900),'battle':(453,640)}
def old_bbox(name):
    a=np.load(f'u2_{name}.npy').astype(float); a[a<24]=0
    solid=ndimage.binary_fill_holes(a>110)
    lab,n=ndimage.label(a>0); sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
    keep=lab==np.argmax(sizes)+1; m=(np.where(solid,255,a)*keep)>0
    ys,xs=np.nonzero(m); return xs.min(),ys.min(),xs.max()+1,ys.max()+1
def to_orig(name, pts):
    x0,y0,x1,y1=old_bbox(name); sx=(x1-x0)/OLD[name][0]; sy=(y1-y0)/OLD[name][1]
    return [(x0+x*sx, y0+y*sy) for x,y in pts]
def poly(size, pts):
    m=Image.new('L',size,0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
def lining_mask(name):
    rgb=Image.open(U+SRC[name]).convert('RGB'); x=np.array(rgb).astype(float); r,g,b=x[...,0],x[...,1],x[...,2]
    l=(np.max(x,-1)+np.min(x,-1))/510
    pink=np.clip((r-g-25)/20,0,1)*np.clip((24-(g-b))/14,0,1)*(l>.35)
    lining=ndimage.uniform_filter(pink,9)>0.35
    lining=ndimage.binary_fill_holes(ndimage.binary_closing(lining,iterations=3))
    lab,n=ndimage.label(lining); sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
    return np.isin(lab,[i+1 for i,s in enumerate(sizes) if s>30])
P=json.load(open('protect.json'))
CLOTH_PICKED_POLY={'portrait':P['portrait']['polys'][0],'battle':P['battle']['polys'][0]}
BACKFLAPS={'portrait':[[(150,455),(152,467),(142,485),(133,520),(122,535),(108,543),(97,555),(102,530),(115,510),(120,485),(135,467)],
                       [(228,532),(246,532),(253,560),(256,582),(250,597),(242,607),(232,592),(224,570),(219,550)]],'battle':[]}
BANDTOP={'portrait':[(130,405),(195,404),(210,413),(235,427),(260,437),(290,441),(312,440),(330,445),(345,445),(345,700),(60,700),(60,405)]}
def cloth_mask(name, fig):
    rgb=Image.open(U+SRC[name]).convert('RGB'); lum=np.array(rgb.convert('L')).astype(float); size=rgb.size
    region=poly(size,to_orig(name,CLOTH_PICKED_POLY[name]))
    region=ndimage.binary_dilation(region,iterations=10)
    walls=ndimage.binary_dilation(lum<=110,iterations=2)
    free=(~walls)&fig
    lab,n=ndimage.label(free)
    tot=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); inside=ndimage.sum(region,lab,range(1,n+1))
    ids=[i+1 for i in range(n) if tot[i]>=60 and inside[i]/tot[i]>=0.9]
    m=np.isin(lab,ids)
    if name in BANDTOP: m&=poly(size,to_orig(name,BANDTOP[name]))
    for fl in BACKFLAPS[name]: m|=poly(size,to_orig(name,fl))&fig
    m=ndimage.binary_closing(m,iterations=3)
    m=ndimage.binary_fill_holes(m)
    m=ndimage.binary_dilation(m,iterations=3)&fig
    return m
if __name__=='__main__':
    out=[]
    for name,box in [('portrait',(250,560,780,1200)),('battle',(560,470,1000,860))]:
        fig=np.load(f'fig_{name}.npy'); cm=cloth_mask(name,fig); np.save(f'cloth_{name}.npy',cm)
        rgb=np.array(Image.open(U+SRC[name]).convert('RGB')).astype(float)
        vis=rgb.copy(); vis[~fig]=[60,160,60]; vis[cm]=vis[cm]*.45+np.array([0,200,255])*.55
        a=Image.fromarray(rgb.astype(np.uint8)).crop(box); b=Image.fromarray(vis.astype(np.uint8)).crop(box)
        h=520; a=a.resize((int(a.width*h/a.height),h)); b=b.resize(a.size)
        out+= [a,b]
    s=Image.new('RGB',(sum(i.width for i in out)+30,520)); x=0
    for i in out: s.paste(i,(x,0)); x+=i.width+10
    s.save('cloth_new.png')

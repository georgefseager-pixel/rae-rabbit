import numpy as np, sys, json
from PIL import Image, ImageDraw
from scipy import ndimage
from trmask import A, hsl, furmask
IMGS=[('troop','portrait'),('troop','battle'),('troopaxe','battle'),('trooplance','battle'),('troopbow','battle'),('troopbook','battle'),('troop','token')]
P={'h0':18,'h1':33,'l0':.36,'s0':.3,'s1':.7,'min':400}
# hand fixes in pixel coordinates of the art files: erase = never fur, add = fur (warm, not ink) inside the box
FIX=json.load(open('trfix.json')) if __import__('os').path.exists('trfix.json') else {}
def build(key,kind):
    im,x,fur=furmask(key,kind,dict(P, hole=4000 if kind=='token' else 60, busy=27))
    h,s,l=hsl(x); a=x[...,3]>40
    wgt=(s*a*(l>.25)).astype(float); rr=np.deg2rad(h)
    hs=np.rad2deg(np.arctan2(ndimage.gaussian_filter(np.sin(rr)*wgt,4),ndimage.gaussian_filter(np.cos(rr)*wgt,4)))%360
    ss=ndimage.gaussian_filter(s*a,4)/np.maximum(ndimage.gaussian_filter(a.astype(float),4),1e-3)
    pink=(h<16)&(s>.38) | (h>320) | ((hs<18)&(ss>.36))   # the ear linings: a pinker AND more saturated neighbourhood
    gold=(h>=34)&(s>.4)
    C=a&(h>=13)&(h<=42)&(l>.27)&(l<.95)&(s>.15)&~pink&~gold&~((l<.34)&(s<.3))
    seed=ndimage.binary_erosion(fur,iterations=2)
    F=FIX.get(f'{key}-{kind}',{})
    for x0,y0,x1,y1 in F.get('erase',[]): C[y0:y1,x0:x1]=False; seed[y0:y1,x0:x1]=False; fur[y0:y1,x0:x1]=False
    g=seed.copy()
    for _ in range(40): g=(ndimage.binary_dilation(g)&C)|g
    out=g|fur
    holes=ndimage.binary_fill_holes(out)&~out; hl,hn=ndimage.label(holes); hs=ndimage.sum(holes,hl,range(1,hn+1))
    out|=np.isin(hl,[i+1 for i,v in enumerate(hs) if v<80])
    for x0,y0,x1,y1 in F.get('add',[]):
        box=np.zeros_like(out); box[y0:y1,x0:x1]=True
        out|=box&a&(h>=10)&(h<=40)&(l>.25)&(s>.1)
    out&=~pink&~gold
    for poly in F.get('addPoly',[]):   # fur the growth can't reach (shaded back legs): warm pixels inside the outline
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); ImageDraw.Draw(pm).polygon([tuple(p) for p in poly],fill=255)
        out|=(np.array(pm)>0)&a&(h>=8)&(h<=40)&(l>.22)&(s>.1)
    for x0,y0,x1,y1 in F.get('erase',[]): out[y0:y1,x0:x1]=False
    if F.get('onlyPoly'):   # fur only inside these outlines (poses where arms cross the armour)
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); dr=ImageDraw.Draw(pm)
        for poly in F['onlyPoly']: dr.polygon([tuple(p) for p in poly],fill=255)
        out&=np.array(pm)>0
    for poly in F.get('addPoly',[]):
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); ImageDraw.Draw(pm).polygon([tuple(p) for p in poly],fill=255)
        out|=(np.array(pm)>0)&a&(h>=8)&(h<=40)&(l>.22)&(s>.1)&~((l<.3)&(s<.25))
    for poly in F.get('erasePoly',[]):
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); ImageDraw.Draw(pm).polygon([tuple(p) for p in poly],fill=255); out&=~(np.array(pm)>0)
    # legs: inside each shin / foot outline, every warm pixel is fur (whatever the shading)
    if F.get('legPoly'):
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); dr=ImageDraw.Draw(pm)
        for poly in F['legPoly']: dr.polygon([tuple(p) for p in poly],fill=255)
        legs=np.array(pm)>0; lowcut=515
        metal=(s<.2)&(l>.45)   # knee-plate steel
        # the knee plate's rim: anything connected to a smooth, light patch above the shin
        from cutout import local_std
        smooth=(local_std(x[...,:3].mean(-1),2)<9)&(l>.5)
        rim=ndimage.binary_dilation(smooth&~ndimage.binary_erosion(legs,iterations=3),iterations=2)
        metal|=rim&(s<.42)
        kp=Image.new('L',(x.shape[1],x.shape[0]),0)
        if F.get('kneePoly'): ImageDraw.Draw(kp).polygon([tuple(p) for p in F['kneePoly']],fill=255)
        legs&=~(np.array(kp)>0)
        out[lowcut:]=False; out|=legs&a&(h>=10)&(h<=40)&(l>.22)&(s>.08)&~((l<.3)&(s<.25))&~metal
    return x,out
def overlay(key,kind,x,out,sc=2):
    v=x[...,:3].copy(); v[out]=v[out]*.4+np.array([255,0,255])*.6
    bg=np.zeros_like(v)+[30,200,60]; al=x[...,3:]/255; v=v*al+bg*(1-al)
    im=Image.fromarray(v.astype(np.uint8)).resize((x.shape[1]*sc,x.shape[0]*sc),Image.NEAREST); d=ImageDraw.Draw(im)
    for gx in range(0,x.shape[1],25):
        d.line([(gx*sc,0),(gx*sc,im.height)],fill=(255,255,255) if gx%100 else (255,255,0),width=1); (gx%50==0) and d.text((gx*sc+2,2),str(gx),fill=(255,255,0))
    for gy in range(0,x.shape[0],25):
        d.line([(0,gy*sc),(im.width,gy*sc)],fill=(255,255,255) if gy%100 else (255,255,0),width=1); (gy%50==0) and d.text((2,gy*sc+2),str(gy),fill=(255,255,0))
    im.save(f'shots/f_{key}_{kind}.png')
if __name__=='__main__':
    sel=sys.argv[1:] or [f'{k}-{d}' for k,d in IMGS]
    for key,kind in IMGS:
        if f'{key}-{kind}' not in sel: continue
        x,out=build(key,kind); np.save(f'final_{key}_{kind}.npy',out); overlay(key,kind,x,out)
        print(key,kind,'fur %',round(out.mean()*100,1))

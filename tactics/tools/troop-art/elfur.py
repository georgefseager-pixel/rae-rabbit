import numpy as np, sys
from PIL import Image, ImageFilter
from scipy import ndimage
from trmask import hsl
A='/home/user/rae-rabbit/tactics/art/'
IM=[('troopelite','portrait'),('troopelite','battle'),('troopeliteaxe','battle'),('troopelitelance','battle'),('troopelitebook','battle'),('troopelitestaff','battle'),('troopelite','token')]
def fur(key,kind,P):
    x=np.array(Image.open(f'{A}{key}-{kind}.png').convert('RGBA')).astype(float)
    a=x[...,3]>40; h,s,l=hsl(x); r,g,b=x[...,0],x[...,1],x[...,2]
    sc=P['sig']*(x.shape[0]/640)
    w=(a&(l>.2)).astype(float); W=np.maximum(ndimage.gaussian_filter(w,sc),1e-3)
    rr=np.deg2rad(h)
    hs=np.rad2deg(np.arctan2(ndimage.gaussian_filter(np.sin(rr)*w,sc),ndimage.gaussian_filter(np.cos(rr)*w,sc)))%360
    ss=ndimage.gaussian_filter(s*w,sc)/W; rb=ndimage.gaussian_filter((r-b)*w,sc)/W
    core=a&(hs>=P['h0'])&(hs<=P['h1'])&(ss>P['s0'])&(rb>P['rb'])
    # per-pixel: this pixel itself looks like fur (not a gold rivet, pink lining, ink or steel glint)
    px=(h>=14)&(h<=34)&(s>.25)&(l>.3)&(l<.88)&((r-b)>45)
    f=core&px
    f=ndimage.binary_closing(f,iterations=2)&a
    lab,n=ndimage.label(f); sz=ndimage.sum(f,lab,range(1,n+1))
    f=np.isin(lab,[i+1 for i in range(n) if sz[i]>=P['min']*(x.shape[0]/640)**2])
    # gold and steel are busy (sharp highlights and shading); felt fur is soft: drop busy, yellow-highlighted areas
    from cutout import local_std
    busy=ndimage.gaussian_filter(local_std(x[...,:3].mean(-1),2),P['bsig']*x.shape[0]/640)
    yel=ndimage.gaussian_filter(((h>31)&a).astype(float),2)
    f&=~((busy>P['busy'])|(yel>P['yel']))
    # gold trim is the same colour as the fur, but thin: keep only thick areas, then let them reach their own edges again
    k=max(2,round(P['open']*x.shape[0]/640)); disk=np.hypot(*np.mgrid[-k:k+1,-k:k+1])<=k
    thick=ndimage.binary_opening(f,structure=disk)
    lab,n=ndimage.label(thick); sz=ndimage.sum(thick,lab,range(1,n+1))
    thick=np.isin(lab,[i+1 for i in range(n) if sz[i]>=P['bigmin']*(x.shape[0]/640)**2])
    g=thick.copy()
    for _ in range(P['regrow']): g|=ndimage.binary_dilation(g)&f
    f=g
    # grow from that confident fur into connected fur-coloured pixels: fuzzy ear edges and shaded shins are busier than
    # the face, but still far calmer than gold, and never cross the ink outlines
    # felt pieces are outlined in dark ink: flood out from the confident fur up to the outlines, through anything
    # fur-coloured (shaded or fuzzy), but not into pink linings (redder), steel (greyer) or gold (yellower, busier)
    grow=a&(l>P['ink'])&(h>=P['gh0'])&(h<=P['gh1'])&(s>.2)&~((s<.3)&(l>.5))&(yel<P['yel'])&(busy<P['gbusy'])&(hs>=P['ghs'])   # the ear linings are pinker over a wider area
    f=ndimage.binary_propagation(f,mask=grow|f)
    holes=ndimage.binary_fill_holes(f)&~f; hl,hn=ndimage.label(holes); hsz=ndimage.sum(holes,hl,range(1,hn+1))
    f|=np.isin(hl,[i+1 for i in range(hn) if hsz[i]<25])&(l>.3)&(h>=12)&(h<=36)   # texture specks inside fur
    # the light muzzle: an enclosed patch of pale fur (but not the pink nose or the dark mouth stitch)
    f|=np.isin(hl,[i+1 for i in range(hn) if hsz[i]<P['muz']*(x.shape[0]/640)**2])&(l>.55)&(h>=17)&(h<=36)&(s>.3)
    # hand-drawn additions: fur the colours can't separate from leather (the far ear, in shadow)
    from PIL import ImageDraw
    for poly in ADD.get(f'{key}-{kind}',{}).get('add',[]):
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); ImageDraw.Draw(pm).polygon([tuple(p) for p in poly],fill=255)
        f|=(np.array(pm)>0)&a&(l>.2)&(h>=17)&(h<=31)&(s>.2)&~((s<.3)&(l>.45))&(yel<P['yel'])
    for poly in ADD.get(f'{key}-{kind}',{}).get('erase',[]):
        pm=Image.new('L',(x.shape[1],x.shape[0]),0); ImageDraw.Draw(pm).polygon([tuple(p) for p in poly],fill=255)
        f&=~(np.array(pm)>0)
    return x,f
P=dict(sig=3,h0=21.5,h1=32,s0=.42,rb=62,min=60,open=3,bigmin=300,regrow=5,bsig=2.5,busy=20,yel=.3,gbusy=34,ink=.24,gh0=16.5,gh1=31,muz=900,ghs=19.5)
import json, os
ADD=json.load(open('eladd.json')) if os.path.exists('eladd.json') else {}
if __name__=='__main__':
    tiles=[]
    for key,kind in IM:
        x,f=fur(key,kind,P); np.save(f'elf_{key}_{kind}.npy',f)
        v=x[...,:3].copy(); v[f]=v[f]*.35+np.array([255,0,255])*.65
        bg=np.zeros_like(v)+[30,200,60]; al=x[...,3:]/255; v=v*al+bg*(1-al)
        o=Image.fromarray(v.astype(np.uint8)); tiles.append(o.resize((o.width*480//o.height,480)))
        from PIL import ImageDraw
        g=o.resize((o.width*2,o.height*2)); d=ImageDraw.Draw(g)
        for q in range(0,o.width,25): d.line([(q*2,0),(q*2,g.height)],fill=(255,255,0) if q%100==0 else (200,200,200)); q%50==0 and d.text((q*2+2,2),str(q),fill=(255,255,0))
        for q in range(0,o.height,25): d.line([(0,q*2),(g.width,q*2)],fill=(255,255,0) if q%100==0 else (200,200,200)); q%50==0 and d.text((2,q*2+2),str(q),fill=(255,255,0))
        g.save(f'../shots/elg_{key}_{kind}.png')
    s=Image.new('RGB',(sum(t.width for t in tiles)+10*len(tiles),480)); xx=0
    for t in tiles: s.paste(t,(xx,0)); xx+=t.width+10
    s.save('../shots/el_fur.png'); print('ok')

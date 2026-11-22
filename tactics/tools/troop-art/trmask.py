import numpy as np, colorsys, sys
from PIL import Image
from scipy import ndimage
A='/home/user/rae-rabbit/tactics/art/'
def hsl(x):
    r,g,b=[x[...,i]/255 for i in range(3)]; mx=np.max(x[...,:3],-1)/255; mn=np.min(x[...,:3],-1)/255; l=(mx+mn)/2; d=mx-mn
    s=np.where(d==0,0,d/np.where(l>.5,2-mx-mn,mx+mn+1e-9))
    h=np.where(mx==r,((g-b)/(d+1e-9))%6,np.where(mx==g,(b-r)/(d+1e-9)+2,(r-g)/(d+1e-9)+4))*60
    return h%360,s,l
def furmask(key,kind,params):
    im=Image.open(A+f'{key}-{kind}.png').convert('RGBA'); x=np.array(im).astype(float)
    h,s,l=hsl(x); a=x[...,3]>20
    cand=a&(h>=params['h0'])&(h<=params['h1'])&(l>params['l0'])&(l<.9)&(((s>params['s0'])&(s<params['s1']))|((l>.72)&(s>.15)&(s<.5)))
    sm=ndimage.uniform_filter(cand.astype(float),5)>.5
    sm=ndimage.binary_opening(sm,iterations=3)   # drops thin things: trim, blades, bowstrings
    lab,n=ndimage.label(sm); sz=ndimage.sum(sm,lab,range(1,n+1))
    big=np.isin(lab,[i+1 for i,v in enumerate(sz) if v>params['min']])
    fur=ndimage.binary_closing(ndimage.binary_dilation(big,iterations=2)&(cand|big),iterations=2)&a
    # small specks inside fur (texture, shading) count as fur; larger enclosed areas (armour, eyes) don't
    # smooth, sharp-edged regions (blades, printed emblems, trim) aren't fur: fur is fuzzy, but not THAT busy
    from cutout import local_std
    sd=local_std(x[...,:3].mean(-1),3); lab2,n2=ndimage.label(fur); sizes=ndimage.sum(fur,lab2,range(1,n2+1))
    biggest=int(np.argmax(sizes))+1 if n2 else 0
    for i in range(1,n2+1):
        if i!=biggest and sd[lab2==i].mean()>params.get('busy',27): fur[lab2==i]=False
    # enclosed light fur (a muzzle) counts; pink noses and dark eyes don't
    holes=ndimage.binary_fill_holes(fur)&~fur; hl,hn=ndimage.label(holes); hs=ndimage.sum(holes,hl,range(1,hn+1))
    small=np.isin(hl,[i+1 for i,v in enumerate(hs) if v<params.get('hole',60)])
    fur|=small&(h>=14)&(h<=40)&(l>.3)
    # hand fixes: metal highlights that look exactly like light fur, and the token's muzzle
    H,W=fur.shape; yy,xx=np.mgrid[0:H,0:W]
    for (k,kd,x0,y0,x1,y1) in FIXES.get('erase',[]):
        if (k,kd)==(key,kind): fur[y0:y1,x0:x1]=False
    for (k,kd,cx,cy,rx,ry) in FIXES.get('add',[]):
        if (k,kd)==(key,kind):
            e=((xx-cx*W)/(rx*W))**2+((yy-cy*H)/(ry*H))**2<1
            fur|=e&a&(h>=12)&(h<=40)&(l>.3)&(s>.1)
    return im,x,fur
FIXES={'erase':[('troop','portrait',255,245,360,368),('troop','portrait',328,768,362,812),('troop','portrait',95,400,135,525),('troop','portrait',160,640,220,725)],
       'add':[('troop','token',.52,.46,.13,.09)]}
if __name__=='__main__':
    P={'h0':18,'h1':33,'l0':.36,'s0':.3,'s1':.7,'min':400}
    out=[]
    for key,kind in [('troop','portrait'),('troop','battle'),('troopaxe','battle'),('trooplance','battle'),('troopbow','battle'),('troopbook','battle'),('troop','token')]:
        im,x,fur=furmask(key,kind,dict(P, hole=4000 if kind=='token' else 60, busy=27))
        v=x[...,:3].copy(); v[fur]=v[fur]*.3+np.array([255,0,255])*.7
        bg=np.zeros_like(v)+[30,200,60]; al=x[...,3:]/255; v=v*al+bg*(1-al)
        o=Image.fromarray(v.astype(np.uint8)); out.append(o.resize((o.width*400//o.height,400)))
        np.save(f'trfur_{key}_{kind}.npy',fur)
    s=Image.new('RGB',(sum(o.width for o in out)+60,400)); xx=0
    for o in out: s.paste(o,(xx,0)); xx+=o.width+10
    s.save('shots/tr_fur.png')

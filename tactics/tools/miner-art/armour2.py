import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from skin import hsl
from tint import hsl2rgb
from armour import armour, A
def full(base,kind):
    im,m=armour(base,kind)
    h,s,l=hsl(im[...,:3]/255)
    sk=np.array(Image.open(A+f'{base}skin-{kind}.png').split()[-1]).astype(float)/255
    loose=(h>44)&(h<180)&(s>.07)&(im[...,3]>20)&~ndimage.binary_dilation(sk>.2,iterations=2)
    m=ndimage.binary_closing(m,iterations=3)&loose
    for _ in range(2): m|=ndimage.binary_dilation(m)&loose
    return im,m
def redden(im,m):
    h,s,l=hsl(im[...,:3]/255); x=im.copy()
    nh=np.full_like(h,356.0); ns=np.clip(s*1.25+.08,0,1); nl=l*.95
    new=hsl2rgb(nh,ns,nl)*255; x[...,:3][m]=new[m]; return x
if __name__=='__main__':
    out=[]
    for base,kind in [('grunt','portrait'),('grunt','battle'),('grunt','token'),('gruntbow','battle')]:
        im,m=full(base,kind)
        mk=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6)); o=Image.new('LA',mk.size,255); o.putalpha(mk); o.save(A+f'{base}armour-{kind}.png',optimize=True)
        x=redden(im,m); t=Image.fromarray(x.astype(np.uint8)); bg=Image.new('RGB',t.size,(40,40,40)); bg.paste(t,(0,0),t); bg=bg.resize((int(t.width*450/t.height),450)); out.append(bg)
    s=Image.new('RGB',(sum(o.width for o in out)+30,450)); x=0
    for o in out: s.paste(o,(x,0)); x+=o.width+10
    s.save('armour_red.png')

import numpy as np
from PIL import Image
from scipy import ndimage
from skin import hsl
A='/home/user/rae-rabbit/tactics/art/'
def armour(base, kind, hlo=48, smin=.14):
    im=np.array(Image.open(A+f'{base}-{kind}.png').convert('RGBA')).astype(float)
    sk=np.array(Image.open(A+f'{base}skin-{kind}.png').split()[-1]).astype(float)/255
    h,s,l=hsl(im[...,:3]/255); a=im[...,3]>20
    skin=ndimage.binary_dilation(sk>.2,iterations=3)
    m=(h>hlo)&(h<175)&(s>smin)&(l>.08)&(l<.92)&a&~skin
    m=ndimage.binary_opening(m,iterations=1)
    return im,m
if __name__=='__main__':
    out=[]
    for base,kind in [('grunt','portrait'),('grunt','battle'),('grunt','token'),('gruntbow','battle')]:
        im,m=armour(base,kind); v=im[...,:3].copy(); v[im[...,3]<20]=40; v[m]=v[m]*.35+np.array([255,0,255])*.65
        t=Image.fromarray(v.astype(np.uint8)); t=t.resize((int(t.width*450/t.height),450)); out.append(t)
    s=Image.new('RGB',(sum(o.width for o in out)+30,450)); x=0
    for o in out: s.paste(o,(x,0)); x+=o.width+10
    s.save('armour.png')

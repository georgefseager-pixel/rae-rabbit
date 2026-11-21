import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
from skin import hsl
A='/home/user/rae-rabbit/tactics/art/'
im=Image.open('sling_full.png').convert('RGBA'); x=np.array(im).astype(float); a=x[...,3]>128; W,H=im.size
h,s,l=hsl(x[...,:3]/255)
lab=np.load('sl_reg.npy')
GEAR=[22,23,25,26,29,30,31,35,36,37,43,51,53,54,61,63,64,67,68,70,76,77,78,107]
CLOTH=[120,123,124,125,126,127,129,132,133,134,135,136,140,147]
keep=np.isin(lab,GEAR+CLOTH)
keep=ndimage.binary_fill_holes(ndimage.binary_closing(keep,iterations=2))
keep=ndimage.binary_dilation(keep,iterations=1)
def poly(pts):
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
EAR=poly([(165,132),(198,116),(212,122),(186,150),(160,188),(122,268),(62,302),(26,300),(38,250),(108,180)])
pink=(h<23)&(l>.17)&(s>.22)&EAR&a
pink=ndimage.binary_fill_holes(ndimage.binary_closing(ndimage.binary_opening(pink,iterations=1),iterations=3))
lb,n=ndimage.label(pink); sz=ndimage.sum(pink,lb,range(1,n+1)); pink=np.isin(lb,[i+1 for i,v in enumerate(sz) if v>300])
NOSE=poly([(375,190),(410,190),(410,215),(390,222),(378,208)])
nose=NOSE&(h<20)&(s>.35)&a; nose=ndimage.binary_fill_holes(ndimage.binary_closing(nose,iterations=2))
eye=(lab==17)|(ndimage.binary_dilation(lab==17,iterations=2)&(l<.3))
FUR=[1,47,69,75,112,139,144]
gear=poly([(283,245),(320,234),(347,248),(347,272),(326,290),(298,294),(282,276)])|poly([(328,248),(500,196),(592,188),(598,206),(512,224),(345,274)])|poly([(490,195),(512,176),(535,188),(560,190),(585,178),(598,188),(592,216),(566,252),(560,272),(542,292),(533,330),(528,364),(502,364),(508,320),(518,272),(508,236),(493,212)])
keep|=gear&~np.isin(lab,FUR)
zone=np.zeros_like(a); zone[380:570,140:390]=True; lum=x[...,:3].mean(-1)
for _ in range(6): keep|=ndimage.binary_dilation(keep)&zone&a&(((x[...,0]-x[...,2])<70)&(lum>120)|(lum<70))
keep=(keep|pink|nose|eye)&a
np.save('sl_keep.npy',keep)
v=x[...,:3].copy(); v[~a]=40; v[keep]=v[keep]*.45+np.array([0,220,255])*.55
Image.fromarray(v.astype(np.uint8)).save('sl_keep.png')
k=Image.fromarray((keep*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.7)); o=Image.new('LA',(W,H),255); o.putalpha(k); o.save(A+'minerslingmask-battle.png',optimize=True)

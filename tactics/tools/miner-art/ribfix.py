import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
from glowfix import trapped, U
from cutout import local_std
A='/home/user/rae-rabbit/tactics/art/'; src='3b4f8bab-image.png'
def poly(size,pts):
    m=Image.new('L',size,0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
LEFT=[(868,480),(892,480),(895,520),(900,600),(903,660),(901,682),(888,672),(878,655),(874,690),(872,708),(866,690),(861,640),(862,600),(866,540)]
RIGHT=[(900,500),(925,512),(950,528),(972,548),(988,575),(995,605),(993,640),(985,690),(965,740),(945,778),(940,815),(932,850),(926,880),(914,862),(904,825),(900,775),(908,735),(930,695),(955,655),(962,625),(958,598),(938,565),(912,540),(902,525)]
rgb=Image.open(U+src).convert('RGB'); f=np.load('ff_fig_portrait.npy')
t=trapped(src,f,4.5,300)
sd=local_std(np.array(rgb.convert('L')).astype(float),2)
for _ in range(4): t|=ndimage.binary_dilation(t)&f&(sd<7)
f=f&~t
rib=poly(rgb.size,LEFT)|poly(rgb.size,RIGHT)
rib=ndimage.binary_erosion(rib,iterations=1)
sd3=local_std(np.array(rgb.convert('L')).astype(float),3)
smooth=rib&(sd3<2.5)&~f
edge=rib&~ndimage.binary_erosion(rib,iterations=2)
lab,n=ndimage.label(smooth)
touch=np.unique(lab[edge&smooth]); touch=touch[touch>0]
rib&=~np.isin(lab,touch)
f=f|ndimage.binary_opening(rib,iterations=1)
f=ndimage.binary_opening(f,iterations=1)
lab,n=ndimage.label(f); sz=ndimage.sum(f,lab,range(1,n+1)); f=lab==np.argmax(sz)+1
m=Image.fromarray((f*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
im=rgb.copy(); im.putalpha(m); im=im.crop(Image.fromarray((f*255).astype(np.uint8)).getbbox())
im=im.resize((round(im.width*900/im.height),900),Image.LANCZOS); print(im.size)
im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.FLOYDSTEINBERG).save(A+'sisterflora-portrait.png',optimize=True)
o=rgb.crop((800,420,1010,900))
c=im.crop((im.width-150,170,im.width,560)); bg=Image.new('RGB',c.size,(30,200,60)); bg.paste(c,(0,0),c)
bg=bg.resize((c.width*2,c.height*2)); o=o.resize((int(o.width*bg.height/o.height),bg.height))
s=Image.new('RGB',(bg.width+o.width+10,bg.height)); s.paste(o,(0,0)); s.paste(bg,(o.width+10,0)); s.save('rib3.png')

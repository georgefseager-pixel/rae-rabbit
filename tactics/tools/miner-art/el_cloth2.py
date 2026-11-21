import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
rgb=Image.open(U+'92f66f4e-image.png').convert('RGB'); x=np.array(rgb).astype(float); lum=x.mean(-1)
f=np.load('el_final.npy')
ENV=[(288,754),(330,749),(400,747),(450,753),(500,761),(560,764),(620,763),(660,753),(674,756),(678,800),(676,840),(667,900),(648,950),(628,990),(615,1030),(612,1070),(595,1110),(565,1125),(535,1130),(515,1140),(482,1172),(448,1172),(428,1112),(413,1062),(393,1042),(378,1012),(358,992),(330,977),(300,992),(258,1004),(220,1035),(195,1015),(190,960),(232,918),(258,878),(278,828)]
m=Image.new('L',rgb.size,0); ImageDraw.Draw(m).polygon(ENV,fill=255); env=np.array(m)>0
def cloth(th):
    rb=ndimage.uniform_filter(x[...,0]-x[...,2],7)
    c=env&f&((rb<th)|(lum<70))
    c=ndimage.binary_opening(c,iterations=2)
    lab,n=ndimage.label(c); sz=ndimage.sum(c,lab,range(1,n+1)); c=np.isin(lab,[i+1 for i,v in enumerate(sz) if v>500])
    c=ndimage.binary_fill_holes(ndimage.binary_closing(c,iterations=3))&f
    loose=env&f&((rb<92)|(lum<70))
    for _ in range(8): c|=ndimage.binary_dilation(c)&loose
    return ndimage.binary_fill_holes(c)&f
if __name__=='__main__':
    tiles=[]
    for th in [80,86]:
        c=cloth(th); np.save(f'el_c_{th}.npy',c)
        v=x.copy(); v[~f]=40; v[c]=v[c]*.45+np.array([0,220,255])*.55
        tiles.append(Image.fromarray(v.astype(np.uint8)).crop((180,700,720,1200)).resize((432,400)))
    s=Image.new('RGB',(874,400)); s.paste(tiles[0],(0,0)); s.paste(tiles[1],(442,0)); s.save('el_c.png')

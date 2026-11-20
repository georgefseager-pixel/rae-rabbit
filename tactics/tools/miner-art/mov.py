import numpy as np
from PIL import Image, ImageDraw
A='/home/user/rae-rabbit/tactics/art/'
def mov(k,box,s,out,mask=None):
    o=Image.open(A+f'miner-{k}.png').convert('RGBA'); m=np.array(Image.open(A+f'minermask-{k}.png').split()[-1])>127 if mask is None else mask
    x=np.array(o).astype(float); x[...,:3][m]=x[...,:3][m]*.5+np.array([0,200,255])*.5
    c=Image.fromarray(x.astype(np.uint8)).crop(box); bg=Image.new('RGB',c.size,(40,140,40)); bg.paste(c,(0,0),c); bg=bg.resize((c.width*s,c.height*s),Image.NEAREST); d=ImageDraw.Draw(bg)
    for X in range(0,bg.width,5*s): d.line([(X,0),(X,bg.height)],fill=(255,0,0) if (X//(5*s))%10==0 else (70,70,70))
    for Y in range(0,bg.height,5*s): d.line([(0,Y),(bg.width,Y)],fill=(255,0,0) if (Y//(5*s))%10==0 else (70,70,70))
    for X in range(0,bg.width,50*s):
        for Y in range(0,bg.height,50*s): d.text((X+2,Y+2),f'{box[0]+X//s},{box[1]+Y//s}',fill=(255,255,0))
    bg.save(out)

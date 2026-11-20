import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
from ropefix import poly
A='/home/user/rae-rabbit/tactics/art/'
lab=np.load('reg_portrait.npy')   # from regions('portrait',(130,395,235,540),...)
o=Image.open(A+'miner-portrait.png'); H,W=lab.shape
keep_old=np.array(Image.open(A+'minermask-portrait.png').split()[-1]).astype(float)/255
k=np.isin(lab,[5,9,11,17,18,22,44])
yy,xx=np.mgrid[0:H,0:W]
k|=(lab==2)&(xx<185)&(yy<424)
k|=poly(o.size,[(152,502),(169,500),(170,537),(142,537),(139,528),(148,512)])
k=ndimage.binary_fill_holes(ndimage.binary_closing(k,iterations=1))
k=ndimage.binary_dilation(k,iterations=1)
box=np.zeros((H,W),bool); box[395:540,130:235]=True
new=np.where(box, k.astype(float), keep_old)
Image.fromarray((new*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5))
m=Image.fromarray((new*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5))
out=Image.new('LA',(W,H),255); out.putalpha(m); out.save(A+'minermask-portrait.png',optimize=True)

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
A='/home/user/rae-rabbit/tactics/art/'
lab=np.load('reg_battle.npy'); H,W=lab.shape
keep_old=np.array(Image.open(A+'minermask-battle.png').split()[-1]).astype(float)/255
k=np.isin(lab,[3,4,8,9,11,13,15,16,17,18])
k=ndimage.binary_fill_holes(ndimage.binary_closing(k,iterations=1)); k=ndimage.binary_dilation(k,iterations=1)
box=np.zeros((H,W),bool); box[355:475,160:260]=True
new=np.where(box,k.astype(float),keep_old)
m=Image.fromarray((new*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5))
out=Image.new('LA',(W,H),255); out.putalpha(m); out.save(A+'minermask-battle.png',optimize=True)

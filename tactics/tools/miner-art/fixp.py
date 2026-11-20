import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import ov
def poly(size, pts):
    m=Image.new('L',size,0); ImageDraw.Draw(m).polygon(pts,fill=255); return np.array(m)>0
SZ=(1024,1536)
THIGH=[(386,733),(400,726),(445,726),(457,740),(463,770),(470,805),(472,845),(470,880),(470,945),(300,945),(312,915),(322,885),(337,850),(352,812),(368,772)]
ROPES=[[(398,704),(430,704),(397,790),(382,830),(347,830),(372,770)],
       [(345,822),(396,822),(399,860),(396,906),(376,917),(345,917),(337,880)],
       [(434,704),(454,704),(457,766),(431,766)],
       [(427,758),(459,758),(466,800),(461,834),(424,834),(411,815),(417,790)]]
fig=np.load('fig_portrait.npy'); m=np.load('cloth2_portrait.npy')
m &= ~poly(SZ,THIGH)
for r in ROPES: m |= poly(SZ,r)&fig
np.save('cloth3_portrait.npy',m)
ov.ov('portrait',m,(220,640,720,1120),2,'ov3_portrait.png')

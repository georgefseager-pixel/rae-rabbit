import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
rgb=Image.open(U+'92f66f4e-image.png').convert('RGB'); x=np.array(rgb).astype(float); lum=x.mean(-1); W,H=rgb.size
f=np.load('el_final.npy'); lab=np.load('el_lab.npy')
def poly(p):
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(p,fill=255); return np.array(m)>0
BELOW_BAND=poly([(270,758),(330,750),(400,748),(450,754),(500,762),(560,765),(620,764),(660,754),(690,757),(720,1200),(170,1200),(170,758)])
TASSEL=poly([(333,845),(368,838),(374,880),(372,946),(344,950),(333,900)])
ROPE=poly([(298,800),(400,803),(480,800),(560,800),(640,790),(672,785),(675,830),(640,840),(560,848),(480,840),(400,836),(320,834),(298,826)])
KNOT=poly([(318,795),(360,785),(405,800),(412,840),(395,862),(350,866),(322,850)])
LFLAP=poly([(275,888),(296,884),(292,920),(266,955),(249,990),(233,1016),(206,1013),(203,990),(211,965),(214,935),(230,920),(255,904)])
BANDZONE=poly([(270,758),(690,757),(690,830),(270,845)])
whole=np.isin(lab,[176,172,188,130,127,143,153,145])
band=(lab==9)&BELOW_BAND
rbs=ndimage.uniform_filter(x[...,0]-x[...,2],11)
front=(lab==146)&(rbs<80)
front=ndimage.binary_opening(front,iterations=2)
l2,n2=ndimage.label(front); sz=ndimage.sum(front,l2,range(1,n2+1)); front=np.isin(l2,[i+1 for i,v in enumerate(sz) if v>400])
cloth=whole|band|front|((TASSEL|ROPE|KNOT)&f)|(LFLAP&f)
# tiny pieces (rope strands, knot facets) wholly surrounded by cloth
idx=range(1,lab.max()+1); cnt=ndimage.sum(lab>0,lab,idx)
small=np.isin(lab,[i for i,c in zip(idx,cnt) if c<150])
near=ndimage.binary_dilation(cloth,iterations=4)
cloth|=small&near
cloth=ndimage.binary_closing(cloth,iterations=3)&f
cloth|=ndimage.binary_closing(cloth,iterations=8)&BANDZONE&f
cloth=ndimage.binary_fill_holes(cloth)
ink=lum<95
for _ in range(3): cloth|=ndimage.binary_dilation(cloth)&ink&f
cloth&=f
np.save('el_c_80.npy',cloth)
v=x.copy(); v[~f]=40; v[cloth]=v[cloth]*.45+np.array([0,220,255])*.55
o=Image.fromarray(x.astype(np.uint8)).crop((170,700,720,1200)); m=Image.fromarray(v.astype(np.uint8)).crop((170,700,720,1200))
s=Image.new('RGB',(1110,500)); s.paste(o,(0,0)); s.paste(m,(560,0)); s.save('el_c4.png')

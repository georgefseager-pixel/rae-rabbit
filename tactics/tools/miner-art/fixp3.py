import numpy as np
from scipy import ndimage
import ov
from fixp import poly, SZ
fig=np.load('fig_portrait.npy'); m=np.load('cloth4_portrait.npy')
for p in [[(650,805),(668,822),(657,846),(647,875),(643,905),(635,935),(623,962),(606,984),(592,997),(578,990),(598,960),(613,930),(622,895),(628,860),(638,830)],
          [(512,1058),(536,1058),(539,1106),(525,1112),(514,1090)]]:
    m |= poly(SZ,p)&fig
np.save('cloth5_portrait.npy',m)
ov.ov('portrait',m,(440,740,720,1100),3,'ov5_portrait.png')

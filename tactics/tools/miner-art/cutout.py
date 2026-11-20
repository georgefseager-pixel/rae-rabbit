from PIL import Image
import numpy as np
from scipy import ndimage
def local_std(lum, r=3):
    k = 2*r+1
    m = ndimage.uniform_filter(lum, k); m2 = ndimage.uniform_filter(lum*lum, k)
    return np.sqrt(np.maximum(m2 - m*m, 0))
def figure_mask(rgb, a, std_thr=6.5, dark=38):
    lum = np.array(rgb.convert('L')).astype(float)
    sd = local_std(lum)
    seed = a < 128
    cand = (sd < std_thr) & (lum > dark)                       # smooth and not the ink outline
    lab, n = ndimage.label(cand | seed)
    bg = np.isin(lab, np.unique(lab[seed & (lab > 0)]))
    fig = ~bg
    fig = ndimage.binary_opening(fig, iterations=1)
    lab2, n2 = ndimage.label(fig); sizes = ndimage.sum(np.ones_like(lab2), lab2, range(1, n2+1))
    fig = lab2 == np.argmax(sizes) + 1
    # restore small textured specks inside the figure (fill holes that are not smooth background)
    holes = ndimage.binary_fill_holes(fig) & ~fig
    hl, hn = ndimage.label(holes)
    for i in range(1, hn+1):
        m = hl == i
        if m.sum() < 400 or sd[m].mean() > std_thr*1.5: fig |= m
    return fig
if __name__ == '__main__':
    U='/root/.claude/uploads/e7c1bc46-2a52-5a42-9213-f8f3f17d7a50/'
    out=[]
    for name, src, box in [('battle','a08e627e-image.png',(300,100,1150,1000)),('portrait','b2a50bb7-image.png',(0,0,1024,1536))]:
        rgb=Image.open(U+src).convert('RGB'); a=np.load(f'u2_{name}.npy')
        for thr in [5,7]:
            fig=figure_mask(rgb,a,thr)
            vis=np.array(rgb).copy(); vis[~fig]=[255,0,255]
            im=Image.fromarray(vis).crop(box); im=im.resize((int(im.width*450/im.height),450)); out.append(im)
    s=Image.new('RGB',(sum(i.width for i in out)+40,450)); x=0
    for i in out: s.paste(i,(x,0)); x+=i.width+10
    s.save('cut_tex.png')

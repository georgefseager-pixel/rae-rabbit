// Animation core: promise-based tweens driven by the single frame loop in 45-render.js.
let tweens = [], speed = 1;
const ease = t => t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
const animMul = () => (typeof SAVE !== 'undefined' && SAVE?.debugFast ? 4 : 1);   // debug: fast animations
const tween = (dur, fn) => new Promise(res => tweens.push({t0: performance.now(), dur: dur/speed/animMul(), fn, res}));
const wait = ms => tween(ms, () => {});
const anim = (el, kf, dur, opt = {}) => el.animate(kf, Object.assign({duration: dur/speed/animMul(), easing: 'ease-out', fill: 'none'}, opt)).finished.catch(() => {});
function stepTweens(now){
  for (const tw of tweens.slice()){
    const t = Math.min(1, (now - tw.t0)/tw.dur); tw.fn(ease(t));
    if (t >= 1){ tweens.splice(tweens.indexOf(tw), 1); tw.res(); }
  }
}

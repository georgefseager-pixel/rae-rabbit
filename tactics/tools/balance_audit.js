// Balance audit: for every main stage (or, with SIDES=1, every side story), an army of the units you're guaranteed to
// have by then (story characters, plus one ordinary recruit of each class), all at the stage's recommended level,
// against every enemy where it stands. Flags: WALL (nobody does more than 2 damage), HARD (at most one unit does 3+),
// HEALS (a boss on a healing square out-heals your best hit), BRUTAL (an enemy takes more than 120% of a unit's HP in
// one exchange). Run after building: node tactics/tools/balance_audit.js   (needs Playwright; reads tactics/index.html)
const {chromium, devices} = require('playwright');
const LV = +(process.env.LV || 0), ONLY = process.env.ONLY;
(async()=>{
 const b = await chromium.launch(); const ctx = await b.newContext({...devices['iPhone 13'], deviceScaleFactor: 1}); const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 const html = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'),'utf8');
 await p.route('**/game.html', r => r.fulfill({contentType:'text/html', body:'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>'+html+'</body></html>'}));
 await p.goto('https://example.test/game.html#debug'); await p.waitForFunction(() => window.RAE_DEBUG && window.RAE_DEBUG.artReady(), null, {timeout: 60000});
 const run = c => p.evaluate(c => window.RAE_DEBUG.run(c), c);
 const drain = async (n=200) => { for (let i=0;i<n;i++){ if(!(await p.locator('#talk').isVisible())) break; await p.click('#skip',{timeout:800}).catch(()=>p.click('#talk',{timeout:800}).catch(()=>{})); await p.waitForTimeout(120);} };
 await p.click('#newBtn'); await p.waitForTimeout(300); await drain();
 const res = await run(`(() => { const SIDES = ${process.env.SIDES ? 'true' : 'false'}; const out=[];
  for (const ck of ['rae','frog']){ const camp=CAMPAIGNS[ck], army=GACHA_ARMY[ck]; let keys=[...camp.start];
    const stageList=SIDES ? [...camp.sides.filter(s=>!s.event)] : [...camp.stages.filter(s=>!s.stub)]; if (SIDES) keys=[...new Set([...camp.start, ...camp.stages.flatMap(x=>[...(x.reward?.joins||[]),...(x.events||[]).map(e=>e.join).filter(Boolean)]), ...Object.keys(SIDE_SETS).filter(k=>SIDE_SETS[k].camp===ck)])];
    for (const sg of stageList){
      const rl=Math.round(recommendedLevel(sg)); if (!rl) continue;
      // roster: story characters so far (minus departures), plus one ordinary recruit of each class
      const recs=[]; for (const k of new Set(keys)) if (CHARACTERS[k] && !(sg.ban||[]).includes(k) && (!sg.flashback || k===sg.lead)) { const r=recordFor(k); dbgLevelTo(r, rl); recs.push(r); }
      for (const cls of army.generic){ const r=makeRecruit(ck, cls, rl); recs.push(r); }
      B={ch:sg, campKey:ck}; mapDef=MAPS[sg.map]; MAP=[...mapDef.rows]; ROWS=MAP.length; COLS=MAP[0].length; units=[];
      const spawns=[...sg.enemies({}), ...(sg.reinforce?sg.reinforce({}).flatMap(w=>w.units):[]), ...(sg.twist?.units||[])];
      const pu=recs.map(r=>battleUnit(r,'p'));
      const flags=[];
      for (const sp of spawns){ const d=enemyUnit(sp, sg.enemyFaction); place(d, Math.min(sp.x,COLS-1), Math.min(sp.y,ROWS-1)); if (d.courier) continue;
        let best=0, good=0, worstTaken=0, wk='';
        for (const a of pu){ place(a, d.x, d.y<ROWS-1?d.y+1:d.y-1); if (a.w==='staff') continue; const A=calc(a,d,a,d); const eff=A.dmg*(A.dbl?2:1); if (eff>best) best=eff; if (A.dmg>=3) good++;
          const D=calc(d,a,d,a); const t=D.dmg*(D.dbl?2:1); if (t/a.mhp>worstTaken){ worstTaken=t/a.mhp; wk=a.name; } }
        const heal = TER[MAP[d.y][d.x]].heal ? Math.round(d.mhp*.2) : 0;
        if (best<=2) flags.push('WALL '+d.name+'(def '+d.def+'+'+TER[MAP[d.y][d.x]].def+') best '+best);
        else if (good<=1) flags.push('HARD '+d.name+' only '+good+' unit(s) do 3+ (best '+best+')');
        if (d.boss && heal && best*1.6 < heal + 2) flags.push('HEALS '+d.name+' best '+best+' vs heal '+heal);
        if (worstTaken>=1.2) flags.push('BRUTAL '+d.name+' takes '+Math.round(worstTaken*100)+'% of '+wk+' in one exchange');
      }
      out.push(sg.id+' (rec '+rl+', '+pu.length+' units): '+(flags.length?flags.join(' | '):'ok'));
      for (const k of [...(sg.reward?.joins||[]), ...(sg.events||[]).map(e=>e.join).filter(Boolean)]) keys.push(k);
      for (const k of sg.departs||[]) keys=keys.filter(x=>x!==k);
    } }
  return out.join('\\n'); })()`);
 console.log(res); await b.close();
})();

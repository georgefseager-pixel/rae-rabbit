// ================= Armoury tab and the weapon picker =================
const weaponRowHTML = (w, extra = '', count = 0, cmp = null) => `<div class="wrow s${w.stars || 0}${cmp ? ' cmp-' + cmp.verdict : ''}">${weaponIconSVG(w, 34)}
  <div class="wtxt"><div class="wname">${w.name}${count > 1 ? ` <span class="wcount">×${count}</span>` : ''} <span class="wst">${w.stars ? '★'.repeat(w.stars) : 'Basic'}</span></div>
    <div class="wmeta">${WTYPE[w.type]}${w.lash ? ' (whip)' : ''} · ${weaponStatsText(w)}${w.owner ? ` · ${CHARACTERS[w.owner]?.name || w.owner} only` : ''}</div>
    ${cmp ? cmp.html : ''}${w.desc ? `<div class="wdesc">${w.desc}</div>` : ''}</div>${extra}</div>`;
// Compare a weapon with the one being carried: per-stat changes (green better, red worse) and a verdict.
function compareWeapons(w, cur){
  const stats = [['Mt', w.mt || 0, cur.mt || 0], ['Hit', w.hit || 0, cur.hit || 0], ['Crit', w.crit || 0, cur.crit || 0],
                 ['Rng', (w.rng || [1, 1])[1], (cur.rng || [1, 1])[1]]];
  let up = 0, down = 0;
  const chips = stats.map(([label, a, b]) => {
    const d = a - b; if (d > 0) up++; if (d < 0) down++;
    return d ? `<span class="dchip ${d > 0 ? 'up' : 'down'}">${label} ${d > 0 ? '▲ +' : '▼ '}${d}</span>` : '';
  }).join('');
  const verdict = up && !down ? 'better' : down && !up ? 'worse' : up && down ? 'mixed' : 'same';
  const word = {better: 'Better', worse: 'Worse', mixed: 'Mixed', same: 'Same'}[verdict];
  return {verdict, html: `<div class="wcmp"><span class="vbadge ${verdict}">${word}</span>${chips}</div>`};
}
const withRange = (w, cls) => ({...w, rng: w.rng || (cls ? CLASSES[cls].rng : typeRange(w.type))});

// Every weapon the army owns, stacked: one row per kind, with how many, who carries them, and how many are spare.
function armouryTabHTML(ck){
  const order = {sword: 0, lance: 1, axe: 2, bow: 3, staff: 4}, groups = {};
  for (const it of armsOf(ck)) if (WEAPONS[it.id]) (groups[it.id] ||= []).push(it);
  const ids = Object.keys(groups).sort((a, b) => order[WEAPONS[a].type] - order[WEAPONS[b].type] || WEAPONS[b].stars - WEAPONS[a].stars || WEAPONS[a].name.localeCompare(WEAPONS[b].name));
  if (!ids.length) return `<div class="hint">No weapons yet. Every unit carries their class's basic weapon. Better ones come from the story and from recruiting.</div>`;
  return `<div class="hint">Every weapon the army owns. Tap a unit's weapon on the Roster (or before a battle) to change what they carry. Weapons stay here when a unit falls or is released.</div>
    <div class="wlist">${ids.map(id => {
      const w = withRange(WEAPONS[id]), items = groups[id], holders = items.map(it => holderOf(ck, it.uid)).filter(Boolean), spare = items.length - holders.length;
      return weaponRowHTML(w, `<div class="wside">
        ${holders.length ? `<span class="whold">${holders.map(h => h.name).join(', ')}</span>` : ''}
        ${spare ? `<span class="whold free">${spare} spare</span>` : ''}
        ${!w.owner && spare ? `<button class="btn" data-arm-release="${id}" type="button">Release one · +${GACHA.release[w.stars]}</button>` : ''}</div>`, items.length);
    }).join('')}</div>`;
}

// The picker: everything this unit could carry. Spares are stacked; weapons other units carry are listed
// by who carries them, and picking one swaps.
function openWeaponPicker(uid){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.uid === uid); if (!rec) return;
  const cur = weaponOf(rec), basic = basicWeapon(rec), mine = rec.arm;
  const usable = armsOf(ck).filter(it => WEAPONS[it.id] && canCarry(rec, WEAPONS[it.id]));
  const spares = {}, carried = [];
  for (const it of usable){
    const h = holderOf(ck, it.uid);
    if (it.uid === mine) continue;
    if (h) carried.push({it, h}); else (spares[it.id] ||= []).push(it);
  }
  const byPower = (a, b) => WEAPONS[b].stars - WEAPONS[a].stars || WEAPONS[b].mt - WEAPONS[a].mt;
  let ov = $('#armsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'armsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  const curW = withRange(cur, rec.cls);
  const pick = (w, val, side, count = 0, on = false) => `<button class="wpick${on ? ' on' : ''}" data-arm-equip="${val || ''}" type="button">${weaponRowHTML(w, `<div class="wside">${side}</div>`, count, on ? null : compareWeapons(w, curW))}</button>`;
  const rows = [];
  if (mine) rows.push(pick(withRange(WEAPONS[armsOf(ck).find(a => a.uid === mine).id], rec.cls), mine, '<span class="whold">Carrying</span>', 0, true));
  rows.push(pick(withRange(basic, rec.cls), null, mine ? '' : '<span class="whold">Carrying</span>', 0, !mine));
  for (const id of Object.keys(spares).sort(byPower)){
    const n = spares[id].length;
    rows.push(pick(withRange(WEAPONS[id], rec.cls), spares[id][0].uid, `<span class="whold free">${n > 1 ? `${n} spare` : 'Spare'}</span>`, n));
  }
  for (const {it, h} of carried.sort((a, b) => byPower(a.it.id, b.it.id)))
    rows.push(pick(withRange(WEAPONS[it.id], rec.cls), it.uid, `<span class="whold swap">Swap with ${h.name}</span><small class="wgets">${h.name} gets ${swapResult(ck, rec, h)}</small>`));
  ov.innerHTML = `<div class="card wsheet"><h1>${rec.name}</h1><h2>${WTYPE[CLASSES[rec.cls].w]} user · carrying ${cur.name}</h2>
    <div class="wlist">${rows.join('')}</div>
    ${usable.length ? '' : `<p class="meta">No other ${WTYPE[CLASSES[rec.cls].w].toLowerCase()}s yet. They come from the story and from recruiting.</p>`}
    <button class="btn" data-arm-close type="button">Done</button></div>`;
  ov.hidden = false;
  ov.onclick = e => {
    const b = e.target.closest('[data-arm-equip], [data-arm-close]');
    if (!b && e.target !== ov) return;
    if (b && 'armEquip' in b.dataset && (b.dataset.armEquip || null) !== (rec.arm || null)){
      equipWeapon(ck, rec, b.dataset.armEquip || null); saveGame(); Sfx.play('select');
      toast(`${rec.name} now carries the ${weaponOf(rec).name}.`);
    }
    ov.hidden = true; ov.onclick = null; rerenderKeepScroll();
  };
}

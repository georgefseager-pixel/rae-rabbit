// ================= Armoury tab and the weapon picker =================
const weaponRowHTML = (w, extra = '') => `<div class="wrow s${w.stars || 0}">${weaponIconSVG(w, 34)}
  <div class="wtxt"><div class="wname">${w.name} <span class="wst">${w.stars ? '★'.repeat(w.stars) : 'Basic'}</span></div>
    <div class="wmeta">${WTYPE[w.type]}${w.lash ? ' (whip)' : ''} · ${weaponStatsText(w)}${w.owner ? ` · ${CHARACTERS[w.owner]?.name || w.owner} only` : ''}</div>
    ${w.desc ? `<div class="wdesc">${w.desc}</div>` : ''}</div>${extra}</div>`;

function armouryTabHTML(ck){
  const st = SAVE.camps[ck], order = {sword: 0, lance: 1, axe: 2, bow: 3, staff: 4};
  const items = armsOf(ck).map(it => ({it, w: {...WEAPONS[it.id], rng: WEAPONS[it.id].rng || (WEAPONS[it.id].type === 'bow' ? [2, 2] : [1, 1])}}))
    .filter(x => x.w.name).sort((a, b) => order[a.w.type] - order[b.w.type] || b.w.stars - a.w.stars || a.w.name.localeCompare(b.w.name));
  if (!items.length) return `<div class="hint">No weapons yet. Every unit carries their class's basic weapon. Better ones come from the story and from the Smithy banner on the Recruit tab.</div>`;
  return `<div class="hint">Every weapon the army owns. Tap a unit's weapon on the Roster (or before a battle) to change what they carry.</div>
    <div class="wlist">${items.map(({it, w}) => {
      const h = holderOf(ck, it.uid);
      return weaponRowHTML(w, `<div class="wside"><span class="whold${h ? '' : ' free'}">${h ? h.name : 'Unused'}</span>
        ${w.owner ? '' : `<button class="btn" data-arm-release="${it.uid}" type="button">Release · +${GACHA.release[w.stars]}</button>`}</div>`);
    }).join('')}</div>`;
}

// The picker: every weapon this unit could carry. Picking one held by someone else swaps it over.
function openWeaponPicker(uid){
  const ck = SAVE.current, rec = stOf().roster.find(r => r.uid === uid); if (!rec) return;
  const cur = weaponOf(rec), basic = basicWeapon(rec);
  const options = armsOf(ck).filter(it => WEAPONS[it.id] && canCarry(rec, WEAPONS[it.id]))
    .map(it => ({it, w: {...WEAPONS[it.id], rng: WEAPONS[it.id].rng || CLASSES[rec.cls].rng}}))
    .sort((a, b) => b.w.stars - a.w.stars || b.w.mt - a.w.mt);
  let ov = $('#armsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'armsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  const row = (w, val, holder) => `<button class="wpick${(val || null) === (rec.arm || null) ? ' on' : ''}" data-arm-equip="${val || ''}" type="button">
      ${weaponRowHTML(w, `<div class="wside">${(val || null) === (rec.arm || null) ? '<span class="whold">Carrying</span>' : holder ? `<span class="whold">From ${holder.name}</span>` : ''}</div>`)}</button>`;
  ov.innerHTML = `<div class="card wsheet"><h1>${rec.name}</h1><h2>${WTYPE[CLASSES[rec.cls].w]} user · now carrying ${cur.name}</h2>
    <div class="wlist">${row(basic, null, null)}${options.map(({it, w}) => row(w, it.uid, rec.arm === it.uid ? null : holderOf(ck, it.uid))).join('')}</div>
    ${options.length ? '' : `<p class="meta">No other ${WTYPE[CLASSES[rec.cls].w].toLowerCase()}s yet. They come from the story and the Smithy banner.</p>`}
    <button class="btn" data-arm-close type="button">Done</button></div>`;
  ov.hidden = false;
  ov.onclick = e => {
    const b = e.target.closest('[data-arm-equip], [data-arm-close]');
    if (!b && e.target !== ov) return;
    if (b && 'armEquip' in b.dataset){
      equipWeapon(ck, rec, b.dataset.armEquip || null); saveGame(); Sfx.play('select');
      toast(`${rec.name} now carries the ${weaponOf(rec).name}.`);
    }
    ov.hidden = true; ov.onclick = null; rerenderKeepScroll();
  };
}

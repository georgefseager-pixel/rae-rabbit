// ================= Unique abilities =================
// Each unique character has one small, always-on ability, shown as an icon on their unit card (tap it to read it)
// and in the battle panel. An attire that changes class or stats brings its own ability instead (ATTIRES[id].ability);
// look-only attires keep the character's. Placeholder characters have none yet. The rules live in 40-battle.js
// (search for the ability id); this file is the list and the wording.
const ABILITIES = {
  nextto:      {name: 'Next to Me',        icon: '🤝', text: 'Rae and any ally standing next to her each deal +1 damage and take 1 less.'},
  present:     {name: 'Stocking Filler',   icon: '🎁', text: 'Whoever Flopsy mends gets a present: +3 damage in their next fight, attacking or defending.'},
  seams:       {name: 'Mended Seams',      icon: '🧵', text: 'Anyone Flopsy Flora mends also gets +2 Def until her next turn.'},
  lesson:      {name: 'The Lesson',        icon: '📖', text: 'Allies within 2 squares of Willow earn 20% more experience.'},
  fingers:     {name: 'Light Fingers',     icon: '🪙', text: 'Each enemy Brigand defeats drops 25 extra spoils, paid when the battle is won.'},
  walkedaway:  {name: 'Walked Away',       icon: '⛓️', text: 'Below half HP, the Condemned strikes first, even when he is the one attacked.'},
  drawback:    {name: 'Draw Back',         icon: '↩️', text: 'Instead of attacking, Froggle can pull an adjacent ally to safety: she steps back one square, and they take her place.'},
  bait:        {name: 'Bait, By Choice',   icon: '🎯', text: 'Enemies who can reach Patch attack him first, and he takes 2 less damage from the first hit each enemy turn.'},
  listen:      {name: 'They Listen',       icon: '📣', text: 'Allies within 2 squares of Tiggle get +10 Hit.'},
  holdline:    {name: 'Hold the Line',     icon: '🛡️', text: 'Enemies can\'t move past the squares next to Biggle: they have to stop there, or go round.'},
  lancecharge: {name: 'Lance Charge',      icon: '🐎', text: 'On horseback: +3 damage if Biggle moved at least 3 squares before attacking this turn.'},
  cantcatch:   {name: 'Can\'t Catch Me',     icon: '🍪', text: 'Run, run, as fast as you can: if Gingerbiggle moved at least 3 squares this turn, enemies get −25 Hit against him until his next turn.'},
  digging:     {name: 'Keep Them Digging', icon: '⛏️', text: 'An enemy Rhubarb hits can only move 1 square on its next turn.'},
  onestroke:   {name: 'One Stroke',        icon: '🪓', text: '+25 Crit against enemies below half HP.'},
  guiding:     {name: 'Guiding Nose',      icon: '🦌', text: 'Allies who start their move within 2 squares of Ilc get +1 Mov: his bright red nose shows the way through the snow.'},
  climbing:    {name: 'Taught to Climb',   icon: '🌳', text: 'Allies who start their move within 2 squares of Cornelius cross trees and flowers as if they were open ground. He taught every monkey in the castle to climb.'},
  naughty:     {name: 'Naughty List',      icon: '📜', text: 'Any enemy Chriggle Chraggle hits goes on the Naughty List: for the rest of the battle, everyone deals it +2 damage.'},
  bend:        {name: 'Bend, Not Break',   icon: '🙇', text: 'Once a battle, a blow that would unstitch Aurora leaves her standing on 1 HP instead.'},
  wecan:       {name: 'We Can Fight!',     icon: '✊', text: 'Against an enemy of a higher level than him, Speshul gets +2 damage and +10 Hit.'},
  nobody:      {name: 'Nobody Comes',      icon: '🌑', text: 'With no ally within 2 squares, Fraggle Jr. gets +3 Atk and +3 Spd.'},
};
const CHARACTER_ABILITY = {rae: 'nextto', sister: 'seams', willow: 'lesson', brigand: 'fingers', condemned: 'walkedaway', froggle: 'drawback',
  patch: 'bait', tiggle: 'listen', biggle: 'holdline', rhubarb: 'digging', executioner: 'onestroke', fragglejr: 'nobody', chriggle: 'naughty', ilc: 'guiding', aurora: 'bend', speshul: 'wecan', cornelius: 'climbing'};
// The ability of a unit or record: its attire's (if the attire brings one), else its character's.
const abilityOf = u => u && (ATTIRES[u.attire]?.ability || CHARACTER_ABILITY[u.key]) || null;
const hasAb = (u, id) => abilityOf(u) === id;
// The ability as a button: the character's map icon, the ability's name, and an ⓘ. Tap it to read the ability.
const abilityArt = u => artFor(u, 'token') || artFor(u, 'portrait') || plushPortrait(u.look);
const abilityIcon = u => { const id = abilityOf(u); if (!id) return '';
  const A = ABILITIES[id];
  return `<button class="uabil" data-ability="${id}" data-who="${u.uid || u.key}" type="button" aria-label="Ability: ${A.name}. Tap to read it.">
    <span class="abimg"><img alt="" src="${abilityArt(u)}"></span><span class="abtxt"><small>Ability</small><b>${A.name}</b></span><span class="abinfo">ⓘ</span></button>`; };

// Tapping an ability icon anywhere (unit cards, the battle panel) explains it.
function openAbility(id, art){
  const A = ABILITIES[id]; if (!A) return;
  let ov = $('#abilsheet');
  if (!ov){ ov = document.createElement('div'); ov.id = 'abilsheet'; ov.className = 'ov'; document.body.appendChild(ov); }
  const who = Object.entries(CHARACTER_ABILITY).find(([, a]) => a === id)?.[0] || Object.values(ATTIRES).find(a => a.ability === id)?.char;
  const via = Object.values(ATTIRES).find(a => a.ability === id);
  ov.innerHTML = `<div class="card abilcard"><div class="abig">${art ? `<img alt="" src="${art}">` : A.icon}</div><div class="akick">Unique ability${who ? ` · ${speakerName(who)}${via ? ` (${via.name})` : ''}` : ''}</div>
    <h2>${A.name}</h2><p>${A.text}</p><button class="btn primary" data-abil-close type="button">Got it</button></div>`;
  ov.hidden = false;
  ov.onclick = e => { if (e.target === ov || e.target.closest('[data-abil-close]')){ ov.hidden = true; ov.onclick = null; } };
}
document.addEventListener('click', e => { const b = e.target.closest('[data-ability]'); if (!b) return; e.stopPropagation(); e.preventDefault(); openAbility(b.dataset.ability, b.querySelector('img')?.src); }, true);

// ---------- Rewards: bones, ranks, Kennel shop, badges ----------
const BONE = '<svg class="boneI" viewBox="2 2 20 14" aria-hidden="true"><path d="M6 9a3 3 0 1 1 3-3h6a3 3 0 1 1 3 3 3 3 0 1 1-3 3H9a3 3 0 1 1-3-3z" fill="currentColor"/></svg>';
const PAW = '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="4.2" fill="currentColor"/><circle cx="5.8" cy="10" r="2.3" fill="currentColor"/><circle cx="9.8" cy="6.2" r="2.3" fill="currentColor"/><circle cx="14.2" cy="6.2" r="2.3" fill="currentColor"/><circle cx="18.2" cy="10" r="2.3" fill="currentColor"/></svg>';

const COATS = { '': ['#f7f3ec', '#d6ccbc'], ghost: ['#e3fbef', '#8fd3b0'], neon: ['#ffd6ef', '#ff5fae'], gold: ['#ffd970', '#c08a1e'] };

const ITEMS = [
  { id: 'party', slot: 'hat', name: 'Party hat', cost: 30 },
  { id: 'headphones', slot: 'hat', name: 'Headphones', cost: 60 },
  { id: 'laurel', slot: 'hat', name: 'Laurel wreath', cost: 80 },
  { id: 'pirate', slot: 'hat', name: 'Pirate hat', cost: 100 },
  { id: 'racing', slot: 'hat', name: 'Racing helmet', cost: 120 },
  { id: 'wizard', slot: 'hat', name: 'Wizard hat', cost: 150 },
  { id: 'space', slot: 'hat', name: 'Space helmet', cost: 180 },
  { id: 'crown', slot: 'hat', name: 'Crown', cost: 300 },
  { id: 'bandana', slot: 'neck', name: 'Bandana', cost: 25 },
  { id: 'bowtie', slot: 'neck', name: 'Bow tie', cost: 40 },
  { id: 'medal', slot: 'neck', name: 'Gold medal', cost: 90 },
  { id: 'shades', slot: 'face', name: 'Cool shades', cost: 70 },
  { id: 'ghost', slot: 'coat', name: 'Ghostly coat', cost: 200 },
  { id: 'neon', slot: 'coat', name: 'Neon coat', cost: 200 },
  { id: 'gold', slot: 'coat', name: 'Golden coat', cost: 500 },
];
const SLOT_NAME = { hat: 'Hats', face: 'Face', neck: 'Neck', coat: 'Coats' };

const RANKS = [[0, 'Puppy'], [60, 'Good Sniffer'], [150, 'Fetch Champ'], [300, 'Word Hound'], [600, 'Top Dog'], [1000, 'Legend']];

const BADGES = [
  ['first-ws', 'First Find', 'Finish a wordsearch', s => s.n.ws >= 1],
  ['first-wg', 'Code Breaker', 'Solve a Word Guess', s => s.n.wgw >= 1],
  ['first-cw', 'Cross Words', 'Finish a crossword', s => s.n.cw >= 1],
  ['clean', 'No Sniffing', 'Finish a puzzle with no hints', s => s.n.clean >= 1],
  ['gold', 'Speedy Paws', 'Win a gold medal in timed mode', s => s.n.gold >= 1],
  ['three', 'Mind Reader', 'Solve a Word Guess in 3 tries or fewer', s => s.n.wg3 >= 1],
  ['myst', 'Sharp Sniffer', 'Crack a mystery word before finding every word', s => s.n.myst >= 1],
  ['streak5', 'On a Roll', 'Get a Word Guess streak of 5', s => s.best >= 5],
  ['bonus10', 'Bonus Hunter', 'Catch 10 Buster Bonuses', s => s.n.bonus >= 10],
  ['packs', 'Explorer', 'Finish a puzzle in every word pack', s => s.packs.length >= 8],
  ['p25', 'Puzzle Pro', 'Finish 25 puzzles', s => s.n.ws + s.n.wgw + s.n.cw >= 25],
  ['dressed', 'Snappy Dresser', 'Buy something for Buster', s => s.owned.length >= 1],
  ['topdog', 'Top Dog', 'Reach Top Dog rank', s => s.life >= 600],
];

const STATS = {};
function blankStats() { return { bones: 0, life: 0, owned: [], eq: { hat: '', face: '', neck: '', coat: '' }, badges: [], n: { ws: 0, wgw: 0, cw: 0, clean: 0, gold: 0, wg3: 0, bonus: 0, myst: 0 }, packs: [], best: 0 }; }
function S() {
  if (!STATS[who]) {
    const d = blankStats(), v = store.get('stats.' + who, {}) || {};
    STATS[who] = Object.assign(d, v, { n: Object.assign(d.n, v.n || {}), eq: Object.assign(d.eq, v.eq || {}) });
  }
  return STATS[who];
}
const saveS = () => store.set('stats.' + who, S());
function rankOf(life) { let i = 0; RANKS.forEach((r, k) => { if (life >= r[0]) i = k; }); return i; }

// ---------- outfits (drawn in Buster's 120x124 space) ----------
function laurel() {
  let s = '';
  for (let i = 0; i <= 8; i++) {
    const t = i / 8, x = 34 + 52 * t, y = 31 - 13 * Math.sin(Math.PI * t), a = Math.atan2(-13 * Math.PI * Math.cos(Math.PI * t), 52) * 180 / Math.PI;
    [-35, 35].forEach(o => (s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.5" ry="2.3" transform="rotate(${(a + o).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#86b543" stroke="#4e7a22" stroke-width=".8"/>`));
  }
  return s;
}
const HATS = {
  party: '<path d="M48 26 L60 -4 L72 26 Z" fill="#ff4f8b"/><path d="M51.7 17 H68.3 M55.3 8 H64.7" stroke="#ffe14d" stroke-width="3"/><circle cx="60" cy="-5" r="4.5" fill="#ffe14d"/>',
  headphones: '<path d="M29 46 C26 10 94 10 91 46" stroke="#2a2730" stroke-width="5.5" fill="none" stroke-linecap="round"/><rect x="21" y="38" width="13" height="21" rx="6" fill="#ff3ea5" stroke="#2a2730" stroke-width="2"/><rect x="86" y="38" width="13" height="21" rx="6" fill="#ff3ea5" stroke="#2a2730" stroke-width="2"/>',
  laurel: '',
  pirate: '<path d="M28 27 C33 4 87 4 92 27 C80 20 40 20 28 27 Z" fill="#1d1a1f"/><path d="M28 27 C40 20 80 20 92 27" stroke="#e9c46a" stroke-width="2.6" fill="none"/><circle cx="60" cy="14" r="4" fill="#f4f1ea"/><path d="M55 21 l10 -5 M55 16 l10 5" stroke="#f4f1ea" stroke-width="1.8" stroke-linecap="round"/>',
  racing: '<path d="M25 52 C21 17 40 -1 60 -1 C80 -1 99 17 95 52 L84 53 C82 41 72 33 60 33 C48 33 38 41 36 53 Z" fill="#ff6a13" stroke="#a83d00" stroke-width="1.6"/><path d="M56.5 -.5 h7 v33.6 h-7z" fill="#fff"/><path d="M33 34 C40 30 48 28 54 28" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>',
  wizard: '<path d="M44 27 L57 -16 L76 27 Z" fill="#5b3fb8"/><ellipse cx="60" cy="27" rx="23" ry="5.5" fill="#46309a"/><path d="M58 6 l1.6 3.2 3.5 .5 -2.6 2.4 .7 3.5 -3.2 -1.7 -3.2 1.7 .7 -3.5 -2.6 -2.4 3.5 -.5z" fill="#ffd84d"/><circle cx="66" cy="18" r="1.6" fill="#ffd84d"/><circle cx="53" cy="20" r="1.2" fill="#ffd84d"/>',
  space: '<circle cx="60" cy="42" r="42" fill="rgba(170,220,255,.2)" stroke="#bfe3ff" stroke-width="2.6"/><path d="M33 20 C40 10 50 5 60 4" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85"/><rect x="32" y="78" width="56" height="8" rx="4" fill="#d5dde8" stroke="#8a97a8"/>',
  crown: '<path d="M43 27 L43 11 L51 19 L60 6 L69 19 L77 11 L77 27 Z" fill="#f2c23a" stroke="#a87810" stroke-width="1.6" stroke-linejoin="round"/><circle cx="60" cy="21" r="2.8" fill="#d8322a"/><circle cx="50" cy="23" r="2" fill="#2b6fd1"/><circle cx="70" cy="23" r="2" fill="#2e9e3f"/>',
};
const FACES = {
  shades: '<path d="M37 39 h19 v5 c0 7 -4.5 10 -9.5 10 c-5 0 -9.5 -3 -9.5 -10z M64 39 h19 v5 c0 7 -4.5 10 -9.5 10 c-5 0 -9.5 -3 -9.5 -10z" fill="#141118"/><path d="M56 41.5 h8" stroke="#141118" stroke-width="2.6"/><path d="M40 43 h6 M67 43 h6" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>',
};
const NECK_UNDER = {
  bandana: '<path d="M39 71 Q60 80 81 71 L73 84 Q66 93 60 97 Q54 93 47 84 Z" fill="#d8322a"/><circle cx="53" cy="83" r="1.7" fill="#fff"/><circle cx="66" cy="82" r="1.7" fill="#fff"/><circle cx="60" cy="90" r="1.7" fill="#fff"/>',
};
const NECK_OVER = {
  bowtie: '<path d="M60 80 L47 72 L47 88 Z M60 80 L73 72 L73 88 Z" fill="#2b6fd1" stroke="#1e4f99" stroke-width="1.2" stroke-linejoin="round"/><circle cx="60" cy="80" r="3.8" fill="#1e57ab"/>',
  medal: '<path d="M49 70 L60 90 L71 70" stroke="#d8322a" stroke-width="5" fill="none"/><circle cx="60" cy="95" r="7.5" fill="#f2c23a" stroke="#a87810" stroke-width="1.6"/><path d="M60 90.5 l1.3 2.6 2.8 .4 -2 1.9 .5 2.8 -2.6 -1.4 -2.6 1.4 .5 -2.8 -2 -1.9 2.8 -.4z" fill="#fff4c2"/>',
};
function outfitUnder(eq) { return NECK_UNDER[eq.neck] || ''; }
function outfitHead(eq) { return (FACES[eq.face] || '') + (eq.hat === 'laurel' ? laurel() : HATS[eq.hat] || ''); }
function outfitOver(eq) { return NECK_OVER[eq.neck] || ''; }

// ---------- earning ----------
function updateBones() {
  const s = S(); $('#boneCount').textContent = s.bones;
  const k = $('#kArt'); if (k) k.innerHTML = `<span class="kMini still">${busterSVG()}</span><span class="kCount">${BONE}${s.bones}</span>`;
}
function drawBusters() {
  document.querySelectorAll('.busterBtn').forEach(b => (b.innerHTML = busterSVG()));
  $('#menuBuster').innerHTML = busterSVG();
  updateBones();
}
let toastQ = Promise.resolve();
function toast(html) {
  toastQ = toastQ.then(() => new Promise(res => {
    const t = $('#toast'); t.innerHTML = html; t.hidden = false; t.classList.remove('in'); void t.offsetWidth; t.classList.add('in');
    if (P().sfx) Music.sfx('bonus');
    setTimeout(() => { t.hidden = true; res(); }, 2600);
  }));
}
function give(b) {
  const s = S(), r0 = rankOf(s.life);
  s.bones += b; s.life += b;
  const r1 = rankOf(s.life);
  if (r1 > r0) toast(`${PAW}<span><small>New rank</small><b>${RANKS[r1][1]}</b></span>`);
}
function checkBadges() {
  const s = S(), out = [];
  BADGES.forEach(([id, name, , fn]) => { if (!s.badges.includes(id) && fn(s)) { s.badges.push(id); give(25); out.push(name); } });
  out.forEach(n => toast(`${PAW}<span><small>Badge unlocked · +25 bones</small><b>${n}</b></span>`));
  saveS(); updateBones(); return out;
}
function noteBonus() { S().n.bonus++; give(5); checkBadges(); }
// o: { kind: 'ws' | 'wgw' | 'wgl' | 'cw', stars, medal (0 none, 1 gold, 2 silver, 3 bronze), clean, n, streak }
function award(o) {
  const s = S(); let b = 0;
  if (o.kind === 'ws') { b = 8 + o.stars * 4; s.n.ws++; }
  else if (o.kind === 'wgw') { b = 6 + (7 - o.n) * 3; s.n.wgw++; if (o.n <= 3) s.n.wg3++; }
  else if (o.kind === 'wgl') b = 2;
  else if (o.kind === 'cw') { b = 10 + o.stars * 5; s.n.cw++; }
  if (o.streak != null) s.best = Math.max(s.best, o.streak);
  if (o.medal) { b += [0, 6, 3, 1][o.medal]; if (o.medal === 1) s.n.gold++; }
  if (o.clean) s.n.clean++;
  if (o.myst) s.n.myst++;
  b += o.extra || 0;
  if (o.kind !== 'wgl' && !s.packs.includes(P().topic)) s.packs.push(P().topic);
  give(b); checkBadges(); saveS(); updateBones();
  return `<p class="earn">${BONE}<b>+${b} bones</b></p>`;
}

// ---------- Kennel screen ----------
function renderKennel() {
  const s = S(), ri = rankOf(s.life), nx = RANKS[ri + 1];
  $('#kBuster').innerHTML = busterSVG();
  $('#kName').textContent = who === 'alf' ? "Alf's Buster" : "Josie's Buster";
  $('#kRank').textContent = RANKS[ri][1];
  $('#kBar').style.width = nx ? Math.round(100 * (s.life - RANKS[ri][0]) / (nx[0] - RANKS[ri][0])) + '%' : '100%';
  $('#kNext').textContent = nx ? `${nx[0] - s.life} more bones earned to reach ${nx[1]}` : 'Top rank. Legendary.';
  $('#kBones').innerHTML = `${BONE}<b>${s.bones}</b> bones to spend`;
  $('#shop').innerHTML = Object.keys(SLOT_NAME).map(slot => `<h3 class="kSlot">${SLOT_NAME[slot]}</h3>` + ITEMS.filter(it => it.slot === slot).map(it => {
    const own = s.owned.includes(it.id), worn = s.eq[slot] === it.id, prev = Object.assign({}, s.eq, { [slot]: it.id });
    const btn = worn ? `<button class="btn ghost sm" data-wear="${it.id}">Take off</button>`
      : own ? `<button class="btn sm" data-wear="${it.id}">Wear</button>`
      : `<button class="btn sm buy" data-buy="${it.id}" ${s.bones < it.cost ? 'disabled' : ''}>${BONE}${it.cost}</button>`;
    return `<div class="item${worn ? ' worn' : ''}${own ? ' own' : ''}"><span class="iv still">${busterSVG(prev)}</span><b>${it.name}</b>${btn}</div>`;
  }).join('')).join('');
  $('#badges').innerHTML = BADGES.map(([id, name, desc]) => {
    const got = s.badges.includes(id);
    return `<div class="badge${got ? ' got' : ''}"><span class="bi">${PAW}</span><span><b>${name}</b><small>${desc}</small></span></div>`;
  }).join('');
  $('#kBadgeCount').textContent = `${s.badges.length} of ${BADGES.length}`;
}
$('#shop').addEventListener('click', e => {
  const s = S(), b = e.target.closest('button'); if (!b) return;
  const id = b.dataset.buy || b.dataset.wear, it = ITEMS.find(x => x.id === id); if (!it) return;
  if (b.dataset.buy) {
    if (s.bones < it.cost || s.owned.includes(id)) return;
    s.bones -= it.cost; s.owned.push(id); s.eq[it.slot] = id;
    if (P().sfx) { Music.sfx('done'); setTimeout(() => Music.sfx('bark'), 500); }
    checkBadges();
  } else { s.eq[it.slot] = s.eq[it.slot] === id ? '' : id; if (P().sfx) Music.sfx('tap'); }
  saveS(); drawBusters(); renderKennel();
});

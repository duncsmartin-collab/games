// ---------- Fetch: game ----------
const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { const v = localStorage.getItem('fetch.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fetch.' + k, JSON.stringify(v)); } catch (e) {} },
};

const SKINS = {
  arcade:   { name: 'Arcade',    scheme: 'dark',  alpha: .2,  caps: ['#ff3ea5', '#28e7ff', '#ffe14d', '#7dff6a', '#b18cff', '#ff8a3d', '#3dffd0', '#ff5e5e'], pv: ['#0b0820', '#28e7ff', "'Press Start 2P'", '11px'] },
  amphora:  { name: 'Amphora',   scheme: 'light', alpha: 1,   caps: ['#1b1410'], pv: ['#c8693a', '#1b1410', "'Marcellus'", '19px'] },
  starship: { name: 'Starship',  scheme: 'dark',  alpha: .22, caps: ['#ffb238', '#3fd5ff', '#ff5d73', '#8dff9a', '#c59bff', '#ffe066', '#5ef0d0', '#ff8f4d'], pv: ['#081626', '#ffb238', "'Chakra Petch'", '18px'] },
  bricks:   { name: 'Bricks',    scheme: 'light', alpha: 1,   caps: ['#e3261c', '#0b6fd6', '#f5b800', '#2e9e3f', '#f0782a', '#7a3fc0', '#e94f95', '#16a5a0'], pv: ['#2b6fd1', '#f7f3e6', "'Lilita One'", '20px'] },
  haunted:  { name: 'Haunted',   scheme: 'dark',  alpha: .2,  caps: ['#d6f0e2'], pv: ['#1a2420', '#cfc7ad', "'IM Fell English SC'", '19px'] },
  lab:      { name: 'Lab',       scheme: 'light', alpha: .55, caps: ['#ffe14d', '#7df0a0', '#ff8fc8', '#7fd3ff', '#ffb066', '#c3a6ff', '#b6f25a', '#ff9a9a'], pv: ['#fbfdfc', '#0f7c8c', "'IBM Plex Mono'", '17px'] },
  rally:    { name: 'Rally',     scheme: 'dark',  alpha: 1,   caps: ['#ff6a13', '#ffd21f', '#20c4e8', '#e8e8e8', '#ff3b4f', '#7be36b', '#b78cff', '#ff9f1c'], pv: ['#1b1c1f', '#ff6a13', "'Racing Sans One'", '20px'] },
  brass:    { name: 'Bandstand', scheme: 'dark',  alpha: 1,   caps: ['#e9c46a'], pv: ['#4a0c14', '#e9c46a', "'Alfa Slab One'", '17px'] },
};

const TOPICS = {
  greeks:  { name: 'Ancient Greeks', words: ['ATHENS', 'SPARTA', 'ZEUS', 'HOPLITE', 'TRIREME', 'OLYMPUS', 'MEDUSA', 'TROY', 'MINOTAUR', 'ACROPOLIS', 'HERMES', 'ATHENA', 'CYCLOPS', 'AGORA', 'PEGASUS'],
             mystery: [['HYDRA', 'Monster that grows two heads for each one cut off'], ['ORACLE', 'Where Greeks went to ask about the future']] },
  history: { name: 'Grisly History', words: ['PLAGUE', 'LEECHES', 'DUNGEON', 'VIKING', 'TUDOR', 'KNIGHT', 'MOAT', 'JESTER', 'PEASANT', 'CASTLE', 'GLADIATOR', 'PIRATE', 'CANNON', 'ARMOUR', 'SCURVY'],
             mystery: [['FLEAS', 'Tiny passengers that spread the plague'], ['GRUEL', 'Watery porridge for the poor']] },
  space:   { name: 'Space', words: ['GALAXY', 'NEBULA', 'COMET', 'ORBIT', 'SATURN', 'JUPITER', 'ROCKET', 'ASTEROID', 'ECLIPSE', 'METEOR', 'PLANET', 'NEPTUNE', 'CRATER', 'GRAVITY', 'ASTRONAUT'],
             mystery: [['VENUS', 'Hottest planet in the solar system'], ['LUNAR', 'Word for anything to do with the Moon']] },
  scifi:   { name: 'Sci-fi Battles', words: ['STARSHIP', 'BLASTER', 'ROBOT', 'ALIEN', 'LASER', 'CAPTAIN', 'PILOT', 'CRUISER', 'SHIELDS', 'ARMADA', 'EMPIRE', 'REBEL', 'HYPERDRIVE', 'WARP', 'HANGAR'],
             mystery: [['TRACTOR', '___ beam: it pulls ships in'], ['COCKPIT', 'Where the pilot sits']] },
  science: { name: 'Science Lab', words: ['ATOM', 'MAGNET', 'ENERGY', 'FOSSIL', 'NEUTRON', 'OXYGEN', 'CIRCUIT', 'BEAKER', 'PROTON', 'MOLECULE', 'VOLCANO', 'CARBON', 'GOGGLES', 'BATTERY', 'GRAVITY'],
             mystery: [['NEWTON', 'Scientist with the famous falling apple'], ['FIZZ', 'What happens when you drop a mint in cola']] },
  pets:    { name: 'Pets', words: ['BUSTER', 'PUPPY', 'KITTEN', 'HAMSTER', 'RABBIT', 'PARROT', 'COLLAR', 'LEAD', 'BISCUIT', 'BASKET', 'WHISKERS', 'PAWS', 'GOLDFISH', 'TORTOISE', 'GERBIL'],
             mystery: [['WALKIES', 'The word that makes Buster spin in circles'], ['FETCH', 'Throw it, he brings it back']] },
  cars:    { name: 'Cars', words: ['ENGINE', 'GEARBOX', 'TURBO', 'BRAKES', 'CLUTCH', 'RALLY', 'PITSTOP', 'TYRES', 'BONNET', 'SPOILER', 'EXHAUST', 'PISTON', 'DRIFT', 'MOTORWAY', 'SUNROOF'],
             mystery: [['VROOM', 'Sound of a fast start'], ['LICENCE', 'What you need before you can drive']] },
  band:    { name: 'Brass Band', words: ['CORNET', 'TROMBONE', 'TUBA', 'BUGLE', 'BANDSTAND', 'MARCH', 'TEMPO', 'TRUMPET', 'VALVE', 'MOUTHPIECE', 'EUPHONIUM', 'CYMBAL', 'ANTHEM', 'CHORD', 'RHYTHM'],
             mystery: [['ENCORE', 'What the crowd shouts for'], ['SOLO', 'When one player gets the spotlight']] },
};

const DIRS = {
  easy:   [[0, 1], [1, 0]],
  normal: [[0, 1], [1, 0], [1, 1], [-1, 1]],
  hard:   [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]],
};
const DIR_LABEL = { easy: 'Easy →↓', normal: 'Diagonals', hard: 'Backwards too' };

const DEFAULTS = {
  alf:   { skin: 'amphora',  music: 'adventure', topic: 'greeks', timer: true,  sfx: true, dir: 'hard' },
  josie: { skin: 'starship', music: 'synthwave', topic: 'space',  timer: false, sfx: true, dir: 'hard' },
};
let profiles = store.get('profiles', null) || JSON.parse(JSON.stringify(DEFAULTS));
['alf', 'josie'].forEach(p => (profiles[p] = Object.assign({}, DEFAULTS[p], profiles[p] || {})));
if (!store.get('mig.dirs', false)) { profiles.alf.dir = profiles.josie.dir = 'hard'; store.set('profiles', profiles); store.set('mig.dirs', true); }
let who = store.get('who', 'alf');
const P = () => profiles[who];
const save = () => { store.set('profiles', profiles); store.set('who', who); };

// ---------- Buster ----------
function busterSVG(eq) {
  // Buster: small white scruffy terrier x pug — upright pointy ears, broad face, short snout, big black nose, dark-rimmed eyes, chin beard
  eq = eq || (typeof S === 'function' ? S().eq : {});
  const coat = COATS[eq.coat] || COATS[''], F = coat[0], L = coat[1];
  return `<svg class="bst" viewBox="0 0 120 124" aria-hidden="true">
  <ellipse cx="60" cy="119" rx="31" ry="4" fill="rgba(0,0,0,.18)"/>
  <g class="tail"><path d="M83 96 C98 96 102 80 94 74 C88 70 84 78 90 81" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/><path d="M83 96 C98 96 102 80 94 74 C88 70 84 78 90 81" fill="none" stroke="${F}" stroke-width="6" stroke-linecap="round"/></g>
  <path d="M35 96 C33 80 44 70 60 70 C76 70 87 80 85 96 C84 108 74 112 60 112 C46 112 36 108 35 96 Z" fill="${F}" stroke="${L}" stroke-width="1.6"/>
  <path d="M44 80 l3 7 l3 -5 l3 7 l4 -6 l3 7 l4 -6 l3 7 l3 -5 l3 6" fill="none" stroke="${L}" stroke-width="1.3" stroke-linejoin="round"/>
  <rect x="44" y="98" width="11" height="18" rx="5.5" fill="${F}" stroke="${L}" stroke-width="1.4"/><rect x="65" y="98" width="11" height="18" rx="5.5" fill="${F}" stroke="${L}" stroke-width="1.4"/>
  <path d="M46 114 v3 M49.5 114 v3 M67 114 v3 M70.5 114 v3" stroke="${L}" stroke-width="1.2"/>
  ${outfitUnder(eq)}
  <g class="headbob">
    <path d="M33 38 C27 22 29 10 33 3 C42 9 50 17 54 26 Z" fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M36 31 C33 21 34 14 35.5 10 C41 14 45 19 48 25 Z" fill="#efb7b4"/>
    <path d="M87 38 C93 22 91 10 87 3 C78 9 70 17 66 26 Z" fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M84 31 C87 21 86 14 84.5 10 C79 14 75 19 72 25 Z" fill="#efb7b4"/>
    <path d="M31 50 C29 33 42 22 60 22 C78 22 91 33 89 50 C88 58 85 63 82 66 L86 70 L79 69 C74 72 67 74 60 74 C53 74 46 72 41 69 L34 70 L38 66 C35 63 32 58 31 50 Z" fill="${F}" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M40 34 q6 -5 13 -2 M67 32 q7 -3 13 2" stroke="#b9ae9d" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="58" rx="15" ry="10.5" fill="#e9e0d1"/>
    <ellipse cx="60" cy="61" rx="11" ry="6" fill="#d9cdb9" opacity=".7"/>
    <circle cx="47" cy="44" r="6.6" fill="#7d7066" opacity=".35"/><circle cx="73" cy="44" r="6.6" fill="#7d7066" opacity=".35"/>
    <circle cx="47" cy="44" r="4.8" fill="#17110e"/><circle cx="73" cy="44" r="4.8" fill="#17110e"/>
    <circle cx="48.6" cy="42.3" r="1.6" fill="#fff"/><circle cx="74.6" cy="42.3" r="1.6" fill="#fff"/>
    <path d="M52 52.5 C52 48.5 68 48.5 68 52.5 C68 57 63.5 59.5 60 59.5 C56.5 59.5 52 57 52 52.5 Z" fill="#17110e"/>
    <ellipse cx="57" cy="51.5" rx="2.4" ry="1.1" fill="#6b625c"/>
    <path d="M60 59.5 v2.5 M54 64.5 q6 -3 12 0" stroke="#5b504a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M47 66 l2 7 l3 -4 l2 7 l3 -5 l3 6 l3 -6 l3 5 l2 -7 l3 4 l2 -7" fill="${F}" stroke="${L}" stroke-width="1.2" stroke-linejoin="round"/>
    ${outfitHead(eq)}
  </g>${outfitOver(eq)}</svg>`;
}

// ---------- puzzle generation ----------
const FREQ = 'AAAAABBCCDDDEEEEEEFFGGHHIIIIIJKLLLMMNNNNOOOOOPPQRRRRSSSSTTTTUUUVWWXYYZ';
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const rot13 = s => s.replace(/[a-z]/g, c => String.fromCharCode((c.charCodeAt(0) - 84) % 26 + 97));
const BLOCK = ['fuvg', 'shpx', 'cvff', 'phag', 'nefr', 'penc', 'gjng', 'qvpx', 'pbpx', 'gvgf', 'jnax', 'frk', 'fyhg', 'obbo', 'cbea', 'enpr', 'snt', 'avt'].map(rot13).map(s => s.toUpperCase());

function tryPlace(grid, w, dirs, N) {
  for (let i = 0; i < 400; i++) {
    const [dr, dc] = dirs[rand(dirs.length)], r = rand(N), c = rand(N);
    const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
    if (er < 0 || er >= N || ec < 0 || ec >= N) continue;
    let ok = true;
    for (let k = 0; k < w.length; k++) { const ch = grid[r + dr * k][c + dc * k]; if (ch && ch !== w[k]) { ok = false; break; } }
    if (!ok) continue;
    const cells = [];
    for (let k = 0; k < w.length; k++) { grid[r + dr * k][c + dc * k] = w[k]; cells.push([r + dr * k, c + dc * k]); }
    return { w, cells, found: false };
  }
  return null;
}
function cleanRude(grid, filler, N) {
  for (let pass = 0; pass < 80; pass++) {
    let bad = null;
    scan: for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1]]) for (const L of [3, 4]) {
      const cells = [];
      for (let k = 0; k < L; k++) { const rr = r + dr * k, cc = c + dc * k; if (rr < 0 || rr >= N || cc < 0 || cc >= N) break; cells.push([rr, cc]); }
      if (cells.length < L) continue;
      const s = cells.map(([a, b]) => grid[a][b]).join('');
      if (BLOCK.includes(s) || BLOCK.includes(s.split('').reverse().join(''))) {
        const fc = cells.filter(([a, b]) => filler.has(a * N + b));
        if (fc.length) { bad = fc; break scan; }
      }
    }
    if (!bad) return;
    const [r, c] = bad[rand(bad.length)]; grid[r][c] = FREQ[rand(FREQ.length)];
  }
}
function makePuzzle(topicKey, dirMode) {
  const N = 10, T = TOPICS[topicKey];
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = Array.from({ length: N }, () => Array(N).fill(''));
    const pool = shuffle(T.words.filter(w => w.length <= N)).slice(0, 11).sort((a, b) => b.length - a.length);
    const placed = [];
    for (const w of pool) { if (placed.length >= 7) break; const p = tryPlace(grid, w, DIRS[dirMode], N); if (p) placed.push(p); }
    if (placed.length < 7) continue;
    const free = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) free.push([r, c]);
    const [mw, clue] = T.mystery[rand(T.mystery.length)];
    if (free.length < mw.length + 4) continue;
    const pickIdx = shuffle(free.map((_, i) => i)).slice(0, mw.length).sort((a, b) => a - b);
    const mcells = pickIdx.map(i => free[i]);
    mcells.forEach(([r, c], i) => (grid[r][c] = mw[i]));
    const filler = new Set();
    free.forEach(([r, c]) => { if (!grid[r][c]) { grid[r][c] = FREQ[rand(FREQ.length)]; filler.add(r * N + c); } });
    cleanRude(grid, filler, N);
    placed.sort((a, b) => a.w.localeCompare(b.w));
    return { N, grid, words: placed, mystery: { word: mw, clue, cells: mcells } };
  }
  return null;
}

// ---------- state & rendering ----------
let PZ = null, letterEls = [], caps = [], live = null, drag = null, anchor = null;
let t0 = 0, tEnd = 0, hints = 0, bonusPts = 0, bonusHad = false, done = false, colorIdx = 0;
const board = $('#board'), tilesEl = $('#tiles'), capsEl = $('#caps'), lettersEl = $('#letters');

function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function nextColor() { const s = SKINS[P().skin]; return s.caps[colorIdx++ % s.caps.length]; }

function newPuzzle() {
  PZ = makePuzzle(P().topic, P().dir);
  const N = PZ.N; board.style.setProperty('--n', N);
  tilesEl.innerHTML = ''; lettersEl.innerHTML = ''; capsEl.innerHTML = ''; caps = []; letterEls = [];
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    tilesEl.appendChild(document.createElement('div'));
    const d = document.createElement('div'); d.textContent = PZ.grid[r][c]; lettersEl.appendChild(d); letterEls.push(d);
  }
  $('#words').innerHTML = PZ.words.map((w, i) => `<li data-i="${i}">${w.w}</li>`).join('');
  $('#clue').textContent = PZ.mystery.clue;
  $('#mystSlots').textContent = PZ.mystery.word.replace(/./g, '_');
  $('#topicName').textContent = TOPICS[P().topic].name;
  $('#finish').hidden = true;
  t0 = performance.now(); tEnd = 0; hints = 0; bonusPts = 0; bonusHad = false; done = false; colorIdx = rand(8); anchor = null;
  say('Stuck? Tap me and I\'ll sniff out a letter.');
  layout(); hud();
}

function layout() {
  const w = Math.min(board.parentElement.clientWidth - 20, 560);
  if (w <= 0) return;
  board.style.width = w + 'px'; board.style.height = w + 'px';
  const gap = parseFloat(getComputedStyle(tilesEl).columnGap) || 0;
  board.style.setProperty('--cs', ((w + gap) / PZ.N - gap) + 'px');
  caps.forEach(placeCap); if (live) placeCap(live);
}
function geom() { const W = board.clientWidth, gap = parseFloat(getComputedStyle(tilesEl).columnGap) || 0, pitch = (W + gap) / PZ.N; return { pitch, cs: pitch - gap }; }
function placeCap(cp) {
  const { pitch, cs } = geom(), [a, b] = cp.ends;
  const x1 = a[1] * pitch + cs / 2, y1 = a[0] * pitch + cs / 2, x2 = b[1] * pitch + cs / 2, y2 = b[0] * pitch + cs / 2;
  const th = cs * .84, len = Math.hypot(x2 - x1, y2 - y1) + th;
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  const s = SKINS[P().skin];
  Object.assign(cp.el.style, { left: (x1 + x2) / 2 + 'px', top: (y1 + y2) / 2 + 'px', width: len + 'px', height: th + 'px', transform: `translate(-50%,-50%) rotate(${ang}deg)` });
  cp.el.style.setProperty('--c', cp.color); cp.el.style.setProperty('--cf', hexA(cp.color, s.alpha));
}
function makeCap(ends, color, cls) { const el = document.createElement('div'); el.className = 'cap ' + (cls || ''); capsEl.appendChild(el); const cp = { ends, color, el }; placeCap(cp); return cp; }
function recolourCaps() { colorIdx = 0; caps.forEach(cp => { cp.color = nextColor(); placeCap(cp); }); PZ.words.forEach(w => { if (w.found) { const li = document.querySelector(`#words li[data-i="${PZ.words.indexOf(w)}"]`); li.style.setProperty('--c', w.cap.color); } }); }

function cellAt(e) {
  const r = board.getBoundingClientRect(), N = PZ.N;
  const c = Math.max(0, Math.min(N - 1, Math.floor((e.clientX - r.left) / (r.width / N))));
  const rr = Math.max(0, Math.min(N - 1, Math.floor((e.clientY - r.top) / (r.height / N))));
  return [rr, c];
}
function snap(a, b) {
  const dr = b[0] - a[0], dc = b[1] - a[1];
  if (!dr && !dc) return [a, a];
  const k = Math.round(Math.atan2(dr, dc) / (Math.PI / 4)), ang = k * Math.PI / 4;
  const sy = Math.round(Math.sin(ang)), sx = Math.round(Math.cos(ang));
  let len = Math.max(Math.abs(dr), Math.abs(dc));
  const N = PZ.N; while (len > 0) { const r = a[0] + sy * len, c = a[1] + sx * len; if (r >= 0 && r < N && c >= 0 && c < N) break; len--; }
  return [a, [a[0] + sy * len, a[1] + sx * len]];
}
function showLive(ends) { if (!live) live = makeCap(ends, SKINS[P().skin].caps[colorIdx % SKINS[P().skin].caps.length], 'live'); else { live.ends = ends; placeCap(live); } }
function clearLive(wrong) {
  if (!live) return; const el = live.el; live = null;
  if (wrong) { el.classList.add('wrong'); setTimeout(() => el.remove(), 380); } else el.remove();
}
const same = (p, q) => p[0] === q[0] && p[1] === q[1];

board.addEventListener('pointerdown', e => {
  if (done) return; e.preventDefault(); Music.unlock();
  const c = cellAt(e);
  if (anchor) { const ends = snap(anchor, c); letterEls[anchor[0] * PZ.N + anchor[1]].classList.remove('anchor'); anchor = null; showLive(ends); finish(ends); return; }
  try { board.setPointerCapture(e.pointerId); } catch (_) {}
  drag = { start: c, cur: c, moved: false }; showLive([c, c]);
});
board.addEventListener('pointermove', e => {
  if (!drag) return; const c = cellAt(e);
  if (!same(c, drag.start)) drag.moved = true;
  drag.cur = c; showLive(snap(drag.start, c));
});
const endDrag = () => {
  if (!drag) return; const d = drag; drag = null;
  if (!d.moved) { anchor = d.start; letterEls[anchor[0] * PZ.N + anchor[1]].classList.add('anchor'); clearLive(); if (P().sfx) Music.sfx('tap'); return; }
  finish(snap(d.start, d.cur));
};
board.addEventListener('pointerup', endDrag);
board.addEventListener('pointercancel', () => { drag = null; clearLive(); });

function finish(ends) {
  const [a, b] = ends;
  const hit = PZ.words.find(w => !w.found && ((same(w.cells[0], a) && same(w.cells[w.cells.length - 1], b)) || (same(w.cells[0], b) && same(w.cells[w.cells.length - 1], a))));
  if (!hit) { if (!same(a, b) && P().sfx) Music.sfx('miss'); clearLive(!same(a, b)); return; }
  clearLive();
  hit.found = true; hit.cap = makeCap([a, b], nextColor()); caps.push(hit.cap);
  hit.cells.forEach(([r, c]) => letterEls[r * PZ.N + c].classList.add('hit'));
  const li = document.querySelector(`#words li[data-i="${PZ.words.indexOf(hit)}"]`); li.classList.add('found'); li.style.setProperty('--c', hit.cap.color);
  if (P().sfx) Music.sfx('found');
  const left = PZ.words.filter(w => !w.found).length;
  if (left === 0) return complete();
  if ((!bonusHad && left <= 2) || Math.random() < .2) busterBonus();
  else if (Math.random() < .35) say(pick(['Good find!', 'Woof! Nice one.', `${left} to go. I believe in you.`, 'That one smelled tricky.']));
  hud();
}

function busterBonus() {
  bonusHad = true; bonusPts += 50; noteBonus();
  const el = $('#bonus'); el.innerHTML = `<div class="runner">${busterSVG()}</div><div class="banner">Buster Bonus +50</div>`; el.hidden = false;
  if (P().sfx) { Music.sfx('bonus'); setTimeout(() => Music.sfx('bark'), 350); }
  say('Buster Bonus! I found 50 points under the sofa.', screen === 'menu' ? 'wordsearch' : screen);
  clearTimeout(busterBonus.t); busterBonus.t = setTimeout(() => (el.hidden = true), 2000);
  hud();
}

const pick = a => a[rand(a.length)];
function say(t, id) { document.querySelectorAll('#' + (id || 'wordsearch') + ' .stage .bubble').forEach(b => (b.textContent = t)); }
document.querySelector('#wordsearch .busterBtn').addEventListener('click', () => {
  if (done || !PZ) return;
  const left = PZ.words.filter(w => !w.found); if (!left.length) return;
  const w = pick(left), [r, c] = w.cells[0], el = letterEls[r * PZ.N + c];
  el.classList.remove('sniff'); void el.offsetWidth; el.classList.add('sniff');
  hints++; if (P().sfx) Music.sfx('bark');
  say(pick(['Sniff sniff… one starts at the wiggly letter.', 'I can smell a word right there!', 'Woof! Try starting from that one.', `Psst. ${w.w.length} letters, starts at the wiggle.`]));
  hud();
});

function score() { return PZ.words.filter(w => w.found).length * 100 + bonusPts - hints * 25; }
function fmt(ms) { const s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function hud() {
  $('#found').textContent = PZ.words.filter(w => w.found).length + '/' + PZ.words.length;
  $('#score').textContent = Math.max(0, score());
  document.querySelectorAll('.timeBox').forEach(e => (e.hidden = !P().timer));
}
setInterval(() => { if (PZ && P().timer) $('#time').textContent = fmt((tEnd || performance.now()) - t0); }, 250);

function complete() {
  done = true; tEnd = performance.now(); hud();
  if (P().sfx) Music.sfx('done');
  const M = PZ.mystery;
  M.cells.forEach(([r, c], i) => setTimeout(() => {
    letterEls[r * PZ.N + c].classList.add('myst');
    $('#mystSlots').textContent = M.word.slice(0, i + 1) + M.word.slice(i + 1).replace(/./g, '_');
  }, 300 + i * 220));
  const secs = (tEnd - t0) / 1000, stars = hints === 0 ? 3 : hints <= 2 ? 2 : 1;
  const medal = !P().timer ? '' : secs < 90 ? 'Gold — under 1:30' : secs < 150 ? 'Silver — under 2:30' : 'Bronze — finished';
  const earn = award({ kind: 'ws', stars, medal: !P().timer ? 0 : secs < 90 ? 1 : secs < 150 ? 2 : 3, clean: hints === 0 });
  const key = 'best.' + who + '.' + P().topic, best = store.get(key, null), isBest = P().timer && (!best || secs < best);
  if (isBest) store.set(key, secs);
  setTimeout(() => {
    const f = $('#finish');
    f.innerHTML = `<div><h3>All found!</h3>
      <p>The leftover letters spell</p><div class="mw">${M.word}</div>
      <p>${M.clue}</p>
      <div class="medal">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${P().timer ? ` · ${fmt(tEnd - t0)}` : ''}</div>
      ${medal ? `<p class="medal">${medal}${isBest ? ' · new best!' : ''}</p>` : ''}
      <p>Score ${Math.max(0, score())}${bonusPts ? ` (Buster Bonus +${bonusPts})` : ''}</p>${earn}
      <div class="row" style="justify-content:center"><button class="btn" id="again">Next puzzle</button><button class="btn ghost" id="look">Look at grid</button></div></div>`;
    f.hidden = false;
    $('#again').onclick = newPuzzle; $('#look').onclick = () => (f.hidden = true);
    say('Walkies? No? Fine. Another puzzle then.');
  }, 400 + M.cells.length * 220);
}

// ---------- customiser ----------
function applySkin() {
  const k = P().skin; document.body.dataset.skin = k;
  document.documentElement.style.colorScheme = SKINS[k].scheme;
  document.querySelectorAll('.skin').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k));
  if (PZ) { recolourCaps(); requestAnimationFrame(layout); }
}
function syncUI() {
  document.querySelectorAll('.who button').forEach(b => b.setAttribute('aria-pressed', b.dataset.p === who));
  document.querySelectorAll('.tune').forEach(b => { b.setAttribute('aria-pressed', b.dataset.k === P().music); b.classList.toggle('playing', Music.playing && Music.current === b.dataset.k); });
  document.querySelectorAll('#topics .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === P().topic));
  document.querySelectorAll('#dirs .chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === P().dir));
  $('#timerT').setAttribute('aria-pressed', P().timer); $('#sfxT').setAttribute('aria-pressed', P().sfx);
  $('#playBtn').textContent = Music.playing ? 'Stop music' : 'Play music';
}

$('#skins').innerHTML = Object.entries(SKINS).map(([k, s]) =>
  `<button class="skin" data-k="${k}" aria-label="${s.name} look"><span class="sw" style="background:${s.pv[0]};color:${s.pv[1]};font-family:${s.pv[2]},sans-serif;font-size:${s.pv[3]}">ABC</span><span class="nm">${s.name}</span></button>`).join('');
$('#tunes').innerHTML = Object.entries(STYLES).map(([k, s]) => `<button class="tune" data-k="${k}"><b>${s.name}</b><small>${s.tag}</small></button>`).join('');
$('#topics').innerHTML = Object.entries(TOPICS).map(([k, t]) => `<button class="chip" data-k="${k}">${t.name}</button>`).join('');
$('#dirs').innerHTML = Object.entries(DIR_LABEL).map(([k, l]) => `<button class="chip" data-k="${k}">${l}</button>`).join('');

document.querySelectorAll('.skin').forEach(b => b.onclick = () => { P().skin = b.dataset.k; save(); applySkin(); });
document.querySelectorAll('.tune').forEach(b => b.onclick = () => { P().music = b.dataset.k; save(); Music.play(b.dataset.k); syncUI(); });
document.querySelectorAll('#topics .chip').forEach(b => b.onclick = () => { P().topic = b.dataset.k; save(); syncUI(); newPuzzle(); wgNew(); cwNew(); });
document.querySelectorAll('#dirs .chip').forEach(b => b.onclick = () => { P().dir = b.dataset.k; save(); syncUI(); newPuzzle(); });
$('#timerT').onclick = () => { P().timer = !P().timer; save(); syncUI(); hud(); };
$('#sfxT').onclick = () => { P().sfx = !P().sfx; save(); syncUI(); };
$('#newBtn').onclick = newPuzzle;
$('#playBtn').onclick = () => { if (Music.playing) Music.stop(); else Music.play(P().music); syncUI(); };
$('#vol').oninput = e => Music.setVolume(+e.target.value);
document.querySelectorAll('.who button').forEach(b => b.onclick = () => {
  if (who === b.dataset.p) return; who = b.dataset.p; save(); 

applySkin(); syncUI(); newPuzzle(); wgNew(); cwNew(); drawBusters(); greet(); if (screen === 'kennel') renderKennel();
  if (Music.playing) { Music.play(P().music); syncUI(); }
});

window.addEventListener('resize', () => { if (PZ) layout(); cwLayout(); });
if (window.ResizeObserver) new ResizeObserver(() => PZ && layout()).observe(board.parentElement);

// ---------- screens & settings ----------
const SCREENS = ['menu', 'wordsearch', 'word-guess', 'crossword', 'kennel'];
let screen = 'menu';
function show() {
  const h = location.hash.slice(1); screen = SCREENS.includes(h) ? h : 'menu';
  SCREENS.forEach(id => ($('#' + id).hidden = id !== screen));
  if (screen === 'wordsearch') requestAnimationFrame(layout);
  if (screen === 'crossword') requestAnimationFrame(cwLayout);
  if (screen === 'kennel') renderKennel();
  if (screen === 'menu') { greet(); updateBones(); }
  window.scrollTo(0, 0);
}
function go(where) { try { location.hash = where || 'menu'; } catch (e) {} show(); }
window.addEventListener('hashchange', show);
document.querySelectorAll('[data-go]').forEach(b => (b.onclick = () => go(b.dataset.go)));
$('#homeBtn').onclick = () => go('');
function greet() { $('#menu .bubble').innerHTML = `Hi ${who === 'alf' ? 'Alf' : 'Josie'}! Pick a game.<small>Rank: ${RANKS[rankOf(S().life)][1]}</small>`; }

let tab = 'look';
function setTab(t) {
  tab = t;
  document.querySelectorAll('.tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === t));
  document.querySelectorAll('.pane').forEach(p => (p.hidden = p.dataset.pane !== t));
}
document.querySelectorAll('.tabs button').forEach(b => (b.onclick = () => setTab(b.dataset.tab)));
function openSet() { $('#setTitle').textContent = 'Settings · ' + (who === 'alf' ? 'Alf' : 'Josie'); setTab(tab); $('#sheet').hidden = false; $('#closeSet').focus(); }
function closeSet() { $('#sheet').hidden = true; if (screen === 'wordsearch') requestAnimationFrame(layout); if (screen === 'crossword') requestAnimationFrame(cwLayout); }
$('#setBtn').onclick = openSet; $('#closeSet').onclick = closeSet;
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSet(); });

// ---------- Word Guess ----------
const WG_ANS = {
  greeks: 'AGORA ATLAS HADES SIREN HYDRA TITAN PLATO HELEN MUSES SPEAR',
  history: 'TUDOR JOUST FLEAS GRUEL SWORD ROMAN SAXON CROWN TOWER KNAVE',
  space: 'ORBIT COMET VENUS LUNAR SOLAR PLUTO EARTH ORION SPACE DWARF',
  scifi: 'LASER ROBOT ALIEN REBEL PILOT CLONE BLAST FLEET RADAR SHIPS',
  science: 'ATOMS GENES CELLS PRISM FLASK SOLID ACIDS OPTIC FORCE SPARK',
  pets: 'PUPPY BUNNY FETCH TREAT BARKS HORSE GECKO SNIFF KITTY PERCH',
  cars: 'TURBO BRAKE TYRES DRIFT RALLY MOTOR WHEEL GEARS VROOM PEDAL',
  band: 'TEMPO BUGLE CHORD MARCH VALVE BRASS DRUMS NOTES TUNES STAVE',
};
const VALID = new Set(WORDS5.split(' '));
Object.values(WG_ANS).forEach(s => s.split(' ').forEach(w => VALID.add(w)));
const WG = { ans: '', rows: [], cur: '', done: false, t0: 0, tEnd: 0, hints: 0, given: [], tiles: [], keys: {} };
function wgMsg(t) { $('#wgMsg').textContent = t; }
function wgNew() {
  const list = WG_ANS[P().topic].split(' ');
  let a; do { a = pick(list); } while (list.length > 1 && a === WG.ans);
  Object.assign(WG, { ans: a, rows: [], cur: '', done: false, t0: 0, tEnd: 0, hints: 0, given: [], keys: {} });
  const g = $('#wgGrid'); g.innerHTML = ''; WG.tiles = [];
  for (let r = 0; r < 6; r++) {
    const row = document.createElement('div'); row.className = 'wgRow'; const ts = [];
    for (let c = 0; c < 5; c++) { const t = document.createElement('div'); t.className = 'wgTile'; t.style.setProperty('--i', c); row.appendChild(t); ts.push(t); }
    g.appendChild(row); WG.tiles.push(ts);
  }
  $('#kb').innerHTML = ['QWERTYUIOP', 'ASDFGHJKL', '+ZXCVBNM-'].map(r => '<div>' + r.split('').map(k =>
    k === '+' ? '<button class="wide" data-k="ENTER">Enter</button>' : k === '-' ? '<button class="wide" data-k="DEL" aria-label="Delete">⌫</button>' : `<button data-k="${k}">${k}</button>`).join('') + '</div>').join('');
  $('#wgTopic').textContent = TOPICS[P().topic].name;
  $('#wgFinish').hidden = true; $('#wgTime').textContent = '0:00';
  $('#wgStreak').textContent = store.get('streak.' + who, 0);
  wgMsg(`It's a five-letter word from the ${TOPICS[P().topic].name} pack.`);
  say("Tap me and I'll dig up one letter.", 'word-guess');
}
function wgDraw() { const r = WG.rows.length; if (r > 5) return; WG.tiles[r].forEach((t, i) => { t.textContent = WG.cur[i] || ''; t.classList.toggle('filled', !!WG.cur[i]); }); }
function grade(g, a) {
  const res = Array(5).fill('x'), cnt = {};
  for (let i = 0; i < 5; i++) { if (g[i] === a[i]) res[i] = 'g'; else cnt[a[i]] = (cnt[a[i]] || 0) + 1; }
  for (let i = 0; i < 5; i++) if (res[i] !== 'g' && cnt[g[i]]) { res[i] = 'n'; cnt[g[i]]--; }
  return res;
}
function shake() { const row = WG.tiles[WG.rows.length][0].parentElement; row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); if (P().sfx) Music.sfx('miss'); }
function wgKey(k) {
  if (WG.done) return; Music.unlock();
  if (!WG.t0) WG.t0 = performance.now();
  if (k === 'DEL') WG.cur = WG.cur.slice(0, -1);
  else if (k === 'ENTER') {
    if (WG.cur.length < 5) { wgMsg('Five letters needed.'); return shake(); }
    if (!VALID.has(WG.cur)) { wgMsg(`${WG.cur} isn't in the word list.`); return shake(); }
    const g = WG.cur, res = grade(g, WG.ans), r = WG.rows.length;
    WG.rows.push(g); WG.cur = '';
    WG.tiles[r].forEach((t, i) => { t.classList.remove('filled'); t.classList.add(res[i]); });
    const rank = { x: 1, n: 2, g: 3 };
    setTimeout(() => {
      g.split('').forEach((ch, i) => { if (!WG.keys[ch] || rank[res[i]] > rank[WG.keys[ch]]) WG.keys[ch] = res[i]; });
      document.querySelectorAll('#kb button[data-k]').forEach(b => { const s = WG.keys[b.dataset.k]; b.classList.remove('g', 'n', 'x'); if (s) b.classList.add(s); });
    }, 650);
    if (g === WG.ans) return wgEnd(true);
    if (P().sfx) Music.sfx(res.includes('g') ? 'found' : 'tap');
    if (WG.rows.length === 6) return wgEnd(false);
    wgMsg(pick(['Keep going.', 'Getting warmer?', 'Use those colours.', `${6 - WG.rows.length} tries left.`]));
    return;
  } else if (/^[A-Z]$/.test(k) && WG.cur.length < 5) WG.cur += k;
  wgDraw();
}
function wgEnd(win) {
  WG.done = true; WG.tEnd = performance.now();
  const n = WG.rows.length, streak = win ? store.get('streak.' + who, 0) + 1 : 0;
  store.set('streak.' + who, streak); $('#wgStreak').textContent = streak;
  const stars = win ? Math.max(1, (n <= 3 ? 3 : n <= 5 ? 2 : 1) - (WG.hints > 1 ? 1 : 0)) : 0;
  const secs = (WG.tEnd - WG.t0) / 1000;
  const medal = !win || !P().timer ? '' : secs < 60 ? 'Gold — under 1:00' : secs < 120 ? 'Silver — under 2:00' : 'Bronze — solved';
  const earn = award({ kind: win ? 'wgw' : 'wgl', n, streak, stars, medal: !medal ? 0 : secs < 60 ? 1 : secs < 120 ? 2 : 3, clean: win && !WG.hints });
  if (P().sfx) setTimeout(() => Music.sfx(win ? 'done' : 'miss'), 600);
  if (win && !WG.hints && n <= 3) setTimeout(busterBonus, 900);
  setTimeout(() => {
    const f = $('#wgFinish');
    f.innerHTML = `<div><h3>${win ? (n === 1 ? 'First try!' : `Got it in ${n}!`) : 'So close!'}</h3>
      <p>The word was</p><div class="mw">${WG.ans}</div>
      ${win ? `<div class="medal">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${P().timer ? ` · ${fmt(WG.tEnd - WG.t0)}` : ''}</div>` : '<p>Streak reset. Buster still loves you.</p>'}
      ${medal ? `<p class="medal">${medal}</p>` : ''}
      <p>Streak: ${streak}</p>${earn}
      <div class="row" style="justify-content:center"><button class="btn" id="wgAgain">Next word</button><button class="btn ghost" id="wgLook">Look at grid</button></div></div>`;
    f.hidden = false; $('#wgAgain').onclick = wgNew; $('#wgLook').onclick = () => (f.hidden = true);
    wgMsg(win ? 'Nice one.' : `It was ${WG.ans}.`);
  }, 900);
}
$('#kb').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) wgKey(b.dataset.k); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#sheet').hidden) return closeSet();
  if (!$('#sheet').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if (screen === 'crossword') {
    if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); cwStep(e.shiftKey ? -1 : 1); } else if (e.key === 'Backspace') cwKey('DEL'); else if (/^[a-z]$/i.test(e.key)) cwKey(e.key.toUpperCase());
    return;
  }
  if (screen !== 'word-guess') return;
  if (e.key === 'Enter') { e.preventDefault(); wgKey('ENTER'); } else if (e.key === 'Backspace') wgKey('DEL'); else if (/^[a-z]$/i.test(e.key)) wgKey(e.key.toUpperCase());
});
document.querySelector('#word-guess .busterBtn').addEventListener('click', () => {
  if (WG.done) return;
  const known = new Set(); WG.rows.forEach(g => grade(g, WG.ans).forEach((s, i) => s === 'g' && known.add(i)));
  const opts = [0, 1, 2, 3, 4].filter(i => !known.has(i) && !WG.given.includes(i));
  if (!opts.length) return say('You already know every letter. Go on!', 'word-guess');
  const i = pick(opts); WG.given.push(i); WG.hints++;
  if (P().sfx) Music.sfx('bark');
  const ord = ['first', 'second', 'third', 'fourth', 'fifth'][i];
  say(`Dug it up! The ${ord} letter is ${WG.ans[i]}.`, 'word-guess');
});
$('#wgNew').onclick = wgNew;
setInterval(() => { if (screen === 'word-guess' && P().timer && WG.t0) $('#wgTime').textContent = fmt((WG.tEnd || performance.now()) - WG.t0); }, 250);


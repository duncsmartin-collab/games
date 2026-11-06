// ---------- Crossword ----------
const CW_CLUES = {
  greeks: `ATHENS|City named after the goddess of wisdom
SPARTA|Tough warrior city where boys trained from age seven
ZEUS|King of the gods, fond of a thunderbolt
HOPLITE|Greek foot soldier with a big round shield
TRIREME|Warship with three rows of oars
OLYMPUS|Mountain home of the gods
MEDUSA|Gorgon whose stare turned people to stone
TROY|City fooled by a giant wooden horse
MINOTAUR|Half-man, half-bull, lives in a maze
ACROPOLIS|Hilltop fortress above Athens
HERMES|Messenger god with winged sandals
ATHENA|Goddess of wisdom, with an owl
CYCLOPS|Giant with a single eye
AGORA|Open marketplace where Greeks met to chat
PEGASUS|Winged horse
HYDRA|Monster that grows two heads for each one cut off
ORACLE|Priestess at Delphi who predicted the future
ATLAS|Titan made to hold up the sky
HADES|God of the underworld
SIREN|Sea creature whose song lured sailors onto rocks
TITAN|Giant god from before Zeus took charge
PLATO|Famous thinker who learned from Socrates
SPEAR|Long pointed weapon a hoplite carried
MUSES|Nine goddesses of art, music and poetry
TEMPLE|Building with columns where gods were worshipped`,
  history: `PLAGUE|The Black Death was one
LEECHES|Slimy bloodsuckers doctors once used as medicine
DUNGEON|Damp prison under a castle
VIKING|Raider who sailed in a longship
TUDOR|Henry VIII's royal family
KNIGHT|Armoured warrior on horseback
MOAT|Water-filled ditch around a castle
JESTER|Court clown in a hat with bells
PEASANT|Poor farm worker in the Middle Ages
CASTLE|Stone fortress with towers and battlements
GLADIATOR|Roman who fought in the arena
PIRATE|Sea robber after treasure
CANNON|Big gun that fires iron balls
ARMOUR|Metal suit a knight wears
SCURVY|Sailors' illness from no fruit or veg
FLEAS|Tiny biters that spread the plague
GRUEL|Thin, watery porridge
JOUST|Knights charging at each other with lances
SWORD|Blade for fighting
ROMAN|Soldier from an empire famous for straight roads
SAXON|Anglo-___: early English settler
CROWN|What a king or queen wears
TOWER|The ___ of London, home of ravens
KNAVE|Old word for a dishonest rascal
TOILET|Medieval ones were called garderobes`,
  space: `GALAXY|Huge family of stars, like the Milky Way
NEBULA|Glowing cloud where stars are born
COMET|Icy visitor with a glowing tail
ORBIT|Path one object takes around another
SATURN|Planet with the most famous rings
JUPITER|Biggest planet in the solar system
ROCKET|Launches astronauts into space
ASTEROID|Space rock, lots between Mars and Jupiter
ECLIPSE|When the Moon blocks out the Sun
METEOR|Shooting star
PLANET|Earth is one
NEPTUNE|Blue planet furthest from the Sun
CRATER|Hole left by a space rock smashing in
GRAVITY|Force that keeps your feet on the ground
ASTRONAUT|Person trained to travel into space
VENUS|Hottest planet in the solar system
LUNAR|To do with the Moon
SOLAR|To do with the Sun
PLUTO|Dwarf planet that used to be the ninth planet
EARTH|Third planet from the Sun
ORION|Hunter constellation with a three-star belt
DWARF|___ planet, like Pluto
MARS|The red planet
STAR|The Sun is one`,
  scifi: `STARSHIP|Spacecraft built for long voyages
BLASTER|Sci-fi laser pistol
ROBOT|Mechanical helper or enemy
ALIEN|Being from another world
LASER|Narrow beam of light
CAPTAIN|Person in charge of the ship
PILOT|Flies the ship
CRUISER|Large warship
SHIELDS|Raise these before the enemy fires
ARMADA|Huge fleet of warships
EMPIRE|Galaxy-ruling baddies, usually
REBEL|Fighter against an evil empire
HYPERDRIVE|Engine for jumping faster than light
WARP|___ speed: faster than light
HANGAR|Where spaceships are parked
TRACTOR|___ beam: it pulls ships in
COCKPIT|Where the pilot sits
CLONE|Exact copy of a living thing
FLEET|Group of ships flying together
RADAR|Spots ships far away
DROID|Robot sidekick
PLANET|World a ship might land on
ORBIT|Circle a planet before landing`,
  science: `ATOM|Tiny building block of everything
MAGNET|Picks up paperclips but not aluminium
ENERGY|What a battery stores
FOSSIL|Ancient creature turned to rock
NEUTRON|Particle in an atom with no charge
OXYGEN|Gas we need to breathe
CIRCUIT|Loop that electricity flows around
BEAKER|Glass container in a science lab
PROTON|Positive particle in the middle of an atom
MOLECULE|Two or more atoms joined together
VOLCANO|Mountain that can erupt lava
CARBON|Element in diamonds and pencil lead
GOGGLES|Protect your eyes during experiments
BATTERY|Powers a torch or a TV remote
GRAVITY|Pulls things down to the ground
NEWTON|Scientist with the famous falling apple
GENES|Instructions you inherit from your parents
CELLS|Tiny units all living things are made of
PRISM|Glass shape that splits light into a rainbow
FLASK|Lab bottle with a narrow neck
SOLID|Not a liquid or a gas
SPARK|Tiny flash of electricity
FORCE|A push or a pull
FIZZ|Bubbles in a drink
ROBOT|Machine you can program`,
  pets: `BUSTER|This family's favourite dog
PUPPY|Young dog
KITTEN|Young cat
HAMSTER|Small pet that stuffs food in its cheeks
RABBIT|Long-eared pet that thumps its back feet
PARROT|Colourful bird that can copy words
COLLAR|Goes round a dog's neck
LEAD|Clip this on before a walk
BISCUIT|Crunchy dog treat
BASKET|Cosy bed for a pet
WHISKERS|Face hairs a cat uses to feel its way
PAWS|A dog's feet
GOLDFISH|Orange pet that swims in a bowl
TORTOISE|Slow pet that carries its house
GERBIL|Desert rodent with a long tail
WALKIES|The word that makes Buster spin in circles
FETCH|Throw it, he brings it back
TREAT|Reward for a good boy
GECKO|Little lizard that climbs walls
SNIFF|What a dog does at every lamp post
PERCH|Where a bird sits in its cage
HORSE|Pet you can ride
BONE|A dog might bury one
VET|Animal doctor`,
  cars: `ENGINE|The part that makes a car go
GEARBOX|Automatic or manual, it changes gear
TURBO|Boost that squeezes more power from an engine
BRAKES|Press these to stop
CLUTCH|Pedal for changing gear in a manual car
RALLY|Race on dirt and gravel roads
PITSTOP|Quick tyre change in the middle of a race
TYRES|Rubber rings that grip the road
BONNET|Lid over the engine
SPOILER|Wing on the back of a fast car
EXHAUST|Pipe where the fumes come out
PISTON|Moves up and down inside the engine
DRIFT|Slide sideways round a corner on purpose
MOTORWAY|Big fast road like the M1
SUNROOF|Window in the car's roof
VROOM|Sound of a fast start
LICENCE|What you need before you can drive
WHEEL|Steering ___
PEDAL|Push it with your foot
MOTOR|Another word for engine
GEARS|First, second, third and so on
HORN|Beep beep
BOOT|Where the shopping goes
DIESEL|Fuel that isn't petrol`,
  band: `CORNET|Small brass instrument, like a compact trumpet
TROMBONE|Brass instrument with a slide
TUBA|Biggest, lowest brass instrument
BUGLE|Simple army horn with no valves
BANDSTAND|Outdoor stage in a park
MARCH|Music for walking in step
TEMPO|Speed of the music
TRUMPET|Bright brass instrument with three valves
VALVE|Button you press on a cornet to change notes
MOUTHPIECE|Cup-shaped part you buzz your lips into
EUPHONIUM|Mellow brass instrument, like a small tuba
CYMBAL|Crashing metal plate in the percussion
ANTHEM|Song for a country or a team
CHORD|Several notes played together
RHYTHM|Pattern of beats
ENCORE|What the crowd shouts for at the end
SOLO|When one player gets the spotlight
BRASS|Metal family of instruments
DRUMS|They keep the beat
NOTES|Written on a stave
STAVE|Five lines music is written on
TUNES|Songs or melodies
SCALE|Do re mi fa so la ti do
BAND|Group of musicians`,
};
const CW_LIST = {};
Object.entries(CW_CLUES).forEach(([k, s]) => (CW_LIST[k] = s.split('\n').map(l => l.split('|'))));

function genCrossword(list) {
  const MAXC = 11, MAXR = 12, WANT = 10;
  let best = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const pool = shuffle(list).filter(([w]) => w.length >= 3 && w.length <= MAXC);
    const seed = pick(pool.slice().sort((a, b) => b[0].length - a[0].length).slice(0, 6));
    const G = new Map(), D = new Map(), K = (r, c) => r * 100 + c, placed = [];
    let minR = 50, maxR = 50, minC = 50, maxC = 50, inters = 0;
    const put = (w, clue, r, c, dir) => {
      const dr = dir === 'd' ? 1 : 0, dc = 1 - dr;
      for (let k = 0; k < w.length; k++) {
        const rr = r + dr * k, cc = c + dc * k, key = K(rr, cc);
        G.set(key, w[k]); const d = D.get(key) || {}; d[dir] = 1; D.set(key, d);
        minR = Math.min(minR, rr); maxR = Math.max(maxR, rr); minC = Math.min(minC, cc); maxC = Math.max(maxC, cc);
      }
      placed.push({ w, clue, r, c, dir });
    };
    const fits = (w, r, c, dir) => {
      const dr = dir === 'd' ? 1 : 0, dc = 1 - dr;
      if (G.has(K(r - dr, c - dc)) || G.has(K(r + dr * w.length, c + dc * w.length))) return -1;
      let n = 0;
      for (let k = 0; k < w.length; k++) {
        const rr = r + dr * k, cc = c + dc * k, ch = G.get(K(rr, cc));
        if (ch !== undefined) { if (ch !== w[k] || (D.get(K(rr, cc)) || {})[dir]) return -1; n++; }
        else if (G.has(K(rr + dc, cc + dr)) || G.has(K(rr - dc, cc - dr))) return -1;
      }
      const r1 = r + dr * (w.length - 1), c1 = c + dc * (w.length - 1);
      if (Math.max(maxR, r1) - Math.min(minR, r) + 1 > MAXR || Math.max(maxC, c1) - Math.min(minC, c) + 1 > MAXC) return -1;
      return n;
    };
    put(seed[0], seed[1], 50, 50, 'a');
    const rest = pool.filter(p => p !== seed && p[0] !== seed[0]);
    for (let pass = 0; pass < 2 && placed.length < WANT; pass++) {
      for (const [w, clue] of rest) {
        if (placed.length >= WANT || placed.some(p => p.w === w)) continue;
        let cands = [], top = 0;
        G.forEach((ch, key) => {
          const rr = Math.floor(key / 100), cc = key % 100;
          for (let i = 0; i < w.length; i++) if (w[i] === ch) for (const dir of ['a', 'd']) {
            const r = dir === 'd' ? rr - i : rr, c = dir === 'a' ? cc - i : cc, n = fits(w, r, c, dir);
            if (n < 1) continue;
            if (n > top) { top = n; cands = []; }
            if (n === top) cands.push([r, c, dir]);
          }
        });
        if (cands.length) { const [r, c, dir] = pick(cands); put(w, clue, r, c, dir); inters += top; }
      }
    }
    const area = (maxR - minR + 1) * (maxC - minC + 1);
    const score = placed.length * 12 + inters * 3 - area / 6 + (placed.some(p => p.dir === 'd') ? 0 : -100);
    if (!best || score > best.score) best = { score, placed: placed.map(p => Object.assign({}, p, { r: p.r - minR, c: p.c - minC })), rows: maxR - minR + 1, cols: maxC - minC + 1 };
    if (placed.length >= WANT && attempt > 15) break;
  }
  // numbering in reading order
  const starts = {}; let num = 0;
  best.placed.slice().sort((a, b) => a.r - b.r || a.c - b.c).forEach(p => { const k = p.r + ',' + p.c; if (!starts[k]) starts[k] = ++num; p.num = starts[k]; });
  best.placed.forEach(p => { p.cells = []; for (let k = 0; k < p.w.length; k++) p.cells.push((p.r + (p.dir === 'd' ? k : 0)) + ',' + (p.c + (p.dir === 'a' ? k : 0))); p.solved = false; });
  return best;
}

const CW = { words: [], order: [], at: {}, rows: 0, cols: 0, sel: '', wi: 0, entry: {}, locked: new Set(), rev: new Set(), els: {}, done: false, t0: 0, tEnd: 0, hints: 0 };
function cwNew() {
  const g = genCrossword(CW_LIST[P().topic]);
  Object.assign(CW, { words: g.placed, rows: g.rows, cols: g.cols, entry: {}, locked: new Set(), rev: new Set(), done: false, t0: 0, tEnd: 0, hints: 0, at: {}, els: {} });
  CW.words.forEach((w, i) => w.cells.forEach(c => { (CW.at[c] = CW.at[c] || {})[w.dir] = i; }));
  CW.order = CW.words.map((w, i) => i).sort((a, b) => (CW.words[a].dir > CW.words[b].dir ? 1 : CW.words[a].dir < CW.words[b].dir ? -1 : CW.words[a].num - CW.words[b].num));
  const nums = {}; CW.words.forEach(w => (nums[w.cells[0]] = w.num));
  const grid = $('#cwGrid'); grid.innerHTML = '';
  for (let r = 0; r < CW.rows; r++) for (let c = 0; c < CW.cols; c++) {
    const k = r + ',' + c, d = document.createElement('div');
    if (CW.at[k]) { d.className = 'cwCell'; d.dataset.k = k; d.innerHTML = (nums[k] ? `<span class="num">${nums[k]}</span>` : '') + '<span class="ch"></span>'; CW.els[k] = d; }
    else d.className = 'cwBlock';
    grid.appendChild(d);
  }
  const li = dir => CW.order.filter(i => CW.words[i].dir === dir).map(i => `<li data-i="${i}"><button><b>${CW.words[i].num}</b><span>${CW.words[i].clue} <small>(${CW.words[i].w.length})</small></span></button></li>`).join('');
  $('#cwAcross').innerHTML = li('a'); $('#cwDown').innerHTML = li('d');
  $('#cwKb').innerHTML = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM-'].map(r => '<div>' + r.split('').map(k => k === '-' ? '<button class="wide" data-k="DEL" aria-label="Delete">⌫</button>' : `<button data-k="${k}">${k}</button>`).join('') + '</div>').join('');
  $('#cwTopic').textContent = TOPICS[P().topic].name;
  $('#cwFinish').hidden = true; $('#cwTime').textContent = '0:00';
  say("Stuck? Tap me and I'll dig up a letter.", 'crossword');
  cwSelect(CW.order[0]); cwLayout(); cwHud();
}
function cwLayout() {
  const grid = $('#cwGrid'), avail = grid.parentElement.clientWidth - 26; if (avail <= 0 || !CW.cols) return;
  const cell = Math.max(18, Math.min(48, Math.floor((avail - 2 * (CW.cols - 1)) / CW.cols)));
  grid.style.setProperty('--cols', CW.cols); grid.style.setProperty('--cell', cell + 'px');
}
function cwSelect(i, cell) {
  const w = CW.words[i]; CW.wi = i;
  CW.sel = cell || w.cells.find(c => !CW.entry[c] && !CW.locked.has(c)) || w.cells.find(c => !CW.locked.has(c)) || w.cells[0];
  cwRender();
}
function cwRender() {
  const w = CW.words[CW.wi], inw = new Set(w.cells);
  Object.entries(CW.els).forEach(([k, el]) => {
    el.classList.toggle('inw', inw.has(k)); el.classList.toggle('cur', k === CW.sel);
    el.classList.toggle('ok', CW.locked.has(k)); el.classList.toggle('rev', CW.rev.has(k));
    el.lastChild.textContent = CW.entry[k] || '';
  });
  $('#cwClue').innerHTML = `<small>${w.num} ${w.dir === 'a' ? 'Across' : 'Down'} · ${w.w.length} letters</small>${w.clue}`;
  document.querySelectorAll('.cwLists li').forEach(li => { const i = +li.dataset.i; li.classList.toggle('on', i === CW.wi); li.classList.toggle('ok', CW.words[i].solved); });
}
function cwHud() { $('#cwSolved').textContent = CW.words.filter(w => w.solved).length + '/' + CW.words.length; }
function cwBad(w) {
  w.cells.forEach(c => { const el = CW.els[c]; el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); });
  setTimeout(() => w.cells.forEach(c => CW.els[c].classList.remove('bad')), 700);
  if (P().sfx) Music.sfx('miss');
}
function cwCheck(cell) {
  let solved = false;
  ['a', 'd'].forEach(d => {
    const i = CW.at[cell][d]; if (i == null) return;
    const w = CW.words[i]; if (w.solved || !w.cells.every(c => CW.entry[c])) return;
    if (w.cells.every((c, j) => CW.entry[c] === w.w[j])) { w.solved = true; w.cells.forEach(c => CW.locked.add(c)); solved = true; }
    else cwBad(w);
  });
  if (solved) {
    if (P().sfx) Music.sfx('found'); cwHud();
    if (CW.words.every(w => w.solved)) { cwRender(); cwEnd(); return true; }
    if (Math.random() < .15) busterBonus();
    else if (Math.random() < .3) say(pick(['Good boy! I mean, good solving.', 'Woof! Got one.', 'That clue was a tough chew.']), 'crossword');
  }
  return solved;
}
function cwStep(dir) {
  const pos = CW.order.indexOf(CW.wi);
  for (let s = 1; s <= CW.order.length; s++) { const i = CW.order[(pos + dir * s + CW.order.length * 2) % CW.order.length]; if (!CW.words[i].solved) return cwSelect(i); }
}
function cwKey(k) {
  if (CW.done) return; Music.unlock(); if (!CW.t0) CW.t0 = performance.now();
  const w = CW.words[CW.wi]; let idx = w.cells.indexOf(CW.sel);
  if (k === 'DEL') {
    if (CW.entry[CW.sel] && !CW.locked.has(CW.sel)) delete CW.entry[CW.sel];
    else for (let j = idx - 1; j >= 0; j--) { const c = w.cells[j]; if (!CW.locked.has(c)) { CW.sel = c; delete CW.entry[c]; break; } }
    return cwRender();
  }
  if (!/^[A-Z]$/.test(k)) return;
  if (CW.locked.has(CW.sel)) { const nx = w.cells.slice(idx).find(c => !CW.locked.has(c)); if (!nx) return cwStep(1); CW.sel = nx; idx = w.cells.indexOf(nx); }
  CW.entry[CW.sel] = k;
  const solvedNow = cwCheck(CW.sel); if (CW.done) return;
  if (w.solved) return cwStep(1);
  const nx = w.cells.slice(idx + 1).find(c => !CW.locked.has(c));
  if (nx) CW.sel = nx;
  if (!solvedNow && P().sfx) Music.sfx('tap');
  cwRender();
}
function cwEnd() {
  CW.done = true; CW.tEnd = performance.now();
  const secs = (CW.tEnd - (CW.t0 || CW.tEnd)) / 1000, stars = CW.hints === 0 ? 3 : CW.hints <= 2 ? 2 : 1;
  const medal = !P().timer ? 0 : secs < 150 ? 1 : secs < 300 ? 2 : 3;
  const earn = award({ kind: 'cw', stars, medal, clean: CW.hints === 0 });
  if (P().sfx) setTimeout(() => Music.sfx('done'), 300);
  setTimeout(() => {
    const f = $('#cwFinish');
    f.innerHTML = `<div><h3>Crossword complete!</h3>
      <div class="medal">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}${P().timer ? ` · ${fmt(CW.tEnd - CW.t0)}` : ''}</div>
      ${medal ? `<p class="medal">${['', 'Gold — under 2:30', 'Silver — under 5:00', 'Bronze — finished'][medal]}</p>` : ''}
      <p>${CW.words.length} words${CW.hints ? `, ${CW.hints} hint${CW.hints > 1 ? 's' : ''}` : ', no hints'}</p>${earn}
      <div class="row" style="justify-content:center"><button class="btn" id="cwAgain">Next crossword</button><button class="btn ghost" id="cwLook">Look at grid</button></div></div>`;
    f.hidden = false; $('#cwAgain').onclick = cwNew; $('#cwLook').onclick = () => (f.hidden = true);
    say('Crossword done! Can we go for walkies now?', 'crossword');
  }, 700);
}
$('#cwGrid').addEventListener('click', e => {
  const el = e.target.closest('.cwCell'); if (!el || CW.done) return; Music.unlock();
  const k = el.dataset.k, at = CW.at[k], cur = CW.words[CW.wi].dir, other = cur === 'a' ? 'd' : 'a';
  if (k === CW.sel && at[other] != null) return cwSelect(at[other], k);
  cwSelect(at[cur] != null ? at[cur] : at[other], k);
});
$('#cwKb').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) cwKey(b.dataset.k); });
$('#cwPrev').onclick = () => cwStep(-1); $('#cwNext').onclick = () => cwStep(1);
$('.cwLists').addEventListener('click', e => { const li = e.target.closest('li'); if (li) { cwSelect(+li.dataset.i); $('#cwGrid').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } });
document.querySelector('#crossword .busterBtn').addEventListener('click', () => {
  if (CW.done) return;
  let w = CW.words[CW.wi]; if (w.solved) { cwStep(1); w = CW.words[CW.wi]; }
  const opts = w.cells.filter(c => CW.entry[c] !== w.w[w.cells.indexOf(c)]);
  if (!opts.length) return;
  const c = pick(opts); CW.entry[c] = w.w[w.cells.indexOf(c)]; CW.locked.add(c); CW.rev.add(c); CW.hints++;
  if (!CW.t0) CW.t0 = performance.now();
  if (P().sfx) Music.sfx('bark');
  say(`Dug one up! ${w.num} ${w.dir === 'a' ? 'Across' : 'Down'} has a ${CW.entry[c]} in it.`, 'crossword');
  cwCheck(c); if (CW.done) return; if (w.solved) cwStep(1); else cwRender();
});
$('#cwNew').onclick = cwNew;
setInterval(() => { if (screen === 'crossword' && P().timer && CW.t0) $('#cwTime').textContent = fmt((CW.tEnd || performance.now()) - CW.t0); }, 250);

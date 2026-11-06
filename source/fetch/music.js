// ---------- Music engine: small WebAudio sequencer ----------
const STYLES = {
  adventure: { name: 'Adventure', tag: 'Classic quest · 140 bpm', bpm: 140, swing: 0,
    chords: ['C', 'Am', 'F', 'G', 'C', 'Em', 'F|G', 'C'],
    mel: 'G4:2 C5:2 E5:2 G5:4 E5:2 C5:2 E5:2 | A5:6 G5:2 E5:4 C5:4 | F5:2 E5:2 F5:2 A5:6 G5:2 F5:2 | G5:8 D5:4 B4:4 | G4:2 C5:2 E5:2 G5:4 C6:2 B5:2 C6:2 | B5:6 G5:2 E5:4 G5:4 | A5:4 C6:4 B5:4 D6:4 | C6:8 G5:2 E5:2 C5:4',
    lead: { wave: 'p25', cut: 5000, a: .004, d: .18, s: .7, r: .05, g: .42, vib: 18, vd: .18 },
    bass: { oct: 2, pat: 'R_O_R_O_R_O_5_O_', gate: .8, v: { wave: 'triangle', a: .003, d: .1, s: .9, r: .03, g: .85 } },
    harm: [{ mode: 'arp', oct: 4, pat: '0121012101210121', len: .8, v: { wave: 'p12', cut: 6000, a: .002, d: .07, s: .3, r: .03, g: .13 } }],
    drums: { k: 'x.......x.x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, crash: [0],
    fx: { rev: .12, dly: [3, .25, .18] }, mix: { lead: .34, bass: .42, harm: .2, drums: .4 } },

  rock: { name: 'Rock', tag: 'Big guitars · 150 bpm', bpm: 150, swing: 0,
    chords: ['Em', 'Em', 'C', 'D', 'Em', 'Em', 'C', 'B7'],
    mel: 'E5:4 G5:2 A5:2 B5:6 A5:2 | G5:2 A5:2 G5:2 E5:2 D5:4 E5:4 | E5:4 G5:4 C6:4 B5:2 A5:2 | A5:6 F#5:2 D5:4 F#5:4 | E5:4 G5:2 A5:2 B5:4 D6:4 | E6:6 D6:2 B5:4 G5:4 | A5:4 B5:4 C6:4 E6:4 | D#6:8 B5:4 F#5:4',
    lead: { wave: 'sawtooth', uni: 2, det: 12, cut: 3000, res: 1.5, shape: 1, a: .01, d: .3, s: .8, r: .1, g: .2, vib: 28, vd: .18, glide: .03 },
    bass: { oct: 2, pat: 'R.R.R.R.R.R.R.R.', gate: .85, v: { wave: 'sawtooth', cut: 800, a: .004, d: .2, s: .8, r: .04, g: .55 } },
    harm: [{ mode: 'power', oct: 3, pat: 'x.x.x.x.x.x.xxx.', len: 1.5, v: { wave: 'sawtooth', uni: 2, det: 10, shape: 1, cut: 2400, a: .003, d: .15, s: .6, r: .04, g: .1 } }],
    drums: { k: 'x.....x.x.....x.', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.' }, crash: [0, 4],
    fx: { rev: .15, dly: [3, .2, .12] }, mix: { lead: .36, bass: .4, harm: .24, drums: .46 } },

  pop: { name: 'Pop', tag: 'Sing-along · 112 bpm', bpm: 112, swing: 0,
    chords: ['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'D'],
    mel: 'B4:3 D5:3 G5:2 F#5:2 G5:2 A5:4 | F#5:3 A5:3 D5:6 -:4 | G5:3 B5:3 E5:2 G5:2 F#5:2 E5:4 | E5:6 D5:2 C5:2 D5:6 | B4:3 D5:3 G5:2 F#5:2 G5:2 B5:4 | A5:3 F#5:3 D6:6 -:4 | E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 | A5:8 F#5:4 D5:4',
    lead: { wave: 'square', cut: 2600, fpk: 5200, fa: .01, fd: .15, a: .005, d: .25, s: .55, r: .12, g: .28, vib: 10, vd: .25 },
    bass: { oct: 2, pat: 'R..R..R.R..R..5.', gate: .9, v: { wave: 'sawtooth', cut: 700, fpk: 1700, fa: .004, fd: .08, a: .004, d: .2, s: .6, r: .06, g: .6 } },
    harm: [
      { mode: 'pad', oct: 4, v: { wave: 'sawtooth', uni: 2, det: 14, cut: 1300, a: .25, d: .5, s: .7, r: .4, g: .06 } },
      { mode: 'stab', oct: 4, pat: '..x..x....x..x..', len: 1, v: { wave: 'square', cut: 3200, a: .002, d: .08, s: .15, r: .04, g: .07 } }],
    drums: { k: 'x......x.x......', s: '....x.......x...', c: '....x.......x...', h: '..x...x...x...x.' }, crash: [0],
    fx: { rev: .2, dly: [3, .3, .2] }, mix: { lead: .36, bass: .42, harm: .26, drums: .42 } },

  dance: { name: 'Dance', tag: 'Four to the floor · 126 bpm', bpm: 126, swing: 0,
    chords: ['Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G'],
    mel: 'A4:2 C5:2 E5:2 A5:2 -:2 G5:2 E5:2 C5:2 | D5:2 E5:4 C5:2 -:2 A4:2 C5:2 E5:2 | A4:2 C5:2 F5:2 A5:2 -:2 G5:2 F5:2 C5:2 | D5:2 F5:4 C5:2 -:2 A4:2 C5:2 F5:2 | G4:2 C5:2 E5:2 G5:2 -:2 F5:2 E5:2 C5:2 | D5:2 E5:4 G5:2 -:2 E5:2 G5:2 C6:2 | B4:2 D5:2 G5:2 B5:2 -:2 A5:2 G5:2 D5:2 | E5:2 D5:4 B4:2 -:2 G5:2 A5:2 B5:2',
    lead: { wave: 'sawtooth', uni: 3, det: 16, cut: 2400, fpk: 6500, fa: .004, fd: .12, a: .003, d: .15, s: .4, r: .08, g: .16 },
    bass: { oct: 2, pat: '__R___R___R___R_', gate: .9, v: { wave: 'sawtooth', uni: 2, det: 8, cut: 500, fpk: 2200, fa: .003, fd: .07, res: 4, a: .003, d: .12, s: .5, r: .05, g: .55 } },
    harm: [
      { mode: 'stab', oct: 4, pat: '..x...x...x...x.', len: 1.6, v: { wave: 'sawtooth', uni: 3, det: 22, cut: 2200, fpk: 5000, fa: .004, fd: .1, a: .003, d: .15, s: .4, r: .08, g: .065 } },
      { mode: 'arp', oct: 5, pat: '0.1.2.1.0.1.2.3.', len: .6, v: { wave: 'p25', cut: 4000, a: .002, d: .06, s: .2, r: .03, g: .05 } }],
    drums: { k: 'x...x...x...x...', c: '....x.......x...', o: '..x...x...x...x.', h: '.x.x.x.x.x.x.x.x' }, crash: [0, 4], duck: 1,
    fx: { rev: .18, dly: [3, .35, .22] }, mix: { lead: .34, bass: .42, harm: .3, drums: .5 } },

  chill: { name: 'Chill', tag: 'Calm and floaty · 84 bpm', bpm: 84, swing: .14,
    chords: ['Dmaj7', 'Bm7', 'Gmaj7', 'Asus4|A', 'Dmaj7', 'Bm7', 'Gmaj7', 'A'],
    mel: 'F#5:4 A5:4 E5:8 | D5:4 F#5:2 A5:2 B5:8 | A5:6 G5:2 F#5:4 D5:4 | E5:12 -:4 | F#5:4 A5:4 C#6:4 A5:4 | D6:6 C#6:2 B5:8 | A5:4 F#5:4 E5:4 D5:4 | E5:8 -:8',
    lead: { fm: 1, fmi: 1.2, a: .004, d: 1.1, s: .3, r: .4, g: .36 },
    bass: { oct: 2, pat: 'R.......5...R...', gate: .95, v: { wave: 'triangle', cut: 900, a: .01, d: .4, s: .7, r: .15, g: .9 } },
    harm: [
      { mode: 'pad', oct: 3, v: { wave: 'triangle', cut: 1600, a: .7, d: .8, s: .7, r: .9, g: .1 } },
      { mode: 'arp', oct: 4, pat: '0.2.1.3.2...1.3.', len: 2, v: { fm: 2, fmi: .8, a: .003, d: .7, s: .15, r: .3, g: .12 } }],
    drums: { k: 'x.........x.....', r: '....x.......x...', t: '.x.x.x.x.x.x.x.x' },
    fx: { rev: .42, dly: [3, .35, .25] }, mix: { lead: .4, bass: .4, harm: .32, drums: .3 } },

  spooky: { name: 'Spooky', tag: 'Haunted house · 100 bpm', bpm: 100, swing: 0,
    chords: ['Dm', 'Dm', 'Bb', 'A7', 'Dm', 'Gm', 'Eb', 'A7'],
    mel: 'D5:4 F5:4 A5:4 G#5:4 | A5:8 -:4 F5:2 E5:2 | D5:4 F5:4 Bb5:6 A5:2 | G5:4 E5:4 C#5:8 | D5:4 F5:4 A5:4 D6:4 | Bb5:6 A5:2 G5:4 D5:4 | G5:4 Bb5:4 Eb6:8 | C#6:4 A5:4 E5:4 C#5:4',
    lead: { wave: 'sine', a: .06, d: .3, s: .9, r: .25, g: .5, vib: 40, vd: .05, glide: .1 },
    bass: { oct: 2, pat: 'R...5...R...5...', gate: .5, v: { wave: 'triangle', a: .003, d: .25, s: .15, r: .1, g: .85 } },
    harm: [
      { mode: 'arp', oct: 4, pat: '0120120120120120', len: .9, v: { wave: 'sawtooth', cut: 2400, fpk: 6000, fa: .002, fd: .05, a: .001, d: .12, s: .05, r: .05, g: .08 } },
      { mode: 'pad', oct: 3, v: { wave: 'square', cut: 800, a: .5, d: .5, s: .8, r: .6, g: .05 } }],
    drums: { k: 'x.......x.......', t: 'x...x...x...x...' },
    fx: { rev: .5, dly: [4, .3, .2] }, mix: { lead: .44, bass: .4, harm: .3, drums: .3 } },

  brass: { name: 'Brass Band', tag: 'Bandstand march · 116 bpm', bpm: 116, swing: 0,
    chords: ['Bb', 'Eb', 'F', 'Bb', 'Bb', 'Eb', 'C7', 'F7'],
    mel: 'F4:4 Bb4:2 D5:2 F5:6 D5:2 | Eb5:4 G5:4 Bb5:6 G5:2 | A5:4 F5:4 C5:4 Eb5:4 | D5:8 Bb4:4 -:4 | F5:4 D5:2 F5:2 Bb5:6 A5:2 | G5:4 Bb5:2 G5:2 Eb5:8 | E5:4 G5:4 Bb5:4 G5:4 | A5:6 G5:2 F5:4 Eb5:4',
    lead: { wave: 'sawtooth', uni: 2, det: 6, cut: 1700, fst: 400, fpk: 3400, fa: .05, fd: .25, a: .035, d: .2, s: .85, r: .08, g: .3, vib: 16, vd: .22 },
    bass: { oct: 2, pat: 'R.......5.......', gate: .45, v: { wave: 'sawtooth', cut: 520, fst: 200, fpk: 1000, fa: .04, fd: .15, a: .02, d: .2, s: .7, r: .06, g: .7 } },
    harm: [{ mode: 'stab', oct: 4, pat: '....x.......x...', len: 2.5, v: { wave: 'sawtooth', uni: 2, det: 7, cut: 1300, fst: 300, fpk: 2400, fa: .04, fd: .2, a: .03, d: .2, s: .7, r: .08, g: .08 } }],
    drums: { k: 'x.......x.......', s: 'x..ox.x.x..ox.xx' }, crash: [0],
    fx: { rev: .25, dly: [3, .15, .08] }, mix: { lead: .4, bass: .42, harm: .3, drums: .38 } },

  synthwave: { name: 'Synthwave', tag: 'Night drive · 108 bpm', bpm: 108, swing: 0,
    chords: ['Em', 'C', 'G', 'D', 'Em', 'C', 'Am', 'B'],
    mel: 'B4:4 E5:4 G5:4 F#5:4 | E5:8 G5:4 C6:4 | B5:6 A5:2 G5:4 D5:4 | F#5:12 A5:4 | B5:4 G5:4 E5:4 G5:4 | C6:6 B5:2 G5:4 E5:4 | A5:4 C6:4 E6:4 D6:4 | D#6:8 B5:8',
    lead: { wave: 'sawtooth', uni: 2, det: 10, cut: 2600, res: 2, a: .02, d: .4, s: .7, r: .2, g: .2, glide: .05, vib: 14, vd: .3 },
    bass: { oct: 2, pat: 'R.R.R.R.R.R.R.R.', gate: .7, v: { wave: 'sawtooth', cut: 450, fpk: 1400, fa: .004, fd: .09, a: .003, d: .1, s: .6, r: .04, g: .55 } },
    harm: [
      { mode: 'arp', oct: 4, pat: '0123012301230123', len: .9, v: { wave: 'sawtooth', cut: 1100, fpk: 3600, fa: .003, fd: .07, res: 4, a: .002, d: .1, s: .3, r: .05, g: .08 } },
      { mode: 'pad', oct: 3, v: { wave: 'sawtooth', uni: 2, det: 16, cut: 850, a: .5, d: .6, s: .7, r: .6, g: .06 } }],
    drums: { k: 'x.......x.......', s: '....x.......x...', h: '..x...x...x...x.' }, crash: [0],
    fx: { rev: .45, dly: [3, .4, .3] }, mix: { lead: .36, bass: .4, harm: .3, drums: .42 } },
};

const Music = (() => {
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const Q = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus4: [0, 5, 7], dim: [0, 3, 6] };
  let ctx, master, musicGain, sfxGain, revSend, revWet, dly, dlyFb, dlySend, noiseBuf, pulse25, pulse12, curve;
  let style = null, key = null, timer = null, nextTime = 0, step = 0, abs = 0, mel = null, bus = {};
  let volume = 0.7, active = 0;
  const LITE = /Silk|KF[A-Z]{2}/.test(navigator.userAgent) || (navigator.hardwareConcurrency || 8) <= 4;
  const CAP = LITE ? 22 : 40;

  const acc = s => (s === '#' ? 1 : s === 'b' ? -1 : 0);
  function midi(n) { const m = /^([A-G])([#b]?)(-?\d)$/.exec(n); return NOTE[m[1]] + acc(m[2]) + 12 * (+m[3] + 1); }
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function chord(name) { const m = /^([A-G])([#b]?)(.*)$/.exec(name); return { root: (NOTE[m[1]] + acc(m[2]) + 12) % 12, iv: Q[m[3]] || Q[''] }; }
  function chordAt(bar, s) { const c = style.chords[bar % style.chords.length].split('|'); return chord(c[Math.min(c.length - 1, Math.floor(s / (16 / c.length)))]); }
  const tones = (ch, oct) => ch.iv.map(i => ch.root + 12 * (oct + 1) + i);

  function parseMel(str) {
    const ev = []; let t = 0;
    str.trim().split(/\s+/).forEach(tok => { if (tok === '|') return; const [n, l] = tok.split(':'); if (n !== '-') ev.push({ t, len: +l, m: midi(n) }); t += +l; });
    const by = {}; ev.forEach(e => (by[e.t] = by[e.t] || []).push(e));
    return { by, total: t };
  }

  function pulse(duty) {
    const n = 64, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) im[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    return ctx.createPeriodicWave(re, im);
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  function init() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    try { ctx = new AC({ latencyHint: 'playback' }); } catch (e) { ctx = new AC(); }
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.knee.value = 6; comp.ratio.value = 8; comp.attack.value = .003; comp.release.value = .25; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = .55; master.connect(comp);
    musicGain = ctx.createGain(); musicGain.gain.value = volume; musicGain.connect(master);
    sfxGain = ctx.createGain(); sfxGain.gain.value = .8; sfxGain.connect(master);
    revSend = ctx.createGain(); revWet = ctx.createGain(); revWet.connect(musicGain);
    if (LITE) { const d2 = ctx.createDelay(1), fb2 = ctx.createGain(), lp = ctx.createBiquadFilter(); d2.delayTime.value = .09; fb2.gain.value = .45; lp.type = 'lowpass'; lp.frequency.value = 2500; revSend.connect(d2); d2.connect(lp); lp.connect(fb2); fb2.connect(d2); lp.connect(revWet); }
    else { const conv = ctx.createConvolver(); conv.buffer = impulse(1.8, 3); revSend.connect(conv); conv.connect(revWet); }
    dlySend = ctx.createGain(); dly = ctx.createDelay(2); dlyFb = ctx.createGain();
    const dlyOut = ctx.createGain(); dlyOut.gain.value = .55;
    dlySend.connect(dly); dly.connect(dlyFb); dlyFb.connect(dly); dly.connect(dlyOut); dlyOut.connect(musicGain); dlyOut.connect(revSend);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    pulse25 = pulse(.25); pulse12 = pulse(.125);
    curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 6) * .7; }
  }

  let lastLead = null;
  function synth(p, t, m, dur, out, gainMul, must) {
    if (!must && active > CAP) return;
    if (LITE && p.uni > 1) p = Object.assign({}, p, { uni: 1 });
    const f = hz(m), pk = (p.g || .3) * (gainMul || 1);
    const g = ctx.createGain(), te = t + Math.max(dur, .03), stopAt = te + (p.r || .05) * 4 + .05;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(pk, t + (p.a || .005));
    g.gain.setTargetAtTime(pk * (p.s == null ? .7 : p.s), t + (p.a || .005), (p.d || .2) / 3);
    g.gain.setTargetAtTime(0, te, (p.r || .05) / 3);
    const nodes = [];
    if (p.fm) {
      const car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain();
      car.type = 'sine'; mod.type = 'sine';
      car.frequency.setValueAtTime(f, t); mod.frequency.setValueAtTime(f * p.fm, t);
      mg.gain.setValueAtTime(f * p.fmi, t); mg.gain.setTargetAtTime(f * p.fmi * .15, t, .25);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g);
      nodes.push(car, mod);
    } else {
      const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.Q.value = p.res || .7;
      const cut = p.cut || 12000;
      fl.frequency.setValueAtTime(p.fst || cut, t);
      if (p.fpk) { fl.frequency.linearRampToValueAtTime(p.fpk, t + (p.fa || .01)); fl.frequency.setTargetAtTime(cut, t + (p.fa || .01), p.fd || .1); }
      let last = fl;
      if (p.shape) { const ws = ctx.createWaveShaper(); ws.curve = curve; fl.connect(ws); last = ws; }
      last.connect(g);
      let lfoG = null;
      if (p.vib) {
        const lfo = ctx.createOscillator(); lfo.frequency.value = 5.6; lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(0, t); lfoG.gain.linearRampToValueAtTime(p.vib, t + (p.vd || .15) + .1);
        lfo.connect(lfoG); nodes.push(lfo);
      }
      const uni = p.uni || 1;
      for (let i = 0; i < uni; i++) {
        const o = ctx.createOscillator();
        if (p.wave === 'p25') o.setPeriodicWave(pulse25); else if (p.wave === 'p12') o.setPeriodicWave(pulse12); else o.type = p.wave || 'sawtooth';
        if (p.glide && out === bus.lead && lastLead != null && lastLead !== m) {
          o.frequency.setValueAtTime(hz(lastLead), t); o.frequency.exponentialRampToValueAtTime(f, t + p.glide);
        } else o.frequency.setValueAtTime(f, t);
        o.detune.value = uni > 1 ? (i - (uni - 1) / 2) * (p.det || 10) : 0;
        if (lfoG) lfoG.connect(o.detune);
        o.connect(fl); nodes.push(o);
      }
    }
    g.connect(out);
    active++; nodes[0].onended = () => { active--; g.disconnect(); };
    nodes.forEach(n => { n.start(t); n.stop(stopAt); });
  }

  function noise(t, out, { type = 'highpass', freq = 7000, q = .7, v = .3, dec = .05, attack = 0 }) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .001 + attack); g.gain.setTargetAtTime(0, t + .001 + attack, dec / 3);
    s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random() * .5); s.stop(t + dec * 2 + .05);
  }
  function tone(t, out, { wave = 'sine', f0, f1, v, dec, fdec = .06 }) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = wave;
    o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + fdec);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + dec);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dec + .02);
  }
  const DRUM = {
    k: (t, o, v) => { tone(t, o, { f0: 160, f1: 42, v: 1 * v, dec: .38, fdec: .11 }); noise(t, o, { type: 'lowpass', freq: 3000, v: .2 * v, dec: .01 }); },
    s: (t, o, v) => { noise(t, o, { type: 'bandpass', freq: 1900, q: .8, v: .55 * v, dec: .17 }); tone(t, o, { wave: 'triangle', f0: 200, f1: 160, v: .35 * v, dec: .08 }); },
    c: (t, o, v) => { [0, .011, .022].forEach(d => noise(t + d, o, { type: 'bandpass', freq: 1300, q: 1.2, v: .45 * v, dec: .02 })); noise(t + .03, o, { type: 'bandpass', freq: 1200, q: 1, v: .4 * v, dec: .16 }); },
    h: (t, o, v) => noise(t, o, { freq: 8000, v: .16 * v, dec: .035 }),
    o: (t, o, v) => noise(t, o, { freq: 7000, v: .16 * v, dec: .22 }),
    t: (t, o, v) => noise(t, o, { type: 'bandpass', freq: 6500, q: 1.5, v: .14 * v, dec: .05, attack: .01 }),
    r: (t, o, v) => { tone(t, o, { wave: 'square', f0: 1700, v: .1 * v, dec: .03 }); noise(t, o, { type: 'bandpass', freq: 2500, v: .2 * v, dec: .03 }); },
    x: (t, o, v) => noise(t, o, { freq: 4500, v: .22 * v, dec: 1.4 }),
  };

  function playStep(st, t) {
    const bar = Math.floor(st / 16), s = st % 16, sd = 60 / style.bpm / 4, bars = style.chords.length;
    const loop = Math.floor(abs / (bars * 16));
    // melody (doubled an octave down on alternate loops)
    (mel.by[st] || []).forEach(e => {
      synth(style.lead, t, e.m, e.len * sd * .92, bus.lead, 1, true); lastLead = e.m;
      if (loop % 2 === 1 && !LITE) synth(style.lead, t, e.m - 12, e.len * sd * .92, bus.lead, .5);
    });
    // bass
    const bp = style.bass.pat, c = bp[s];
    if (c && c !== '.' && c !== '_') {
      let len = 1; while (s + len < 16 && bp[s + len] === '.') len++;
      const ch = chordAt(bar, s), r = ch.root + 12 * (style.bass.oct + 1);
      const off = { R: 0, '5': 7, O: 12, '3': ch.iv[1], '7': ch.iv[3] != null ? ch.iv[3] : 10 }[c] || 0;
      synth(style.bass.v, t, r + off, len * sd * (style.bass.gate || .9), bus.bass, 1, true);
    }
    // harmony parts
    (style.harm || []).forEach(H => {
      const ch = chordAt(bar, s);
      if (H.mode === 'pad') {
        const segs = style.chords[bar].split('|').length, segLen = 16 / segs;
        if (s % segLen === 0) tones(ch, H.oct).forEach(m => synth(H.v, t, m, segLen * sd, bus.harm));
      } else {
        const a = H.pat[s]; if (!a || a === '.') return;
        if (H.mode === 'arp') { const tn = tones(ch, H.oct), i = +a; synth(H.v, t, tn[i % tn.length] + 12 * Math.floor(i / tn.length), (H.len || 1) * sd, bus.harm); }
        else if (H.mode === 'stab') tones(ch, H.oct).forEach(m => synth(H.v, t, m, (H.len || 1) * sd, bus.harm));
        else if (H.mode === 'power') { const r = ch.root + 12 * (H.oct + 1); [r, r + 7, r + 12].forEach(m => synth(H.v, t, m, (H.len || 1) * sd, bus.harm)); }
      }
    });
    // drums, with a snare fill at the end of each loop
    const D = style.drums, fill = bar === bars - 1 && s >= 12 && (D.s || D.c);
    Object.keys(D).forEach(k => {
      if (fill && (k === 's' || k === 'c')) return;
      const ch = D[k][s]; if (!ch || ch === '.') return;
      DRUM[k](t, bus.drums, ch === 'o' ? .35 : ch === 'X' ? 1.2 : 1);
    });
    if (fill) DRUM[D.s ? 's' : 'c'](t, bus.drums, .5 + (s - 12) * .17);
    if (s === 0 && (style.crash || []).includes(bar)) DRUM.x(t, bus.drums, 1);
    if (style.duck && D.k[s] === 'x') { const hg = bus.harm.gain, base = style.mix.harm; hg.setValueAtTime(base * .3, t); hg.linearRampToValueAtTime(base, t + sd * 3); }
  }

  function tick() {
    const sd = 60 / style.bpm / 4, total = style.chords.length * 16;
    if (nextTime < ctx.currentTime - .05) nextTime = ctx.currentTime + .05;
    while (nextTime < ctx.currentTime + .3) {
      playStep(step, nextTime + (step % 2 ? style.swing * sd : 0));
      nextTime += sd; step = (step + 1) % total; abs++;
    }
  }

  function buildBuses() {
    const now = ctx.currentTime;
    Object.values(bus).forEach(b => { b.gain.setTargetAtTime(0, now, .05); setTimeout(() => b.disconnect(), 400); });
    bus = {};
    ['lead', 'bass', 'harm', 'drums'].forEach(n => { const g = ctx.createGain(); g.gain.value = style.mix[n]; g.connect(musicGain); bus[n] = g; });
    const lr = ctx.createGain(); lr.gain.value = .5; bus.lead.connect(lr); lr.connect(revSend);
    const hr = ctx.createGain(); hr.gain.value = .6; bus.harm.connect(hr); hr.connect(revSend);
    const dr = ctx.createGain(); dr.gain.value = .15; bus.drums.connect(dr); dr.connect(revSend);
    const [steps, fb, send] = style.fx.dly;
    const ld = ctx.createGain(); ld.gain.value = send; bus.lead.connect(ld); ld.connect(dlySend);
    dly.delayTime.setValueAtTime(steps * 60 / style.bpm / 4, now); dlyFb.gain.setValueAtTime(fb, now);
    revWet.gain.setValueAtTime(style.fx.rev, now);
  }

  return {
    styles: STYLES,
    get playing() { return !!timer; },
    get current() { return key; },
    unlock() { init(); if (ctx.state === 'suspended') ctx.resume(); },
    play(k) {
      this.unlock(); if (timer) clearInterval(timer);
      key = k; style = STYLES[k]; mel = parseMel(style.mel); lastLead = null;
      buildBuses(); step = 0; abs = 0; nextTime = ctx.currentTime + .08;
      timer = setInterval(tick, 60); tick();
    },
    stop() {
      if (timer) clearInterval(timer); timer = null;
      if (ctx) Object.values(bus).forEach(b => b.gain.setTargetAtTime(0, ctx.currentTime, .08));
    },
    setVolume(v) { volume = v; if (musicGain) musicGain.gain.setTargetAtTime(v, ctx.currentTime, .05); },
    sfx(kind) {
      this.unlock(); const t = ctx.currentTime + .01, o = sfxGain;
      const blip = (m, at, len, w = 'square', g = .14) => synth({ wave: w, cut: 6000, a: .002, d: .08, s: .6, r: .06, g }, t + at, m, len, o, 1, true);
      if (kind === 'found') [72, 76, 79, 84].forEach((m, i) => blip(m, i * .06, .08));
      else if (kind === 'miss') blip(52, 0, .09, 'triangle', .2);
      else if (kind === 'tap') blip(84, 0, .03, 'p25', .08);
      else if (kind === 'done') [[67, 0], [72, .12], [76, .24], [79, .36], [84, .5]].forEach(([m, at]) => blip(m, at, at === .5 ? .5 : .1, 'p25', .16));
      else if (kind === 'bark') [0, .17].forEach(at => {
        tone(t + at, o, { wave: 'sawtooth', f0: 520, f1: 210, v: .18, dec: .13, fdec: .1 });
        noise(t + at, o, { type: 'bandpass', freq: 900, q: 1, v: .25, dec: .07 });
      });
      else if (kind === 'bonus') [79, 83, 86, 91, 95].forEach((m, i) => blip(m, i * .05, .07, 'p12', .12));
    },
    _parse: parseMel,
  };
})();
if (typeof module !== 'undefined') module.exports = { STYLES, Music };

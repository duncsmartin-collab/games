/* =====================================================================
   SOUND: engine, effects and three procedural radio stations
   ===================================================================== */
const sfx=(()=>{
  let ctx=null,master=null,sfxBus=null,radioBus=null,eng=null,muted=!save.sound;
  function init(){if(ctx){if(ctx.state==='suspended')ctx.resume();return;}try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
    master=ctx.createGain();master.gain.value=muted?0:.8;master.connect(ctx.destination);
    sfxBus=ctx.createGain();sfxBus.connect(master);
    /* the radio sounds like it comes out of a dashboard speaker */
    const rf=ctx.createBiquadFilter();rf.type='lowpass';rf.frequency.value=7000;const rh=ctx.createBiquadFilter();rh.type='highpass';rh.frequency.value=90;
    radioBus=ctx.createGain();radioBus.gain.value=.42;radioBus.connect(rh);rh.connect(rf);rf.connect(master);
    const o1=ctx.createOscillator(),o2=ctx.createOscillator(),o3=ctx.createOscillator(),f=ctx.createBiquadFilter(),am=ctx.createGain(),g=ctx.createGain();
    o1.type='sawtooth';o2.type='square';o3.type='triangle';o1.frequency.value=40;o2.frequency.value=20;o3.frequency.value=80;
    const o2g=ctx.createGain();o2g.gain.value=.55;const o3g=ctx.createGain();o3g.gain.value=.35;
    f.type='lowpass';f.frequency.value=320;f.Q.value=1.4;am.gain.value=.72;g.gain.value=0;
    const lfo=ctx.createOscillator(),lfoG=ctx.createGain();lfo.type='sine';lfo.frequency.value=18;lfoG.gain.value=.28;lfo.connect(lfoG);lfoG.connect(am.gain);
    o1.connect(f);o2.connect(o2g);o2g.connect(f);o3.connect(o3g);o3g.connect(f);f.connect(am);am.connect(g);g.connect(master);
    [o1,o2,o3,lfo].forEach(o=>o.start());eng={o1,o2,o3,f,g,lfo};
    noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    setInterval(radioTick,25);
  }
  let noiseBuf=null;
  function tone(freq,dur,type,vol,when,slide,bus,abs){if(!ctx)return;const t0=abs?when:ctx.currentTime+(when||0);const o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'square';o.frequency.setValueAtTime(freq,t0);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t0+dur);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||.15,t0+.008);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);o.connect(g);g.connect(bus||sfxBus);o.start(t0);o.stop(t0+dur+.03);}
  function noise(dur,vol,freq,type,when,bus,q,abs){if(!ctx)return;const t0=abs?when:ctx.currentTime+(when||0);const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;f.type=type||'bandpass';f.frequency.value=freq||1800;f.Q.value=q||1.2;g.gain.setValueAtTime(vol||.4,t0);g.gain.exponentialRampToValueAtTime(.0008,t0+dur);s.connect(f);f.connect(g);g.connect(bus||sfxBus);s.start(t0,Math.random()*.5);s.stop(t0+dur+.02);}
  const mtof=m=>440*Math.pow(2,(m-69)/12);

  /* ---------- radio ---------- */
  const STATIONS=['dance','jazz','pop'];
  let station=save.radio||'off',nextNote=0,step=0,bar=0;
  const BPM={dance:124,jazz:104,pop:102};
  /* chords as midi notes */
  const PROG={
    dance:[[57,60,64],[53,57,60],[60,64,67],[55,59,62]],          /* Am F C G */
    jazz:[[55,58,62,65],[48,52,55,58],[53,57,60,64],[50,54,57,60]], /* Gm7 C7 Fmaj7 D7 */
    pop:[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]               /* C G Am F */
  };
  const popMel=[[[72,0,2],[74,2,2],[76,4,4],[79,8,2],[76,10,2],[74,12,4]],[[74,0,2],[71,2,2],[74,4,4],[79,8,4],[77,12,2],[76,14,2]],[[76,0,3],[74,3,1],[72,4,4],[72,8,2],[74,10,2],[76,12,4]],[[77,0,2],[76,2,2],[74,4,4],[72,8,4],[null]]];
  function kick(t,v){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(42,t+.11);g.gain.setValueAtTime(v||.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(radioBus);o.start(t);o.stop(t+.32);}
  const rn=(dur,vol,freq,type,t,q)=>noise(dur,vol,freq,type,t,radioBus,q,true);
  const rt=(freq,dur,type,vol,t,slide)=>tone(freq,dur,type,vol,t,slide,radioBus,true);
  const snare=(t,v)=>{rn(.16,v||.35,1900,'bandpass',t,.8);rt(190,.08,'triangle',(v||.35)*.6,t,120);};
  const clap=(t)=>{[0,.012,.026].forEach(d=>rn(.09,.28,1300,'bandpass',t+d,1.5));};
  const hat=(t,open,v)=>rn(open?.2:.04,v||.12,8500,'highpass',t,.7);
  const ride=(t,v)=>{rn(.32,v||.07,6500,'bandpass',t,3);rt(3100,.25,'triangle',.012,t);};
  const brush=(t)=>rn(.14,.07,3200,'bandpass',t,.6);
  function synth(t,midi,dur,kind,vol){
    if(!ctx||midi==null)return;const f=mtof(midi);
    if(kind==='saw'){const o=ctx.createOscillator(),fl=ctx.createBiquadFilter(),g=ctx.createGain();o.type='sawtooth';o.frequency.value=f;fl.type='lowpass';fl.Q.value=6;fl.frequency.setValueAtTime(1800,t);fl.frequency.exponentialRampToValueAtTime(260,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(fl);fl.connect(g);g.connect(radioBus);o.start(t);o.stop(t+dur+.02);}
    else if(kind==='keys'){/* soft electric piano: sine + bell overtone with a little wobble */
      [[1,.6],[2,.12],[3.01,.05]].forEach(([m,a])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*a,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur*(m>1?.5:1));o.connect(g);g.connect(radioBus);o.start(t);o.stop(t+dur+.05);});}
    else if(kind==='bell'){[[1,.5],[2,.2],[4.02,.08]].forEach(([m,a])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=m===1?'triangle':'sine';o.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol*a,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(radioBus);o.start(t);o.stop(t+dur+.05);});}
    else if(kind==='vibes'){const o=ctx.createOscillator(),g=ctx.createGain(),tr=ctx.createOscillator(),tg=ctx.createGain();o.type='sine';o.frequency.value=f;tr.frequency.value=5.5;tg.gain.value=vol*.3;tr.connect(tg);tg.connect(g.gain);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(radioBus);o.start(t);tr.start(t);o.stop(t+dur+.02);tr.stop(t+dur+.02);}
    else if(kind==='bass'){const o=ctx.createOscillator(),fl=ctx.createBiquadFilter(),g=ctx.createGain();o.type='triangle';o.frequency.value=f;fl.type='lowpass';fl.frequency.value=900;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(fl);fl.connect(g);g.connect(radioBus);o.start(t);o.stop(t+dur+.02);}
    else rt(f,dur,kind,vol,t);
  }
  function radioTick(){
    if(!ctx||station==='off'||muted)return;
    const spb=60/BPM[station]/4;
    if(nextNote<ctx.currentTime-.2)nextNote=ctx.currentTime+.05;
    while(nextNote<ctx.currentTime+.12){playStep(station,step,bar,nextNote,spb);nextNote+=spb;step++;if(step===16){step=0;bar++;}}
  }
  function playStep(st,s,b,t,spb){
    const ch=PROG[st][b%4],root=ch[0];
    if(st==='dance'){
      if(s%4===0)kick(t,.85);
      if(s===4||s===12)clap(t);
      if(s%4===2){hat(t,true,.09);synth(t,root-24,spb*1.6,'saw',.16);}
      else hat(t,false,.05);
      if(s===0||s===6||s===10)ch.forEach(n=>synth(t,n,spb*1.4,'saw',.035));
      if(b%8>=4){const n=ch[s%3]+12*(s%6<3?1:0);synth(t,n,spb*.9,'square',.025);}
    }else if(st==='jazz'){
      const sw=(s%4===2)?spb*.66:0,tt=t+sw;
      if(s===0||s===8)ride(tt,.07);if(s===6||s===14)ride(tt,.05);if(s===4||s===12){ride(tt,.07);hat(tt,false,.06);brush(tt);}
      if(s%4===0){const walk=[ch[0]-24,ch[1]-24,ch[2]-24,ch[3]-24+(Math.random()<.5?1:-1)];synth(t,walk[s/4],spb*3.6,'bass',.32);}
      if((s===6||s===10||(s===0&&b%2===0))&&Math.random()<.85)ch.forEach(n=>synth(tt,n,spb*5,'keys',.07));
      if(b%4>=2&&s%2===0&&Math.random()<.45){const scale=[65,67,69,72,74,77,79];synth(tt,rpick(scale)+(Math.random()<.3?-12:0),spb*3,'vibes',.09);}
    }else{
      if(s===0||s===8||s===10)kick(t,.75);
      if(s===4||s===12)snare(t,.3);
      if(s%2===0)hat(t,false,.06);
      if(s%2===0)synth(t,root-24,spb*1.8,'bass',.26);
      if(s===0||s===6||s===12)ch.forEach(n=>synth(t,n,spb*4,'keys',.06));
      const mel=popMel[b%4];if(b%8>=0)mel.forEach(m=>{if(m&&m[0]&&m[1]===s)synth(t,m[0],spb*m[2]*1.1,'bell',.12);});
    }
  }
  function setStation(s){station=s;save.radio=s;bar=0;step=0;if(ctx){nextNote=ctx.currentTime+.35;noise(.3,.12,2500,'bandpass',0,sfxBus,.4);if(s!=='off'){tone(1047,.12,'sine',.08,.08);tone(1568,.18,'sine',.08,.18);}}}

  return{
    init,STATIONS,
    get station(){return station;},
    get on(){return !muted;},
    setStation,
    nextStation(){const i=STATIONS.indexOf(station);setStation(i===STATIONS.length-1?'off':STATIONS[i+1]);return station;},
    toggle(){muted=!muted;if(master)master.gain.value=muted?0:.8;return !muted;},
    engine(rpm,thr,vol,type){if(!eng)return;const t=ctx.currentTime;const base=type==='scooter'?62:type==='bus'?22:type==='van'?26:30,span=type==='scooter'?120:type==='bus'?42:56;const hz=base+rpm*span;
      eng.o1.frequency.setTargetAtTime(hz,t,.03);eng.o2.frequency.setTargetAtTime(hz/2,t,.03);eng.o3.frequency.setTargetAtTime(hz*2,t,.03);
      eng.lfo.frequency.setTargetAtTime(hz*.5,t,.03);
      eng.f.frequency.setTargetAtTime((type==='scooter'?420:240)+rpm*420+thr*160,t,.06);
      eng.g.gain.setTargetAtTime(attract?0:vol*(type==='scooter'?.8:1),t,.05);},
    shift(up){if(up){tone(150,.09,'triangle',.11,0,70);noise(.06,.12,2600);tone(1300,.03,'square',.025,.02);}else tone(120,.07,'triangle',.07,0,80);},
    horn(type){
      if(type==='van'){const n=[69,72,74,76,77,76,74,71,67,69,71,72,69];const d=[1,2,1,1.5,.5,1,2,1,1.5,.5,1,2,1];let t=0;n.forEach((m,i)=>{tone(mtof(m+12),d[i]*.22,'square',.05,t);tone(mtof(m+24),d[i]*.22,'sine',.03,t);t+=d[i]*.2;});}
      else if(type==='bus'){tone(1760,.5,'sine',.12);tone(1760,.5,'sine',.12,.28);}
      else if(type==='scooter'){tone(660,.12,'square',.08);tone(660,.12,'square',.08,.16);}
      else{tone(392,.18,'square',.12);tone(494,.18,'square',.1);tone(392,.22,'square',.12,.24);tone(494,.22,'square',.1,.24);}
    },
    bump(imp){noise(.18,Math.min(.7,imp/30),900);tone(180,.12,'triangle',.18,0,90);},
    land(imp){noise(.22,Math.min(.6,imp/25),500);tone(120,.15,'triangle',.2,0,60);},
    clack(){noise(.08,.5,3200);tone(900,.06,'square',.06,0,500);},
    boop(){tone(660,.1,'triangle',.14,0,990);},
    ding(){tone(1319,.25,'sine',.14);tone(1760,.35,'sine',.12,.1);},
    gold(){[1047,1319,1568,2093].forEach((f,i)=>tone(f,.3,'sine',.13,i*.07));noise(.4,.08,9000,'highpass',.1);},
    cash(){tone(2093,.08,'square',.06);tone(2637,.25,'square',.05,.07);noise(.12,.15,4000,'bandpass',.05);},
    win(stars){[523,659,784,1047].slice(0,1+stars).forEach((f,i)=>tone(f,.25,'triangle',.18,i*.11));},
    sticker(){[784,988,1175,1568,1976].forEach((f,i)=>tone(f,.3,'triangle',.12,i*.08));},
    splash(){noise(.35,.4,700,'lowpass');noise(.2,.2,2000,'bandpass',.05);},
    wash(){for(let i=0;i<10;i++)tone(800+Math.random()*900,.08,'sine',.04,i*.07+Math.random()*.05,1400);},
    hop(){tone(500,.12,'square',.05,0,900);},
    toot(){tone(330,.6,'sawtooth',.06);tone(415,.6,'sawtooth',.05);tone(330,.9,'sawtooth',.06,.75);tone(415,.9,'sawtooth',.05,.75);},
    click(){tone(1200,.04,'square',.05);}
  };
})();

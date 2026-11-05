/* =====================================================================
   JOBS: taxi fares, pizza deliveries, ice creams, the bus route
   ===================================================================== */
/* ---------- target beacon + guide arrow ---------- */
const beacon=new T.Group();scene.add(beacon);beacon.visible=false;
const beaconCol=new T.Color('#9BFF6A');
const ringMat=new T.MeshBasicMaterial({color:beaconCol,transparent:true,opacity:.55,depthWrite:false,fog:false});
const ring=new T.Mesh(new T.RingGeometry(4.2,5.4,40),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.4;beacon.add(ring);
const beamMat2=new T.MeshBasicMaterial({color:beaconCol,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,fog:false});
const beam=new T.Mesh(new T.CylinderGeometry(2.4,2.4,44,20,1,true),beamMat2);beam.position.y=22;beacon.add(beam);
const shapeArrow=()=>{const s=new T.Shape();s.moveTo(-.9,0);s.lineTo(.9,0);s.lineTo(.9,1.6);s.lineTo(1.8,1.6);s.lineTo(0,3.2);s.lineTo(-1.8,1.6);s.lineTo(-.9,1.6);s.closePath();return s;};
const arrowGeo=new T.ExtrudeGeometry(shapeArrow(),{depth:.5,bevelEnabled:true,bevelSize:.1,bevelThickness:.1,bevelSegments:2});arrowGeo.translate(0,-1.6,-.25);
const beaconArrowMat=new SMat({color:lin('#9BFF6A').clone(),emissive:lin('#4FCB2A').clone(),emissiveIntensity:.6,roughness:.3});
const beaconArrow=new T.Mesh(arrowGeo,beaconArrowMat);beaconArrow.rotation.z=Math.PI;beaconArrow.position.y=10;beacon.add(beaconArrow);
const bayGlow=new T.Group();bayGlow.visible=false;beacon.add(bayGlow);
{const gm=new T.MeshBasicMaterial({color:beaconCol,transparent:true,opacity:.4,depthWrite:false});const gg=new T.Mesh(new T.BoxGeometry(5.6,.12,9.8),gm);gg.position.y=.55;bayGlow.add(gg);bayGlow.userData.m=gm;}
const guide=new T.Mesh(arrowGeo,new SMat({color:lin('#F2C230').clone(),emissive:lin('#C9961A').clone(),emissiveIntensity:.5,roughness:.3}));guide.scale.setScalar(.75);scene.add(guide);guide.visible=false;
let tgt=null;
function setTarget(spot,col,bay){
  tgt=spot;if(!spot){beacon.visible=false;guide.visible=false;return;}
  beacon.visible=true;beacon.position.set(spot.x,groundAt(spot.x,spot.z)-.14,spot.z);beacon.rotation.y=bay?spot.rot:0;
  const c=new T.Color(col||'#9BFF6A');ringMat.color.copy(c);beamMat2.color.copy(c);beaconArrowMat.color.copy(c).convertSRGBToLinear();beaconArrowMat.emissive.copy(c).convertSRGBToLinear().multiplyScalar(.6);
  ring.visible=!bay;bayGlow.visible=!!bay;if(bay)bayGlow.userData.m.color.copy(c);
}
function updateBeacon(t){
  if(!tgt)return;
  ringMat.opacity=.4+Math.sin(t*4)*.15;beaconArrow.position.y=9+Math.sin(t*3)*.8;beaconArrow.rotation.y=t*1.5;
  const d=Math.hypot(car.x-tgt.x,car.z-tgt.z);
  guide.visible=d>20&&!garageOpen&&!attract;
  if(guide.visible){guide.position.set(car.x,car.y+(V.type==='bus'?15:11)+Math.sin(t*3)*.4,car.z);guide.rotation.set(-Math.PI/2,0,Math.atan2(tgt.x-car.x,tgt.z-car.z)+Math.PI);}
}
/* stopped at a spot for a moment */
let holdT=0;
function arrived(spot,r,dt){
  const d=Math.hypot(car.x-spot.x,car.z-spot.z);
  if(d<r&&Math.abs(car.speed)<1.6&&!car.air){holdT+=dt;return holdT>.35;}
  holdT=0;return false;
}

/* ---------- people waiting at the kerb ---------- */
function spawnWaiter(look,x,z,face,scale){
  const f=makeFigure(look);f.scale.setScalar(scale||.82);f.position.set(x,groundAt(x,z),z);f.rotation.y=face;scene.add(f);
  return{fig:f,x,z,phase:Math.random()*6,hop:0,leaving:null};
}
function animWaiter(w,t){
  const u=w.fig.userData;
  if(w.leaving){const L=w.leaving;L.t+=frameDt;const k=Math.min(1,L.t/L.dur);w.fig.position.x=lerp(L.ax,L.bx,k);w.fig.position.z=lerp(L.az,L.bz,k);w.fig.position.y=L.ay+Math.sin(k*Math.PI)*2;w.fig.rotation.y=Math.atan2(L.bx-L.ax,L.bz-L.az);walkPose(w.fig,t);return k>=1;}
  const s=Math.floor(t*12)/12,wv=Math.sin(s*6+w.phase);
  u.arms[1].rotation.z=2.5+wv*.35;u.arms[0].rotation.z=0;
  return false;
}
function leave(w,bx,bz,dur){w.leaving={ax:w.fig.position.x,az:w.fig.position.z,ay:w.fig.position.y,bx,bz,t:0,dur:dur||.8};}

/* ---------- HUD job card ---------- */
function jobCard(o){
  $('jobWho').style.background=o.whoBg||'#F2C8A0';$('jobWho').textContent=o.who||'';$('jobWho').style.color=o.whoFg||'#14213D';
  $('jobTitle').textContent=o.title||'';
  const sub=$('jobSub');sub.innerHTML=o.sub||'';
  $('jobMeter').hidden=o.meter==null;if(o.meter!=null){$('jobMeterFill').style.width=Math.round(o.meter*100)+'%';$('jobMeterFill').style.background=o.meter>.6?'var(--good)':o.meter>.3?'var(--gold)':'var(--warn)';}
  $('jobTimer').hidden=o.timer==null;if(o.timer!=null)$('jobTimer').textContent=o.timer>0?Math.ceil(o.timer)+'s':'0s';
}
const STN={dance:'Dance',jazz:'Jazz',pop:'Pop'};
function pickPlace(fromX,fromZ,minD,maxD,filter){
  const c=places.filter(p=>{const d=Math.hypot(p.x-fromX,p.z-fromZ);return d>minD&&d<maxD&&(!filter||filter(p));});
  return c.length?rpick(c):rpick(places.filter(p=>!filter||filter(p)));
}

/* ---------- TAXI ---------- */
const PASSENGER_TYPES=[['plain',3],['music',3],['cake',2],['hurry',2]];
function weighted(list){let s=list.reduce((a,b)=>a+b[1],0),r=Math.random()*s;for(const [k,w] of list){if((r-=w)<0)return k;}return list[0][0];}
const cakeGeo=mergeGeos([{geo:new T.CylinderGeometry(.8,.8,.6,16),m:M(0,.3,0),color:'#FFF6E8'},{geo:new T.CylinderGeometry(.82,.82,.14,16),m:M(0,.55,0),color:P.pink},{geo:new T.CylinderGeometry(.06,.06,.5,6),m:M(0,.85,0),color:P.azure},{geo:new T.SphereGeometry(.09,6,4),m:M(0,1.15,0),color:'#FFB020'}]);
const taxiJob={
  state:'idle',
  start(){this.clear();this.next(.5);},
  clear(){if(this.waiter)scene.remove(this.waiter.fig);if(this.rider&&this.rider.parent)this.rider.parent.remove(this.rider);if(this.exiting)scene.remove(this.exiting.fig);this.waiter=this.rider=this.exiting=null;this.state='idle';setTarget(null);},
  next(delay){this.state='wait';this.delay=delay||1.2;jobCard({who:'',title:'Looking for a fare…',sub:'Drive around town'});setTarget(null);},
  newFare(){
    this.pickup=pickPlace(car.x,car.z,45,170,p=>p.kind!=='park'||Math.random()<.4);
    this.look=randLook();this.kind=weighted(PASSENGER_TYPES);
    this.waiter=spawnWaiter(this.look,this.pickup.px,this.pickup.pz,this.pickup.face);
    this.state='seek';setTarget(this.pickup,'#9BFF6A');
    jobCard({who:'',whoBg:this.look.skin,title:'Passenger waiting',sub:'At '+this.pickup.label});
  },
  board(){
    if(this.exiting)scene.remove(this.exiting.fig);
    const w=this.waiter;leave(w,car.x,car.z,.6);this.exiting=w;this.waiter=null;sfx.hop();
    const p=this.pickup;
    const useBay=Math.random()<.14&&bays.some(b=>!b.taken);
    if(useBay){const free=bays.filter(b=>!b.taken&&Math.hypot(b.x-p.x,b.z-p.z)>60);const b=free.length?rpick(free):rpick(bays.filter(b=>!b.taken));this.dest={x:b.x,z:b.z,rot:b.rot,label:'the car park',bay:b,px:b.x,pz:b.z};}
    else this.dest=pickPlace(p.x,p.z,70,240,q=>q!==p);
    this.dist=Math.hypot(this.dest.x-p.x,this.dest.z-p.z);
    this.rideT=0;this.matchT=0;this.cake=1;this.limit=12+this.dist/12;this.timeLeft=this.limit;
    this.want=rpick(sfx.STATIONS);
    this.state='ride';setTarget(this.dest,'#FFD84A',!!this.dest.bay);
    this.seatT=.6;sfx.ding();
  },
  seatRider(){
    if(V.type!=='cab')return;
    const f=makeFigure(this.look);seat(f);f.scale.setScalar(.82);f.position.set(.6,3.16-1.7*.82,-2.25);V.body.add(f);this.rider=f;
    if(this.kind==='cake'){const c=new T.Mesh(cakeGeo,vcolMat);c.position.set(0,2.3,1.6);c.scale.setScalar(.9);f.add(c);}
  },
  update(dt,t){
    if(this.state==='wait'){this.delay-=dt;if(this.delay<=0)this.newFare();return;}
    if(this.exiting&&animWaiter(this.exiting,t)){scene.remove(this.exiting.fig);this.exiting=null;}
    if(this.state==='seek'){
      animWaiter(this.waiter,t);
      if(arrived(this.pickup,7,dt))this.board();
      return;
    }
    if(this.state!=='ride')return;
    if(this.seatT>0){this.seatT-=dt;if(this.seatT<=0)this.seatRider();}
    this.rideT+=dt;
    const d=this.dest,lbl=d.label;
    const card={who:'',whoBg:this.look.skin,title:'To '+lbl};
    if(this.kind==='plain')card.sub='“'+rpickStable(['Thanks for stopping!','Lovely day for it.','Off we go!','I love this town.'],this.look.shirt)+'”';
    if(this.kind==='music'){const ok=sfx.station===this.want;if(ok)this.matchT+=dt;card.sub=`<span class="req${ok?' ok':''}">♪ Put ${STN[this.want]} on the radio${ok?' — lovely!':''}</span>`;}
    if(this.kind==='cake'){card.sub='Birthday cake! Go gently';card.meter=this.cake;}
    if(this.kind==='hurry'){this.timeLeft-=dt;card.sub=this.timeLeft>0?'I’m late! Quick as you can':'Never mind, nearly there';card.timer=Math.max(0,this.timeLeft);}
    jobCard(card);
    if(d.bay){
      const dx=car.x-d.x,dz=car.z-d.z;
      const lx=dx*Math.cos(d.rot)-dz*Math.sin(d.rot),lz=dx*Math.sin(d.rot)+dz*Math.cos(d.rot);
      const align=Math.abs(Math.cos(car.h-d.rot));
      if(Math.abs(lx)<1.5&&Math.abs(lz)<2.2&&align>.9&&Math.abs(car.speed)<1.2){holdT+=dt;if(holdT>.6){const stars=Math.abs(lx)<.6&&Math.abs(lz)<1&&align>.985?3:(Math.abs(lx)<1&&align>.95?2:1);this.dropoff(stars);}}else holdT=0;
    }else if(arrived(d,7,dt))this.dropoff(0);
  },
  dropoff(stars){
    const fare=8+Math.round(this.dist/12);let tip=4;const notes=[];
    if(this.kind==='music'){const f=this.matchT/Math.max(1,this.rideT);tip+=Math.round(f*16);if(f>.5){notes.push('loved the music');count('music');}}
    if(this.kind==='cake'){tip+=Math.round(this.cake*20);if(this.cake>.95){notes.push('perfect cake');count('cake');}else if(this.cake<.4)notes.push('squashed cake');}
    if(this.kind==='hurry'){if(this.timeLeft>0){tip+=15;notes.push('just in time');count('hurry');}}
    if(stars){tip+=stars*4;notes.push(stars+'-star parking');if(stars===3)count('park3');}
    if(car.dirt>.5){tip-=6;notes.push('muddy cab!');}else if(car.shine>0){tip+=5;notes.push('so shiny!');}
    tip=Math.max(0,tip);
    addStuds(fare+tip);sfx.cash();if(stars)sfx.win(stars);
    toast(`${stars?'<span class="stars">'+'★'.repeat(stars)+'☆'.repeat(3-stars)+'</span><br>':''}Fare ${fare} · Tip <span class="plus">${tip}</span>`,notes.length?notes.join(' · '):'Thank you!');
    confetti(car.x,car.y+4,car.z,stars?30:12);
    if(this.exiting){scene.remove(this.exiting.fig);this.exiting=null;}
    if(this.rider){const wp=new T.Vector3();this.rider.getWorldPosition(wp);this.rider.parent.remove(this.rider);this.rider=null;
      const w=spawnWaiter(this.look,wp.x,wp.z,0);w.fig.position.y=car.y+1;const d=this.dest;leave(w,d.px,d.pz,.9);this.exiting=w;}
    count('fares');if(night>.6)count('night');
    this.next(1.6);
  }
};
const rpickStable=(a,key)=>a[(key||'').charCodeAt(1)%a.length];

/* ---------- PIZZA (scooter) ---------- */
const pizzaJob={
  start(){this.clear();this.collect();},
  clear(){if(this.owner)scene.remove(this.owner.fig);this.owner=null;setTarget(null);this.state='idle';},
  collect(){this.state='collect';setTarget(pizzaPlace,'#FF7A59');jobCard({who:'P',whoBg:'#C91A09',whoFg:'#FFFDF6',title:'Collect a pizza',sub:'At the Pizza Shop'});},
  update(dt,t){
    if(this.owner){if(this.owner.leaving){if(animWaiter(this.owner,t)){scene.remove(this.owner.fig);this.owner=null;}}else animWaiter(this.owner,t);}
    if(this.state==='wait'){this.delay-=dt;if(this.delay<=0)this.collect();return;}
    if(this.state==='collect'){if(arrived(pizzaPlace,7,dt)){
      this.dest=pickPlace(pizzaPlace.x,pizzaPlace.z,70,260,p=>p.kind==='house');
      this.dist=Math.hypot(this.dest.x-pizzaPlace.x,this.dest.z-pizzaPlace.z);this.timeLeft=14+this.dist/11;
      this.state='deliver';setTarget(this.dest,'#FFD84A');sfx.ding();toast('Pizza ready!','Deliver it while it’s hot');
      this.owner=spawnWaiter(randLook(),this.dest.px,this.dest.pz,this.dest.face);}
      return;}
    if(this.state==='deliver'){
      this.timeLeft-=dt;const hot=this.timeLeft>0;
      jobCard({who:'P',whoBg:'#C91A09',whoFg:'#FFFDF6',title:'Pizza for '+this.dest.label,sub:hot?'Still hot':'Gone a bit cold',meter:clamp(this.timeLeft/(14+this.dist/11),0,1),timer:Math.max(0,this.timeLeft)});
      if(arrived(this.dest,6.5,dt)){
        const pay=10+Math.round(this.dist/15)+(hot?12:0);addStuds(pay);sfx.cash();
        toast(`Delivered! <span class="plus">+${pay}</span>`,hot?'Still hot, yum!':'A bit cold, but thanks!');
        confetti(this.dest.px,3,this.dest.pz,14);count('pizza');if(hot)count('hotpizza');if(night>.6)count('night');
        const o=this.owner;if(o){o.hop=.5;leave(o,o.x-Math.sin(this.dest.face)*3,o.z-Math.cos(this.dest.face)*3,1.2);}
        this.state='wait';this.delay=1.5;setTarget(null);jobCard({who:'P',whoBg:'#C91A09',whoFg:'#FFFDF6',title:'Back to the Pizza shop',sub:'Another order is coming'});
      }
    }
  }
};

/* ---------- ICE CREAM (van) ---------- */
const iceJob={
  start(){this.clear();this.last=null;this.next(.5);jobCard({who:'I',whoBg:'#E87AA4',whoFg:'#FFFDF6',title:'Finding customers…',sub:'Children love the chime'});},
  clear(){(this.kids||[]).forEach(k=>scene.remove(k.fig));this.kids=[];(this.cones||[]).forEach(c=>scene.remove(c.m));this.cones=[];setTarget(null);this.state='idle';},
  next(d){this.state='wait';this.delay=d;},
  pick(){
    const c=iceSpots.filter(s=>s!==this.last&&Math.hypot(s.x-car.x,s.z-car.z)>40);
    this.spot=rpick(c.length?c:iceSpots);this.last=this.spot;
    const n=2+Math.floor(Math.random()*3);this.kids=[];
    for(let k=0;k<n;k++){const ox=(k-(n-1)/2)*2.2;const sx=this.spot.px+Math.cos(this.spot.face)*ox,sz=this.spot.pz-Math.sin(this.spot.face)*ox;this.kids.push(spawnWaiter(Object.assign(randLook(),{hat:rpick(['hair','bun','long','bobble','cap'])}),sx,sz,this.spot.face,.58));}
    this.state='drive';setTarget(this.spot,'#FF9ED2');
    jobCard({who:'I',whoBg:'#E87AA4',whoFg:'#FFFDF6',title:n+' children want ice cream',sub:'At '+(this.spot.name.match(/Park|Beach|Pier|Campsite|Tower/)?'the '+this.spot.name.replace(/^the /,''):this.spot.name)});
  },
  update(dt,t){
    (this.cones||[]).forEach(c=>{c.t+=dt;c.m.position.y=c.y+Math.min(1,c.t*3)*1.2;c.m.rotation.y+=dt*3;});
    if(this.state==='wait'){this.delay-=dt;if(this.delay<=0){this.clear();this.pick();}return;}
    this.kids.forEach(k=>animWaiter(k,t));
    if(this.state==='drive'&&arrived(this.spot,9,dt)){
      this.state='serve';sfx.horn('van');let i=0;
      const serve=()=>{if(this.state!=='serve')return;const k=this.kids[i];if(!k){const pay=this.kids.length*6;toast(`Ice creams sold! <span class="plus">+${pay}</span>`,this.kids.length+' happy children');this.next(2.4);setTarget(null);jobCard({who:'I',whoBg:'#E87AA4',whoFg:'#FFFDF6',title:'Finding more customers…',sub:'Listen out for the chime'});return;}
        k.hop=.4;const cone=new T.Mesh(mergeGeos([{geo:new T.ConeGeometry(.35,1,8),m:M(0,0,0,Math.PI),color:P.tan},{geo:new T.SphereGeometry(.42,10,8),m:M(0,.6,0),color:rpick([P.pink,P.white,'#8A4B1F',P.mint])}]),vcolMat);
        const p=k.fig.position;cone.position.set(p.x,p.y+3.2,p.z);cone.scale.setScalar(.9);scene.add(cone);this.cones.push({m:cone,y:p.y+2.6,t:0});
        addStuds(6);sfx.cash();count('icecream');i++;setTimeout(serve,550);};
      setTimeout(serve,700);
    }
    if(this.state==='serve')this.kids.forEach((k,i)=>{k.fig.position.y=groundAt(k.x,k.z)+Math.abs(Math.sin(t*6+i))*.6;});
  }
};

/* ---------- BUS ROUTE ---------- */
const busJob={
  start(){this.clear();this.idx=0;this.onBoard=0;this.go();},
  clear(){(this.waiting||[]).forEach(w=>scene.remove(w.fig));this.waiting=[];(this.leavers||[]).forEach(w=>scene.remove(w.fig));this.leavers=[];setTarget(null);this.state='idle';},
  go(){
    const s=busStops[this.idx];this.stop=s;this.waiting=[];
    const n=1+Math.floor(Math.random()*4);
    for(let k=0;k<n;k++){const ox=(k-(n-1)/2)*1.8;const sx=s.px+Math.cos(s.face)*ox,sz=s.pz-Math.sin(s.face)*ox;this.waiting.push(spawnWaiter(randLook(),sx,sz,s.face));}
    this.state='drive';setTarget(s,'#7FC8FF');
    jobCard({who:'B',whoBg:'#C91A09',whoFg:'#FFFDF6',title:'Next stop: '+s.name,sub:`${n} waiting · ${this.onBoard} on board`});
  },
  update(dt,t){
    (this.leavers||[]).forEach((w,i)=>{if(animWaiter(w,t)){scene.remove(w.fig);w.done=true;}});this.leavers=(this.leavers||[]).filter(w=>!w.done);
    if(this.state==='wait'){this.delay-=dt;if(this.delay<=0)this.go();return;}
    this.waiting.forEach(w=>{if(!w.leaving)animWaiter(w,t);});
    if(this.state==='drive'&&arrived(this.stop,9,dt)){
      sfx.horn('bus');
      const on=this.waiting.length,off=Math.min(this.onBoard,Math.floor(Math.random()*4));
      this.waiting.forEach(w=>{leave(w,car.x,car.z,.7);this.leavers.push(w);});this.waiting=[];
      for(let k=0;k<off;k++){const w=spawnWaiter(randLook(),car.x,car.z,0);leave(w,this.stop.px+(k-1)*2,this.stop.pz,1);this.leavers.push(w);}
      this.onBoard=this.onBoard-off+on;
      const pay=on*4;addStuds(pay);sfx.cash();
      toast(`${on} on, ${off} off <span class="plus">+${pay}</span>`,this.stop.name);
      this.idx=(this.idx+1)%busStops.length;
      if(this.idx===0){addStuds(20);setTimeout(()=>toast('Route complete! <span class="plus">+20</span>','Round Brickton and back'),1800);count('busroute');}
      count('bus',on);if(night>.6)count('night');
      this.state='wait';this.delay=1.6;setTarget(null);
    }
  }
};
const JOBS={cab:taxiJob,scooter:pizzaJob,van:iceJob,bus:busJob};
let job=null;
function startJob(){if(job)job.clear();job=JOBS[V.type];job.start();}
on('bump',imp=>{if(job===taxiJob&&taxiJob.state==='ride'&&taxiJob.kind==='cake'){taxiJob.cake=Math.max(0,taxiJob.cake-clamp(imp/30,.12,.4));}});
on('land',imp=>{if(job===taxiJob&&taxiJob.state==='ride'&&taxiJob.kind==='cake')taxiJob.cake=Math.max(0,taxiJob.cake-.35);});
on('airtime',a=>{if(a>.7){count('air');toast('Big air!',a.toFixed(1)+' seconds off the ground');}});
on('washed',()=>{if(car.washedDirty){toast('Squeaky clean!','Passengers love a shiny cab');count('wash');car.washedDirty=false;}else toast('Sparkling!','');});
on('gold',()=>{});

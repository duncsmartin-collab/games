/* =====================================================================
   TOWN LIFE: day & night, townsfolk, zebra crossings, mud & car wash,
   golden studs, the train
   ===================================================================== */
let night=0,dayT=.3;
const DAY_LEN=420;
const SKY={day:[new T.Color(.36,.66,.92),new T.Color(.81,.906,.96)],dusk:[new T.Color(.33,.36,.66),new T.Color(.98,.66,.46)],night:[new T.Color(.025,.04,.12),new T.Color(.09,.13,.27)]};
const _c1=new T.Color(),_c2=new T.Color();
let envNow='day';
function updateSky(dt){
  if(save.time==='auto')dayT=(dayT+dt/DAY_LEN)%1;
  else{const goal=save.time==='night'?.75:.28;let d=goal-dayT;if(d>.5)d-=1;if(d<-.5)d+=1;dayT=(dayT+d*Math.min(1,dt*1.5)+1)%1;}
  const sunH=Math.sin(dayT*Math.PI*2);
  night=smooth(.12,-.12,sunH);
  const dusk=clamp(1-Math.abs(sunH)/.3,0,1);
  /* sky + fog */
  _c1.copy(SKY.day[0]).lerp(SKY.dusk[0],dusk*(1-night)).lerp(SKY.night[0],night);
  _c2.copy(SKY.day[1]).lerp(SKY.dusk[1],dusk*(1-night*.6)).lerp(SKY.night[1],night);
  skyMat.uniforms.uTop.value.copy(_c1);skyMat.uniforms.uHor.value.copy(_c2);skyMat.uniforms.uStars.value=night;
  scene.fog.color.copy(_c2).convertSRGBToLinear();
  /* sun by day, cool moon by night */
  sunDir.set(-.55,lerp(1,.38,dusk),.42+dusk*.35).normalize();
  sun.intensity=lerp(1.55,.42,night)*(1-dusk*.25*(1-night));
  sun.color.setRGB(1,lerp(.94,.72,dusk),lerp(.85,.55,dusk)).lerp(_c2.setRGB(.55,.65,1),night);
  hemi.intensity=lerp(.62,.32,night);
  hemi.color.setRGB(lerp(.85,.35,night),lerp(.92,.42,night),lerp(1,.75,night));
  const want=night>.6?'night':dusk>.45?'dusk':'day';
  if(want!==envNow&&ENV[want]){envNow=want;scene.environment=ENV[want];}
  /* lights come on */
  glassMat.emissiveIntensity=night*.85;
  glowMat.emissiveIntensity=night*1.5;
  poolMat.opacity=night*.6;poolMeshes.forEach(m=>m.visible=night>.02);
  nightSigns.forEach(m=>m.emissiveIntensity=.05+night*.75);
  postMat.uniforms.uNight.value=night;
  clouds.forEach(c=>{c.material.emissiveIntensity=lerp(.25,.02,night);});
  if(lightBeam){lightBeam.visible=night>.05;lightBeam.material.opacity=night*.5;}
  /* the clock tower follows the day: dayT 0 is 6am */
  if(clockHands){const hrs=(dayT*24+6)%24,mins=(hrs%1)*60;clockHands.forEach(h=>{h.hh.rotation.z=-(hrs%12)/12*Math.PI*2;h.mh.rotation.z=-mins/60*Math.PI*2;});}
}
let lightBeam=null;
function buildLightBeam(){
  if(!lighthouse)return;
  const g=new T.PlaneGeometry(60,5);g.translate(30,0,0);
  lightBeam=new T.Mesh(g,new T.MeshBasicMaterial({map:glowTex,color:new T.Color('#FFF4C2'),transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false}));
  lightBeam.position.set(lighthouse.x,lighthouse.y,lighthouse.z);scene.add(lightBeam);
}

/* ---------- townsfolk strolling the pavements ---------- */
const FOLK=[{shirt:P.red,legs:P.blue,hat:'hair',hair:'#6B3B1F',skin:'#F2C8A0'},{shirt:P.green,legs:P.tan,hat:'bun',hair:'#2B1B12',skin:'#8D5A3B'},{shirt:P.orange,legs:P.navy,hat:'long',hair:'#E0B44A',skin:'#F6D3B3'},{shirt:P.purple,legs:P.black,hat:'bun',hair:P.black,skin:'#C68B5E'},{shirt:P.azure,legs:P.dgrey,hat:'cap',hatCol:P.red,skin:'#F2C8A0'},{shirt:P.pink,legs:P.white,hat:'long',hair:'#7A3B16',skin:'#A86F4A'},{shirt:P.white,legs:P.green,hat:'bobble',hatCol:P.blue,skin:'#F6D3B3'},{shirt:P.yellow,legs:P.brown,hat:'hair',hair:'#2B1B12',skin:'#6E4630'},{shirt:P.teal,legs:P.navy,hat:'top',hatCol:P.black,hair:'#C48A3A',skin:'#E9B98E'},{shirt:P.lilac,legs:P.dgrey,hat:'long',hair:'#B5452E',skin:'#F2C8A0'}];
const randLook=()=>Object.assign({},rpick(FOLK),{shirt:rpick(SHIRTS),skin:rpick(SKINS),hair:rpick(HAIRS)});
const folk=[];
function spawnFolk(){
  const n=Math.min(walkPaths.length,LOW?10:26);
  for(let k=0;k<n;k++){
    const p=walkPaths[(k*7)%walkPaths.length];
    const f=makeFigure(FOLK[k%FOLK.length]);f.scale.setScalar(.82);scene.add(f);
    folk.push({fig:f,p,t:rnd(),dir:rnd()<.5?1:-1,speed:.04+rnd()*.03,hop:0,wait:0});
  }
}
function updateFolk(dt,t){
  for(const o of folk){
    const ax=o.p.ax,az=o.p.az,bx=o.p.bx,bz=o.p.bz;
    const x=lerp(ax,bx,o.t),z=lerp(az,bz,o.t);
    const near=dist2(x,z,car.x,car.z)<(LOW?50:80);
    o.fig.visible=near;
    if(o.wait>0)o.wait-=dt;else{o.t+=o.dir*o.speed*dt*(28/Math.max(8,Math.hypot(bx-ax,bz-az)));if(o.t>1||o.t<0){o.t=clamp(o.t,0,1);o.dir*=-1;o.wait=1+Math.random()*3;}}
    if(!near)continue;
    o.fig.position.set(x,.3,z);
    o.fig.rotation.y=Math.atan2((bx-ax)*o.dir,(bz-az)*o.dir);
    /* hop out of the way of a fast car */
    if(o.hop<=0&&dist2(x,z,car.x,car.z)<4.5&&Math.abs(car.speed)>2){o.hop=.6;sfx.boop();}
    if(o.hop>0){o.hop-=dt;const k=1-o.hop/.6;o.fig.position.y=.3+Math.sin(k*Math.PI)*2.2;o.fig.userData.arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(-1.3*Math.sin(k*Math.PI)));}
    else if(o.wait>0){standPose(o.fig);o.fig.userData.head.rotation.y=Math.sin(t*.8+o.t*9)*.4;}
    else walkPose(o.fig,t+o.t*3);
  }
}

/* ---------- zebra crossings: stop for walkers and earn a kind driver star ---------- */
let crossTimer=2;
const walkers=[];
function updateCrossings(dt,t){
  crossTimer-=dt;
  if(crossTimer<=0&&walkers.length<3){
    crossTimer=3+Math.random()*3;
    const fx=Math.sin(car.h),fz=Math.cos(car.h);
    const cands=crossings.filter(c=>{const dx=c.x-car.x,dz=c.z-car.z,d=Math.hypot(dx,dz);return !c.walker&&c.cool<=0&&d>22&&d<70&&(dx*fx+dz*fz)/d>.7&&Math.abs(dx)<6;});
    if(cands.length){const c=cands[0];const f=makeFigure(randLook());f.scale.setScalar(.82);scene.add(f);
      const dir=Math.random()<.5?1:-1;const w={c,fig:f,dir,t:0,dur:6.5,wait:0,bad:false,hop:0};c.walker=w;walkers.push(w);}
  }
  crossings.forEach(c=>{if(c.cool>0)c.cool-=dt;});
  for(let k=walkers.length-1;k>=0;k--){
    const w=walkers[k],c=w.c;
    w.t+=dt/w.dur;
    const x=c.x+w.dir*lerp(-8.5,8.5,w.t);
    w.fig.position.set(x,.14,c.z);w.fig.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;
    if(w.hop>0){w.hop-=dt;w.fig.position.y=.14+Math.sin((1-w.hop/.6)*Math.PI)*2;}else walkPose(w.fig,t);
    const onRoad=w.t>.06&&w.t<.94;
    const dCar=Math.hypot(car.x-c.x,car.z-c.z);
    if(onRoad&&dCar<22&&Math.abs(car.speed)<1)w.wait+=dt;
    if(onRoad&&!w.bad&&Math.abs(car.z-c.z)<4.2&&Math.abs(car.x-c.x)<8&&Math.abs(car.speed)>2.5){w.bad=true;w.hop=.6;sfx.boop();toast('Oops! Wait for walkers to cross','Stop before the stripes next time');}
    if(w.t>=1){
      if(w.wait>1&&!w.bad){addStuds(5);toast('Kind driver! <span class="plus">+5</span>','You waited at the crossing');sfx.ding();count('kind');}
      scene.remove(w.fig);c.walker=null;c.cool=12;walkers.splice(k,1);
    }
  }
}

/* ---------- mud puddles and the car wash ---------- */
let inPuddle=false,washing=false;
function updateMud(dt){
  let p=null;for(const q of puddles)if(Math.hypot(car.x-q.x,car.z-q.z)<q.r){p=q;break;}
  if(p&&!car.air&&Math.abs(car.speed)>3){
    const was=car.dirt;car.dirt=Math.min(1,car.dirt+dt*1.1);car.shine=0;
    if(Math.random()<dt*30)emit(debris,new T.Vector3(car.x+(Math.random()-.5)*4,.6,car.z+(Math.random()-.5)*4),new T.Vector3((Math.random()-.5)*10,6+Math.random()*6,(Math.random()-.5)*10),Math.random()<.5?'#5A3A1E':'#7A5230',1.2,.4);
    if(!inPuddle){sfx.splash();}
    if(was<1&&car.dirt>=1)count('mud');
  }
  inPuddle=!!p;
  const w=washZone,inside=w&&car.x>w.x0&&car.x<w.x1&&car.z>w.z0&&car.z<w.z1;
  brushes.forEach((b,i)=>{if(i===brushes.length-1)b.rotation.y+=dt*(inside?14:1.5);else b.rotation.y+=dt*(inside?12:1.2)*(i%2?1:-1);});
  if(inside&&Math.abs(car.speed)<14){
    if(!washing){washing=true;sfx.wash();}
    const before=car.dirt;car.dirt=Math.max(0,car.dirt-dt*.6);
    if(Math.random()<dt*20)emit(puffs,new T.Vector3(car.x+(Math.random()-.5)*5,1+Math.random()*5,car.z+(Math.random()-.5)*5),new T.Vector3((Math.random()-.5)*2,1,(Math.random()-.5)*2),null,1.1,1.2);
    if(car.shine<=0&&car.x>w.x1-6){car.shine=45;car.washedDirty=before>0||car.washedDirty;emitEv('washed');}
  }else washing=false;
  if(car.shine>0){car.shine-=dt;if(Math.random()<dt*6)sparkle(car.x+(Math.random()-.5)*5,car.y+2+Math.random()*3,car.z+(Math.random()-.5)*6,1,'#FFFFFF');}
}

/* ---------- golden studs ---------- */
const golds=[];
let GOLD_TOTAL=0;
const goldMat=new SMat({color:lin('#FFC93C').clone(),metalness:.75,roughness:.18,emissive:lin('#B37400').clone(),emissiveIntensity:.35,envMapIntensity:1.6});
const goldGeo=mergeGeos([{geo:new T.CylinderGeometry(1.1,1.1,.6,20),m:M(0,0,0,Math.PI/2)},{geo:new T.CylinderGeometry(.75,.75,.25,20),m:M(0,0,.42,Math.PI/2)},{geo:new T.CylinderGeometry(.75,.75,.25,20),m:M(0,0,-.42,Math.PI/2)}]);
const haloMat=new T.MeshBasicMaterial({map:glowTex,color:new T.Color('#FFD84A'),transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending,fog:false});
function buildGolds(){
  GOLD_TOTAL=goldSpots.length;
  goldSpots.forEach((s,i)=>{
    if(save.golden.includes(i))return;
    const g=new T.Group();g.position.set(s.x,s.y+1,s.z);
    const m=new T.Mesh(goldGeo,goldMat);m.castShadow=true;g.add(m);
    const h=new T.Mesh(new T.PlaneGeometry(4.4,4.4),haloMat);g.add(h);
    scene.add(g);golds.push({i,g,m,h,s});
  });
}
function updateGolds(dt,t){
  for(let k=golds.length-1;k>=0;k--){
    const o=golds[k],near=dist2(o.s.x,o.s.z,car.x,car.z)<(LOW?100:150);
    o.g.visible=near;if(!near)continue;
    o.m.rotation.y=t*2+k;o.g.position.y=o.s.y+1+Math.sin(t*2.4+k)*.3;o.h.quaternion.copy(camera.quaternion);
    const d=Math.hypot(car.x-o.s.x,(car.y+2.2)-(o.s.y+1),car.z-o.s.z);
    if(d<3.1){
      scene.remove(o.g);golds.splice(k,1);save.golden.push(o.i);
      sparkle(o.s.x,o.s.y+1,o.s.z,14,'#FFD84A');sfx.gold();addStuds(25);
      toast(`Golden stud! <span class="plus">+25</span>`,`${save.golden.length} of ${GOLD_TOTAL} found`);
      emitEv('gold');persist();updateWallet();
    }
  }
}

/* ---------- the train ---------- */
let trainZ=-320,trainWait=0,tooted=false;
function updateTrain(dt){
  if(trainWait>0){trainWait-=dt;return;}
  trainZ+=dt*(Math.abs(trainZ)<40?9:20);
  if(trainZ>360){trainZ=-360;trainWait=8;tooted=false;}
  trainCars.forEach((c,k)=>{c.position.z=trainZ-k*15;});
  if(!tooted&&trainZ>-60&&Math.hypot(car.x-200,car.z-trainZ)<160){tooted=true;sfx.toot();}
}

/* ---------- ambient motion ---------- */
function updateAmbient(dt,t){
  seaTex.offset.x=(t*.004)%1;seaTex.offset.y=(Math.sin(t*.4)*.01);
  clouds.forEach((c,i)=>{c.position.x+=dt*(1.2+i*.15);if(c.position.x>300)c.position.x=-300;});
  if(lightBeam&&lightBeam.visible)lightBeam.rotation.y=t*.9;
}

/* ---------- knockable roadworks cones ---------- */
const cones=[];
function buildCones(){
  const coneGeo=mergeGeos([{geo:rbox(1.6,.3,1.6,.08),m:M(0,.15,0),color:P.orange},{geo:new T.CylinderGeometry(.18,.62,2.1,12),m:M(0,1.35,0),color:P.orange},{geo:new T.CylinderGeometry(.36,.46,.4,12),m:M(0,1.4,0),color:P.white}]);
  [[roadC(2)+3,roadC(1)+12,0,1],[roadC(1)+14,roadC(3)-3,1,0],[roadC(4)-3,roadC(2)+16,0,1],[roadC(0)+30,roadC(5)+3,1,0],[roadC(5)+14,roadC(4)+3,1,0]].forEach(([x,z,dx,dz])=>{
    for(let k=0;k<4;k++){const c=new T.Mesh(coneGeo,vcolMat);c.castShadow=true;const px=x+dx*k*3.2,pz=z+dz*k*3.2;c.position.set(px,.15,pz);scene.add(c);cones.push({m:c,home:new T.Vector3(px,.15,pz),v:new T.Vector3(),av:new T.Vector3(),down:false,t:0});}
  });
}
function updateCones(dt){
  const fx=Math.sin(car.h),fz=Math.cos(car.h);
  for(const c of cones){
    c.m.visible=Math.abs(c.m.position.x-car.x)<90&&Math.abs(c.m.position.z-car.z)<90;
    if(!c.down){
      if(Math.abs(c.m.position.x-car.x)>14||Math.abs(c.m.position.z-car.z)>14)continue;
      for(const off of V.spec.circles){const dx=c.m.position.x-(car.x+fx*off),dz=c.m.position.z-(car.z+fz*off);
        if(Math.hypot(dx,dz)<V.spec.r+.8&&Math.abs(car.speed)>1.5){c.down=true;c.t=0;const s=Math.abs(car.speed);c.v.set(car.vx*1.05+dx*1.5,6+s*.35,car.vz*1.05+dz*1.5);c.av.set(Math.random()*12-6,Math.random()*8-4,Math.random()*12-6);sfx.clack();break;}}
    }else{
      c.t+=dt;
      if(c.t<6){c.v.y-=40*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.av.x*dt;c.m.rotation.y+=c.av.y*dt;c.m.rotation.z+=c.av.z*dt;
        if(c.m.position.y<.4){c.m.position.y=.4;c.v.y*=-.3;c.v.x*=.6;c.v.z*=.6;c.av.multiplyScalar(.6);if(Math.abs(c.v.y)<1){c.v.set(0,0,0);c.av.set(0,0,0);}}}
      else if(Math.hypot(c.home.x-car.x,c.home.z-car.z)>20){c.down=false;c.m.position.copy(c.home);c.m.rotation.set(0,0,0);}
    }
  }
}

/* =====================================================================
   DRIVING: physics, jumps, collisions, gearbox, camera, particles
   ===================================================================== */
const car={x:roadC(2)-3.5,z:roadC(3)-14,h:Math.PI,speed:0,vx:0,vz:0,steer:0,y:.14,vy:0,air:false,airT:0,slope:0,pitch:0,roll:0,wheelRot:0,shake:0,lastBump:0,dirt:0,shine:0};
const input={steer:0,throttle:0,brake:0,keySteer:0};
const BRK=38,COAST=5,GRAV=26;
let V=null,reverseTimer=0;
const blobMat=new T.MeshBasicMaterial({map:glowTex,color:new T.Color(0,0,0),transparent:true,opacity:.45,depthWrite:false});
const events={};function on(n,f){(events[n]=events[n]||[]).push(f);}function emitEv(n,a,b){(events[n]||[]).forEach(f=>f(a,b));}

function spawnVehicle(type){
  if(V)scene.remove(V.group);
  V=buildVehicle(type,{paint:save.paint[type]||VEH[type].paint},save.driver);
  if(LOW){const s=V.spec.circles.length*3.2+2.5;const b=new T.Mesh(new T.PlaneGeometry(type==='scooter'?2.6:5.2,s),blobMat);b.rotation.x=-Math.PI/2;b.position.y=.06;b.renderOrder=1;V.group.add(b);V.blob=b;}
  scene.add(V.group);V.group.position.set(car.x,car.y,car.z);V.group.rotation.set(car.slope,car.h,0);
  $('hornLabel').textContent=type==='van'?'Chime':type==='bus'?'Bell':'Horn';
}

/* ---------- collisions ---------- */
function collide(){
  const S=V.spec,fx=Math.sin(car.h),fz=Math.cos(car.h);
  let hit=null,hitN=null,maxPen=0;
  for(const off of S.circles){
    const cx=car.x+fx*off,cz=car.z+fz*off,r=S.r;
    for(const c of nearCols(cx,cz,r+1)){
      if(car.y>c.h+.2&&c.h>0)continue; /* sailing over low things after a jump */
      let nx,nz,pen;
      if(c.t==='box'){
        const px=clamp(cx,c.x0,c.x1),pz=clamp(cz,c.z0,c.z1);let dx=cx-px,dz=cz-pz,d=Math.hypot(dx,dz);
        if(d>=r)continue;
        if(d<1e-4){const l=cx-c.x0,rr=c.x1-cx,t=cz-c.z0,b=c.z1-cz,m=Math.min(l,rr,t,b);if(m===l){nx=-1;nz=0;}else if(m===rr){nx=1;nz=0;}else if(m===t){nx=0;nz=-1;}else{nx=0;nz=1;}pen=r+m;}
        else{nx=dx/d;nz=dz/d;pen=r-d;}
      }else{
        const dx=cx-c.x,dz=cz-c.z,d=Math.hypot(dx,dz);if(d>=r+c.r)continue;nx=dx/(d||1);nz=dz/(d||1);pen=r+c.r-d;
        if(c.ref&&c.ref.hop<=0){c.ref.hop=.6;sfx.boop();}
      }
      car.x+=nx*pen;car.z+=nz*pen;
      const vn=car.vx*nx+car.vz*nz;if(vn<0){car.vx-=vn*nx*1.2;car.vz-=vn*nz*1.2;}
      if(pen>maxPen){maxPen=pen;hit=c;hitN=[nx,nz];}
    }
  }
  car.x=clamp(car.x,BOUND.x0+2,BOUND.x1-2);
  const zmax=(car.x>35.5&&car.x<44.5)?262:BOUND.z1;car.z=clamp(car.z,BOUND.z0+2,zmax);
  if(hit){
    const into=-(fx*hitN[0]+fz*hitN[1])*Math.sign(car.speed||1);
    const impact=Math.abs(car.speed)*Math.max(0,into);
    if(into>.45)car.speed*=-.18;else car.speed*=.88;
    if(impact>6&&performance.now()-car.lastBump>250){
      car.lastBump=performance.now();car.shake=Math.min(1,impact/20);
      const n=Math.min(10,Math.floor(impact/2.5));
      const at=new T.Vector3(car.x-hitN[0]*2.6+fx*(car.speed>=0?2:-2),car.y+2,car.z-hitN[1]*2.6+fz*(car.speed>=0?2:-2));
      for(let k=0;k<n;k++)emit(debris,at,new T.Vector3(hitN[0]*6+Math.random()*8-4,6+Math.random()*8,hitN[1]*6+Math.random()*8-4),k%3===0?(save.paint[V.type]||V.spec.paint):hit.col,1.6+Math.random(),.55);
      sfx.bump(impact);emitEv('bump',impact);
    }
  }
}

/* ---------- four-speed automatic: revs climb and fall through each gear ---------- */
const GEARS=[[0,9],[7,16],[14,24],[21,37]];
const gbox={gear:0,rpm:.12,shift:0,cruise:0};
function updateGearbox(dt){
  const sp=Math.abs(car.speed),k=V.spec.maxF/30,G=GEARS.map(([a,b])=>[a*k,b*k]);
  let r;
  if(car.speed<-.3){gbox.gear=-1;r=.15+sp/11*.5;}
  else{
    if(gbox.gear<0)gbox.gear=0;
    r=(sp-G[gbox.gear][0])/(G[gbox.gear][1]-G[gbox.gear][0]);
    if(r>.93&&gbox.gear<3&&input.throttle&&gbox.shift<=0&&!car.air){gbox.gear++;gbox.shift=.24;sfx.shift(true);car.pitch+=.035;}
    else if(gbox.gear>0&&sp<G[gbox.gear][0]+.3){gbox.gear--;sfx.shift(false);}
    r=clamp((sp-G[gbox.gear][0])/(G[gbox.gear][1]-G[gbox.gear][0]),0,1);
  }
  gbox.shift=Math.max(0,gbox.shift-dt);
  let target=sp<.3?(input.throttle?.32:.1):.14+r*.8+(input.throttle?.06:0);
  if(car.air)target=input.throttle?.95:.5;
  if(gbox.shift>0)target*=.55;
  gbox.rpm=damp(gbox.rpm,clamp(target,.08,1),gbox.shift>0?16:7,dt);
  gbox.cruise=sp>V.spec.maxF*.93&&input.throttle?Math.min(1,gbox.cruise+dt*.5):Math.max(0,gbox.cruise-dt*2);
  let vol=.04+(input.throttle?.03:0)+gbox.rpm*.025;
  vol*=(1-gbox.cruise*.45)*(gbox.shift>0?.5:1);
  sfx.engine(gbox.rpm,input.throttle,vol,V.type);
}

/* ---------- the drive ---------- */
function updateCar(dt){
  const S=V.spec,steerIn=clamp(input.steer+input.keySteer,-1,1);
  car.steer=damp(car.steer,steerIn,16,dt);
  if(!car.air){
    if(input.brake){
      if(car.speed>.4)car.speed=Math.max(0,car.speed-BRK*dt);
      else{reverseTimer+=dt;if(reverseTimer>.25)car.speed=Math.max(-11,car.speed-S.acc*.7*dt);}
    }else reverseTimer=0;
    if(input.throttle){if(car.speed<0)car.speed=Math.min(0,car.speed+BRK*dt);else car.speed=Math.min(S.maxF,car.speed+S.acc*(gbox.shift>0?.35:1)*(1-car.speed/S.maxF*.55)*dt);}
    if(!input.throttle&&!input.brake)car.speed-=Math.sign(car.speed)*Math.min(Math.abs(car.speed),COAST*dt);
  }
  const sp=Math.abs(car.speed);
  const turn=(S.turn-.9*clamp(sp/S.maxF,0,1))*clamp(sp/4,0,1)*(car.air?.25:1);
  car.h-=car.steer*turn*Math.sign(car.speed)*dt;
  const fx=Math.sin(car.h),fz=Math.cos(car.h);
  const grip=car.air?.5:9;
  car.vx=damp(car.vx,fx*car.speed,grip,dt);car.vz=damp(car.vz,fz*car.speed,grip,dt);
  car.x+=car.vx*dt;car.z+=car.vz*dt;
  collide();
  /* vertical: follow the ground, launch off ramp lips, land with a bump */
  const g=groundAt(car.x,car.z);
  if(car.air){
    car.vy-=GRAV*dt;car.y+=car.vy*dt;car.airT+=dt;
    if(car.y<=g){
      const impact=-car.vy;car.y=g;car.air=false;car.vy=0;
      if(impact>6){car.shake=Math.min(1,impact/18);sfx.land(impact);emitEv('land',impact);for(let k=0;k<8;k++)emit(puffs,new T.Vector3(car.x+(Math.random()-.5)*4,car.y+.4,car.z+(Math.random()-.5)*6),new T.Vector3((Math.random()-.5)*6,1.5,(Math.random()-.5)*6),null,.8,.9);}
      if(car.airT>.6)emitEv('airtime',car.airT);
    }
  }else{
    if(g<car.y-.35&&car.vy>3){car.air=true;car.airT=0;}
    else{const ny=damp(car.y,g,26,dt);car.vy=(ny-car.y)/Math.max(dt,1e-3);car.y=ny;}
  }
  /* slope pitch from the ground under the nose and tail */
  const span=Math.max(2,Math.abs(S.circles[0]-S.circles[S.circles.length-1])+2);
  if(!car.air){const gf=groundAt(car.x+fx*span/2,car.z+fz*span/2),gb=groundAt(car.x-fx*span/2,car.z-fz*span/2);car.slope=damp(car.slope,-Math.atan2(gf-gb,span),12,dt);}
  else car.slope=damp(car.slope,.18,1.6,dt);
  const accel=(input.throttle?1:0)-(input.brake&&car.speed>.4?1.4:0);
  car.pitch=damp(car.pitch,car.air?0:-accel*.035,6,dt);
  const lean=V.type==='scooter'?.35:.07;
  car.roll=damp(car.roll,car.steer*clamp(sp/S.maxF,0,1)*lean,6,dt);
  car.wheelRot+=car.speed*dt/(V.wheels[0]?V.wheels[0].r:1.05);
  car.shake=Math.max(0,car.shake-dt*3);
  /* model */
  const G=V.group;
  G.position.set(car.x,car.y+(car.air?0:Math.abs(Math.sin(performance.now()*.045))*.04*clamp(sp/8,0,1)),car.z);
  G.rotation.set(car.slope,car.h,0);
  V.body.rotation.set(car.pitch,0,V.type==='scooter'?-car.roll:car.roll);
  V.wheels.forEach(w=>{w.spin.rotation.x=car.wheelRot;if(w.front)w.steerG.rotation.y=-car.steer*.45;});
  if(V.sw)V.sw.rotation.z=car.steer*1.2;
  V.driver.userData.head.rotation.y=-car.steer*.35;
  V.tailMat.emissiveIntensity=input.brake?1.6:.35+night*.8;
  V.headMat.emissiveIntensity=.5+night*2.5;
  V.beamMat.opacity=night*.55;
  const mud=car.dirt*.7;V.bodyMat.color.setRGB(1-mud*.42,1-mud*.55,1-mud*.68);
  $('gear').hidden=!(car.speed<-.3);
  if(input.throttle&&!car.air&&Math.random()<dt*(car.speed<8?14:6)&&V.type!=='scooter'){
    const back=V.spec.circles[V.spec.circles.length-1]-2.8;
    emit(puffs,new T.Vector3(car.x+fx*back+Math.cos(car.h)*1.2,car.y+1.4,car.z+fz*back-Math.sin(car.h)*1.2),new T.Vector3(-fx*3+Math.random()-.5,1.5+Math.random(),-fz*3+Math.random()-.5),null,.9,.7);
  }
}

/* ---------- particles ---------- */
function pool(geo,n,mat){const im=new T.InstancedMesh(geo,mat,n);im.instanceMatrix.setUsage(T.DynamicDrawUsage);im.frustumCulled=false;const zero=new T.Matrix4().makeScale(0,0,0);const arr=[];for(let i=0;i<n;i++){im.setMatrixAt(i,zero);im.setColorAt(i,new T.Color(1,1,1));arr.push({life:0,i});}scene.add(im);return {im,arr,next:0};}
const debris=pool(mergeGeos([{geo:rbox(1,.5,1,.08)},{geo:studGeo,m:M(0,.25,0)}]),LOW?60:110,new SMat({vertexColors:true,roughness:.32,envMapIntensity:.7}));
const puffs=pool(new T.CylinderGeometry(.55,.55,.35,12),LOW?30:50,new SMat({color:lin('#F1F1EE').clone(),roughness:.5,transparent:true,opacity:.92}));
const sparks=pool(new T.PlaneGeometry(1,1),40,new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
function emit(pl,pos,vel,col,life,scale){const p=pl.arr[pl.next];pl.next=(pl.next+1)%pl.arr.length;p.life=life;p.max=life;p.p=pos.clone();p.v=vel.clone();p.r=new T.Euler(Math.random()*6,Math.random()*6,Math.random()*6);p.rv=new T.Vector3(Math.random()*10-5,Math.random()*10-5,Math.random()*10-5);p.s=scale||1;if(col){pl.im.setColorAt(p.i,lin(col));pl.im.instanceColor.needsUpdate=true;}}
const _m=new T.Matrix4(),_q=new T.Quaternion(),_s=new T.Vector3();
function stepPool(pl,dt,grav,mode){
  if(!pl.arr.some(p=>p.life>0)){if(pl.idle)return;pl.idle=true;}else pl.idle=false;
  for(const p of pl.arr){if(p.life<=0)continue;p.life-=dt;
    if(p.life<=0){_m.makeScale(0,0,0);pl.im.setMatrixAt(p.i,_m);continue;}
    p.v.y-=grav*dt;p.p.addScaledVector(p.v,dt);
    if(grav>0&&p.p.y<.3){p.p.y=.3;p.v.y*=-.35;p.v.x*=.7;p.v.z*=.7;p.rv.multiplyScalar(.6);}
    const k=p.life/p.max;let sc;
    if(mode==='grow'){sc=p.s*(1+(1-k)*1.6)*Math.min(1,k*3);p.r.x+=p.rv.x*dt;p.r.y+=p.rv.y*dt;p.r.z+=p.rv.z*dt;_q.setFromEuler(p.r);}
    else if(mode==='face'){sc=p.s*Math.min(1,k*3);_q.copy(camera.quaternion);}
    else{sc=p.s*Math.min(1,k*4);p.r.x+=p.rv.x*dt;p.r.y+=p.rv.y*dt;p.r.z+=p.rv.z*dt;_q.setFromEuler(p.r);}
    _s.set(sc,sc,sc);_m.compose(p.p,_q,_s);pl.im.setMatrixAt(p.i,_m);}
  pl.im.instanceMatrix.needsUpdate=true;
}
function confetti(x,y,z,n){for(let k=0;k<n;k++)emit(debris,new T.Vector3(x,y,z),new T.Vector3(Math.random()*16-8,10+Math.random()*12,Math.random()*16-8),rpick([P.red,P.yellow,P.blue,P.green,P.white,P.orange,P.pink]),2.2+Math.random(),.45);}
function sparkle(x,y,z,n,col){for(let k=0;k<n;k++){emit(sparks,new T.Vector3(x+(Math.random()-.5)*3,y+(Math.random()-.5)*2,z+(Math.random()-.5)*3),new T.Vector3((Math.random()-.5)*4,2+Math.random()*4,(Math.random()-.5)*4),col||'#FFE48A',.7+Math.random()*.5,.9+Math.random());}}

/* ---------- camera ---------- */
let camMode=0,camInit=false,attract=true,garageOpen=false;
const camPos=new T.Vector3(),camLook=new T.Vector3();
function camBlocked(ax,az,bx,bz,by){
  for(let k=1;k<=6;k++){const t=k/7,x=lerp(ax,bx,t),z=lerp(az,bz,t),y=lerp(4,by,t);
    for(const c of nearCols(x,z,.5))if(c.t==='box'&&c.h>y&&x>c.x0&&x<c.x1&&z>c.z0&&z<c.z1)return t;}
  return 1;
}
let camDistNow=1;
function updateCamera(dt,t){
  const want=new T.Vector3(),look=new T.Vector3();
  const C=V.spec.cam,dist=C[0]*(camMode?1.55:1),height=C[1]*(camMode?1.9:1);
  if(attract){
    const a=t*.18;want.set(car.x+Math.sin(a)*24,11+Math.sin(t*.3)*2,car.z+Math.cos(a)*24);look.set(car.x-6,3,car.z);camera.fov=40;
  }else if(garageOpen){
    /* swing gently around the back of the vehicle, aimed a little right so it sits beside the panel */
    const a=car.h+.55+Math.sin(t*.35)*.55,d=Math.max(17,dist*.9),rx=Math.cos(a),rz=-Math.sin(a),off=d*.34;
    const free=camBlocked(car.x,car.z,car.x+Math.sin(a)*d,car.z+Math.cos(a)*d,height);
    const dd=d*(free<1?Math.max(.45,free*.9):1);
    want.set(car.x+Math.sin(a)*dd+rx*off,car.y+height*.5+1.5,car.z+Math.cos(a)*dd+rz*off);
    look.set(car.x+rx*off,car.y+3.5,car.z+rz*off);camera.fov=42;
  }else{
    const lookAhead=clamp(car.speed/V.spec.maxF,-.4,1)*6;
    const hx=Math.sin(car.h),hz=Math.cos(car.h);
    const free=camBlocked(car.x,car.z,car.x-hx*dist,car.z-hz*dist,height);
    camDistNow=damp(camDistNow,free<1?Math.max(.35,free*.92):1,free<1?10:2,dt);
    want.set(car.x-hx*dist*camDistNow,height*(.55+.45*camDistNow)+car.y,car.z-hz*dist*camDistNow);
    look.set(car.x+hx*(2.5+lookAhead),car.y+2.5,car.z+hz*(2.5+lookAhead));
    camera.fov=damp(camera.fov,(camMode?44:48)+clamp(Math.abs(car.speed)/V.spec.maxF,0,1)*6,3,dt);
  }
  if(!camInit){camPos.copy(want);camLook.copy(look);camInit=true;}
  const k=attract||garageOpen?2:4.5;
  camPos.x=damp(camPos.x,want.x,k,dt);camPos.y=damp(camPos.y,want.y,k,dt);camPos.z=damp(camPos.z,want.z,k,dt);
  camLook.x=damp(camLook.x,look.x,8,dt);camLook.y=damp(camLook.y,look.y,8,dt);camLook.z=damp(camLook.z,look.z,8,dt);
  camera.position.copy(camPos);
  if(car.shake>0){camera.position.x+=(Math.random()-.5)*car.shake*.9;camera.position.y+=(Math.random()-.5)*car.shake*.9;}
  camera.lookAt(camLook);camera.updateProjectionMatrix();
  /* sun + shadow box follow the car, snapped to shadow texels to stop shimmer */
  const tex=(SC.right-SC.left)/sun.shadow.mapSize.x;
  const fx=Math.round(car.x/tex)*tex,fz=Math.round(car.z/tex)*tex;
  sun.target.position.set(fx,0,fz);sun.position.set(fx+sunDir.x*120,sunDir.y*120,fz+sunDir.z*120);
  skyDome.position.copy(camera.position);
  if(usePost){const sp=new T.Vector3(car.x,car.y+2,car.z).project(camera);postMat.uniforms.uFocus.value=damp(postMat.uniforms.uFocus.value,clamp(sp.y*.5+.5,.25,.75),5,dt);}
}

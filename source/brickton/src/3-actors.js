/* =====================================================================
   ACTORS: toy figures (our own design) and brick-built vehicles
   ===================================================================== */
const MSf=MS;
const FG={leg:rbox(.95,1.5,1,.2),shoe:rbox(.98,.42,1.3,.16),pelvis:rbox(2,.55,1.05,.2),torso:rbox(2.15,1.9,1.15,.34),tie:rbox(.5,1.2,.2,.08),arm:rbox(.62,1.55,.7,.28),hand:new T.SphereGeometry(.38,12,8),neck:new T.CylinderGeometry(.42,.42,.4,12),skull:new T.SphereGeometry(.92,22,16),eye:new T.SphereGeometry(.14,8,6),glint:new T.SphereGeometry(.05,6,4),cheek:new T.SphereGeometry(.16,8,6),smile:new T.TorusGeometry(.26,.055,6,12,Math.PI),cap:new T.SphereGeometry(.98,20,10,0,Math.PI*2,0,Math.PI/2),brim:rbox(1.5,.14,.9,.06),band:new T.CylinderGeometry(1.0,1.0,.22,20,1,true),hair:new T.SphereGeometry(.98,20,12,0,Math.PI*2,0,Math.PI*.55),fringe:rbox(1.6,.35,.5,.14),bun:new T.SphereGeometry(.45,12,8),longBack:rbox(1.9,1.9,.6,.25),topHat:new T.CylinderGeometry(.72,.78,1.5,18),topBrim:new T.CylinderGeometry(1.25,1.25,.12,20),helmet:new T.SphereGeometry(1.08,20,12,0,Math.PI*2,0,Math.PI*.58),visor:rbox(1.5,.5,.3,.12),crown:new T.CylinderGeometry(.82,.82,.6,16,1,true),spike:new T.ConeGeometry(.18,.5,6),jewel:new T.SphereGeometry(.16,8,6),pom:new T.SphereGeometry(.38,10,8),roll:new T.TorusGeometry(.95,.18,8,20),chef:new T.CylinderGeometry(.8,.65,1.2,16),puff:new T.SphereGeometry(.95,14,10)};
const figMat=new SMat({vertexColors:true,roughness:.34,metalness:0,envMapIntensity:.75});
const HATS=[
  {id:'cap',name:'Flat cap',price:0},{id:'hair',name:'Short hair',price:0},{id:'bun',name:'Hair bun',price:0},{id:'long',name:'Long hair',price:0},
  {id:'bobble',name:'Bobble hat',price:40},{id:'chef',name:'Chef hat',price:60},{id:'helmet',name:'Racing helmet',price:80},{id:'top',name:'Top hat',price:100},{id:'crown',name:'Crown',price:250}];
const SKINS=['#F6D3B3','#F2C8A0','#E9B98E','#C68B5E','#A86F4A','#8D5A3B','#6E4630'];
const HAIRS=['#2B1B12','#6B3B1F','#C48A3A','#E0B44A','#B5452E','#F4F4F2','#E87AA4','#36AEBF'];
const SHIRTS=['#2D3F6E','#C91A09','#0A5BC4','#2E8B4A','#F2C230','#E87AA4','#7A4FA8','#F57F1F','#22262C','#F4F4F2','#36AEBF','#9FE0C3'];

function makeFigure(o){
  o=Object.assign({skin:'#F2C8A0',shirt:P.blue,legs:P.navy,shoes:P.black,hat:'cap',hatCol:P.black,hair:P.brown,trim:P.white},o||{});
  const mesh=list=>{const m=new T.Mesh(mergeGeos(list),figMat);m.castShadow=!LOW;return m;};
  const fig=new T.Group();
  const hip=new T.Group();hip.position.y=1.7;fig.add(hip);
  const legs=[];
  [-.5,.5].forEach(x=>{const lg=new T.Group();lg.position.x=x;hip.add(lg);
    lg.add(mesh([{geo:FG.leg,m:M(0,-.7,0),color:o.legs},{geo:FG.shoe,m:M(0,-1.5,.14),color:o.shoes}]));legs.push(lg);});
  fig.add(mesh([{geo:FG.pelvis,m:M(0,1.82,0),color:o.legs},{geo:FG.torso,m:M(0,2.98,0),color:o.shirt},{geo:FG.tie,m:M(0,3.15,.56),color:o.trim}]));
  const arms=[];
  [-1,1].forEach(s=>{const sh=new T.Group();sh.position.set(s*1.2,3.7,0);fig.add(sh);
    sh.add(mesh([{geo:FG.arm,m:M(s*.08,-.66,0,0,0,s*.12),color:o.shirt},{geo:FG.hand,m:M(s*.2,-1.52,0),color:o.skin}]));arms.push(sh);});
  const head=new T.Group();head.position.y=4.05;fig.add(head);
  const ink='#1B1E24',hp=[{geo:FG.neck,m:M(0,.1,0),color:o.skin},{geo:FG.skull,m:MS(0,.95,0,1.05,.98,.95),color:o.skin}];
  [-.32,.32].forEach(x=>{hp.push({geo:FG.eye,m:MS(x,1.08,.82,1,1.35,.5),color:ink},{geo:FG.glint,m:M(x+.04,1.15,.88),color:'#FFFFFF'},{geo:FG.cheek,m:MS(x*1.75,.78,.72,1,.7,.4),color:'#EE8E8E'});});
  hp.push({geo:FG.smile,m:M(0,.8,.86,0,0,Math.PI),color:ink});
  const hairDome=()=>hp.push({geo:FG.hair,m:MS(0,1.12,-.04,1.07,.85,1.03),color:o.hair});
  switch(o.hat){
    case 'cap':hp.push({geo:FG.cap,m:MS(0,1.32,0,1.06,.62,1.02),color:o.hatCol},{geo:FG.brim,m:M(0,1.36,.85,.12),color:o.hatCol},{geo:FG.band,m:MS(0,1.38,0,1.04,1,1),color:o.trim});break;
    case 'hair':hairDome();hp.push({geo:FG.fringe,m:M(0,1.62,.6,-.4),color:o.hair});break;
    case 'bun':hairDome();hp.push({geo:FG.bun,m:M(0,1.95,-.3),color:o.hair});break;
    case 'long':hairDome();hp.push({geo:FG.fringe,m:M(0,1.62,.6,-.4),color:o.hair},{geo:FG.longBack,m:M(0,.8,-.62),color:o.hair});break;
    case 'top':hairDome();hp.push({geo:FG.topBrim,m:M(0,1.72,0),color:o.hatCol},{geo:FG.topHat,m:M(0,2.5,0),color:o.hatCol},{geo:FG.band,m:MS(0,1.95,0,.78,1,.78),color:o.trim});break;
    case 'helmet':hp.push({geo:FG.helmet,m:MS(0,1.0,-.02,1,1,1),color:o.hatCol},{geo:FG.visor,m:M(0,1.25,.95,.25),color:'#22262C'},{geo:FG.band,m:MS(0,1.55,0,.6,.6,1.08,Math.PI/2,0,0),color:o.trim});break;
    case 'crown':hairDome();hp.push({geo:FG.crown,m:M(0,1.95,0),color:P.gold},{geo:FG.jewel,m:M(0,1.95,.83),color:P.red});for(let k=0;k<6;k++){const a=k/6*Math.PI*2;hp.push({geo:FG.spike,m:M(Math.sin(a)*.76,2.45,Math.cos(a)*.76),color:P.gold});}break;
    case 'bobble':hp.push({geo:FG.cap,m:MS(0,1.32,0,1.06,.78,1.02),color:o.hatCol},{geo:FG.roll,m:MS(0,1.38,0,1.08,1.08,1,Math.PI/2,0,0),color:o.trim},{geo:FG.pom,m:M(0,2.14,0),color:o.trim});break;
    case 'chef':hairDome();hp.push({geo:FG.chef,m:M(0,2.2,0),color:'#FFFFFF'},{geo:FG.puff,m:MS(0,3.0,0,1,.55,1),color:'#FFFFFF'});break;
    default:hairDome();
  }
  head.add(mesh(hp));
  fig.userData={hip,legs,arms,head,look:o};
  return fig;
}
function seat(fig){const u=fig.userData;u.legs.forEach(l=>l.rotation.x=-Math.PI/2);}
/* stop-motion walk: poses change on twos */
function walkPose(fig,t){const u=fig.userData,s=Math.sin(Math.floor(t*12)/12*9);u.legs[0].rotation.x=s*.5;u.legs[1].rotation.x=-s*.5;u.arms[0].rotation.x=-s*.4;u.arms[1].rotation.x=s*.4;}
function standPose(fig){const u=fig.userData;u.legs.forEach(l=>l.rotation.x=0);u.arms.forEach(a=>{a.rotation.x=0;a.rotation.z=0;});}

/* ---------- vehicles ---------- */
const WHEEL=(()=>{
  const k='#202227',h=P.lgrey,d=P.dgrey;
  const list=[{geo:new T.CylinderGeometry(1.05,1.05,.95,20),m:M(0,0,0,0,0,Math.PI/2),color:k},
    {geo:new T.TorusGeometry(1.0,.14,6,18),m:M(.32,0,0,0,Math.PI/2),color:k},{geo:new T.TorusGeometry(1.0,.14,6,18),m:M(-.32,0,0,0,Math.PI/2),color:k},
    {geo:new T.CylinderGeometry(.62,.62,1.0,16),m:M(0,0,0,0,0,Math.PI/2),color:h},
    {geo:new T.CylinderGeometry(.22,.22,1.08,10),m:M(0,0,0,0,0,Math.PI/2),color:d}];
  for(let s=0;s<5;s++){const a=s/5*Math.PI*2;list.push({geo:rbox(.12,.16,.16,.04),m:M(.52,Math.cos(a)*.4,Math.sin(a)*.4),color:d});}
  return mergeGeos(list);
})();
const wheelMat=new SMat({vertexColors:true,roughness:.55,envMapIntensity:.55});
const VEH={
  cab:{name:'Taxi',desc:'Take passengers anywhere in town',price:0,circles:[2.4,-2.4],r:2.35,maxF:30,acc:17,turn:2.1,cam:[21,13.5],paint:P.yellow,seat:[-.85,3.16,-.55],figScale:.82},
  scooter:{name:'Pizza scooter',desc:'Deliver hot pizzas to houses',price:150,circles:[.9,-.9],r:1.35,maxF:32,acc:22,turn:2.7,cam:[15,9.5],paint:P.red,seat:[0,2.35,-.45],figScale:.82},
  van:{name:'Ice cream van',desc:'Sell ice creams at parks and the beach',price:250,circles:[2.6,-2.6],r:2.45,maxF:26,acc:14,turn:1.9,cam:[23,15],paint:P.white,seat:[-.9,2.95,2.7],figScale:.82},
  bus:{name:'Double-decker bus',desc:'Drive the town bus route',price:400,circles:[-5.2,0,5.2],r:2.55,maxF:24,acc:12,turn:1.55,cam:[32,19],paint:P.red,seat:[-1.1,2.8,6.6],figScale:.78}
};
const PAINTS=[['Taxi yellow',P.yellow,0],['Fire red',P.red,0],['Snow white',P.white,0],['Ocean blue',P.blue,20],['Grass green',P.green,20],['Orange',P.orange,20],['Bubblegum',P.pink,30],['Purple',P.purple,30],['Midnight',P.black,30],['Mint',P.mint,30],['Sky',P.azure,30],['Gold',P.gold,150]];
const plateTex=labelTex('BR1 CAB','#F6F3E6','#1B1E24',256,64,'bold 38px "Rubik", Arial, sans-serif');
const plateMat=new SMat({map:plateTex,roughness:.3});

/* every vehicle is described as parts so it can become a live model or be baked into the town */
function vehicleParts(type,look){
  const c=Object.assign({paint:VEH[type].paint,trim:P.dgrey,taxi:type==='cab',roof:true},look||{});
  const B=c.paint,Tr=c.trim,K=P.black,LG=P.lgrey;
  const out={plain:[],clear:[],glass:[],head:[],tail:[],tex:[],wheels:[],sw:null};
  const add=(geo,m,color)=>out.plain.push({geo,m,color});
  const studRect=(x0,x1,z0,z1,y,col,skip)=>{for(let x=x0;x<=x1+1e-6;x++)for(let z=z0;z<=z1+1e-6;z++)if(!(skip&&skip(x,z)))add(studGeo,M(x,y,z),col);};
  if(type==='cab'){
    add(rbox(3.7,.55,9.4,.12),M(0,1.25,0),Tr);add(rbox(3.8,1.25,9.6,.14),M(0,2.1,0),B);
    add(rbox(3.8,.42,3.0,.1),M(0,2.93,3.25),B);add(rbox(3.8,.85,2.3,.12),M(0,3.14,-3.6),B);
    add(rbox(.42,.85,4.4,.1),M(1.69,3.14,-.25),B);add(rbox(.42,.85,4.4,.1),M(-1.69,3.14,-.25),B);
    [[2.3,3.2],[-2.3,3.2],[2.3,-3.2],[-2.3,-3.2]].forEach(([x,z])=>add(rbox(1.0,.32,2.5,.1),M(x,2.2,z),B));
    add(rbox(2.7,.62,.16,.05),M(0,2.05,4.82),Tr);add(rbox(3.9,.4,.5,.1),M(0,1.45,4.85),LG);add(rbox(3.9,.4,.5,.1),M(0,1.45,-4.85),LG);
    add(rbox(1.5,.42,1.5,.1),M(-.85,2.95,-.6),K);add(rbox(1.5,1.4,.4,.1),M(-.85,3.45,-1.45),K);
    add(rbox(1.5,.42,1.5,.1),M(.85,2.95,-.6),K);add(rbox(1.5,1.4,.4,.1),M(.85,3.45,-1.45),K);
    add(rbox(3.0,.42,1.3,.1),M(0,2.95,-2.35),K);add(rbox(3.0,1.5,.4,.1),M(0,3.5,-2.7),K);add(rbox(3.6,.5,.5,.1),M(0,3.0,1.55),Tr);
    if(c.roof){[[1.62,1.75],[-1.62,1.75],[1.62,-2.75],[-1.62,-2.75]].forEach(([x,z])=>add(new T.CylinderGeometry(.16,.16,2.9,8),M(x,4.95,z),B));add(rbox(3.8,.42,5.0,.12),M(0,6.55,-.5),B);}
    studRect(-1.5,1.5,2.25,4.25,3.14,B);studRect(-1.5,1.5,-4.5,-2.5,3.56,B);
    if(c.roof)studRect(-1.5,1.5,-2.5,1.5,6.76,B,(x,z)=>c.taxi&&Math.abs(x)<1.1&&z>-1.5&&z<.6);
    out.clear.push({geo:rbox(3.5,2.5,.18,.08),m:M(0,4.5,1.62,-.25)});if(c.roof)out.clear.push({geo:rbox(3.5,2.6,.18,.08),m:M(0,4.85,-2.95)});
    [-1.35,1.35].forEach(x=>out.head.push({geo:new T.CylinderGeometry(.36,.36,.2,14),m:M(x,2.45,4.86,Math.PI/2)}));
    [-1.4,1.4].forEach(x=>out.tail.push({geo:rbox(.7,.45,.16,.05),m:M(x,2.45,-4.86)}));
    out.tex.push({geo:new T.PlaneGeometry(1.7,.42),m:M(0,1.95,-4.83,0,Math.PI),mat:plateMat},{geo:new T.PlaneGeometry(1.7,.42),m:M(0,1.45,5.11),mat:plateMat});
    if(c.taxi){
      const cm=new SMat({map:checkerTex,roughness:.3,envMapIntensity:.6});
      [-1,1].forEach(s=>out.tex.push({geo:new T.PlaneGeometry(9.2,.5),m:M(s*1.915,2.3,0,0,s*Math.PI/2),mat:cm}));
      const tex=labelTex('TAXI','#FFF6C9','#1B1E24',256,96);
      const signMat=new SMat({map:tex,emissive:lin('#FFE48A').clone(),emissiveMap:tex,emissiveIntensity:.55,roughness:.2});
      const sm=plastic('#FFF6C9');
      out.tex.push({geo:new T.BoxGeometry(2.2,.85,.85),m:M(0,7.2,-.5),mat:[sm,sm,sm,sm,signMat,signMat]});
    }
    out.sw=M(-.85,3.75,1.15,-.9);
    [[2.3,3.2],[-2.3,3.2],[2.3,-3.2],[-2.3,-3.2]].forEach(([x,z])=>out.wheels.push({x,y:1.05,z,s:1,front:z>0}));
  }
  else if(type==='bus'){
    add(rbox(4.2,.6,16.4,.12),M(0,1.3,0),Tr);
    add(rbox(4.4,4.8,13.9,.18),M(0,4.0,-1.35),B);
    add(rbox(4.4,1.8,2.7,.15),M(0,2.5,6.95),B);
    [[2.05,8.15],[-2.05,8.15],[2.05,5.75],[-2.05,5.75]].forEach(([x,z])=>add(rbox(.3,2.9,.3,.06),M(x,4.85,z),B));
    add(rbox(4.45,.5,16.65,.1),M(0,6.6,0),P.cream);
    add(rbox(4.4,2.8,16.2,.18),M(0,8.2,0),B);add(rbox(4.3,.4,15.8,.14),M(0,9.8,0),B);
    add(rbox(3.6,.5,.5,.1),M(0,3.6,7.6),Tr);add(rbox(1.5,.42,1.5,.1),M(-1.1,2.6,6.6),K);add(rbox(1.5,1.6,.4,.1),M(-1.1,3.3,5.85),K);
    add(rbox(4.5,.4,.5,.1),M(0,1.5,8.35),LG);add(rbox(4.5,.4,.5,.1),M(0,1.5,-8.35),LG);
    [[2.3,5.4],[-2.3,5.4],[2.3,-5],[-2.3,-5]].forEach(([x,z])=>add(rbox(1.0,.4,2.9,.1),M(x,2.65,z),B));
    studRect(-1.5,1.5,-7.5,7.5,10.0,B);
    [-1,1].forEach(s=>{out.glass.push({geo:new T.PlaneGeometry(13,1.8),m:M(s*2.21,4.5,-1.6,0,s*Math.PI/2)},{geo:new T.PlaneGeometry(15,1.3),m:M(s*2.21,8.2,0,0,s*Math.PI/2)});});
    out.glass.push({geo:new T.PlaneGeometry(3.8,1.3),m:M(0,8.2,8.11)},{geo:new T.PlaneGeometry(3.6,1.8),m:M(0,4.5,-8.31,0,Math.PI)});
    out.clear.push({geo:rbox(3.9,2.7,.12,.05),m:M(0,4.85,8.25)});[-1,1].forEach(s=>out.clear.push({geo:rbox(.1,2.7,2.2,.05),m:M(s*2.18,4.85,6.95)}));
    [-1.5,1.5].forEach(x=>out.head.push({geo:new T.CylinderGeometry(.4,.4,.2,14),m:M(x,2.4,8.36,Math.PI/2)}));
    [-1.6,1.6].forEach(x=>out.tail.push({geo:rbox(.7,.6,.16,.05),m:M(x,2.5,-8.36)}));
    const dst=labelTex('CIRCULAR','#22262C','#FFC93C',256,64);
    out.tex.push({geo:new T.PlaneGeometry(3.4,.85),m:M(0,7.15,8.34),mat:new SMat({map:dst,emissive:new T.Color(1,1,1),emissiveMap:dst,emissiveIntensity:.4,roughness:.3})});
    out.sw=M(-1.1,3.4,7.3,-1.1);
    [[2.3,5.4],[-2.3,5.4],[2.3,-5],[-2.3,-5]].forEach(([x,z])=>out.wheels.push({x,y:1.2,z,s:1.15,front:z>0}));
  }
  else if(type==='van'){
    add(rbox(4,.55,10,.12),M(0,1.25,0),Tr);
    add(rbox(4.2,5,6.4,.2),M(0,4.1,-1.7),B);
    add(rbox(4.2,1.6,3.6,.15),M(0,2.4,3.2),B);add(rbox(4.2,.5,1.6,.1),M(0,3.4,4.2),B);
    [[1.95,4.85],[-1.95,4.85]].forEach(([x,z])=>add(rbox(.3,3.2,.3,.06),M(x,4.8,z),B));
    add(rbox(4.2,.45,3.6,.12),M(0,6.6,3.0),B);
    add(rbox(4.26,.6,10.1,.08),M(0,2.2,0),P.pink);add(rbox(4.26,.5,6.5,.08),M(0,5.8,-1.7),P.mint);
    add(rbox(.12,1.9,3.6,.05),M(2.12,4.3,-1.7),'#3A2E3A');add(rbox(.8,.2,3.8,.05),M(2.45,3.3,-1.7),P.white);
    add(rbox(4.3,.4,.5,.1),M(0,1.45,4.95),LG);add(rbox(4.3,.4,.5,.1),M(0,1.45,-4.95),LG);
    add(rbox(1.5,.42,1.5,.1),M(-.9,2.75,2.75),K);add(rbox(1.5,1.6,.4,.1),M(-.9,3.4,1.95),K);add(rbox(3.6,.5,.5,.1),M(0,3.65,4.4),Tr);
    add(new T.ConeGeometry(.95,2.8,14),M(0,7.9,-1.7,Math.PI),P.tan);add(new T.SphereGeometry(1.15,16,12),M(0,9.6,-1.7),P.pink);add(new T.SphereGeometry(.32,10,8),M(0,10.8,-1.7),P.red);
    studRect(-1.5,1.5,-4.5,-3.5,6.6,B);studRect(-1.5,1.5,.5,1.5,6.6,B);
    const aw=canvasTex(128,32,(g2,W,H)=>{for(let i=0;i<8;i++){g2.fillStyle=i%2?'#FFFDF6':'#E87AA4';g2.fillRect(i*16,0,16,H);}});
    const am=plastic('#E87AA4');
    out.tex.push({geo:new T.BoxGeometry(1.6,.15,4),m:M(2.9,5.6,-1.7,0,0,-.3),mat:[am,am,new SMat({map:aw,roughness:.4}),am,am,am]});
    const st=labelTex('ICE CREAM','#E87AA4','#FFFDF6',512,96);
    out.tex.push({geo:new T.PlaneGeometry(3.8,.75),m:M(0,6.6,4.81),mat:new SMat({map:st,roughness:.3})});
    out.clear.push({geo:rbox(3.6,2.8,.12,.05),m:M(0,4.8,4.9,-.12)});
    [-1.4,1.4].forEach(x=>out.head.push({geo:new T.CylinderGeometry(.34,.34,.2,14),m:M(x,2.55,5.01,Math.PI/2)}));
    [-1.5,1.5].forEach(x=>out.tail.push({geo:rbox(.7,.5,.16,.05),m:M(x,2.4,-4.95)}));
    out.sw=M(-.9,3.55,4.0,-.9);
    [[2.1,3.2],[-2.1,3.2],[2.1,-3.4],[-2.1,-3.4]].forEach(([x,z])=>out.wheels.push({x,y:1.0,z,s:.96,front:z>0}));
  }
  else if(type==='scooter'){
    add(rbox(1.2,.3,2.6,.1),M(0,.95,0),K);add(rbox(1.5,1.2,2,.4),M(0,1.55,-.75),B);add(rbox(1.15,.45,1.7,.18),M(0,2.35,-.6),K);
    add(rbox(1.4,1.9,.4,.15),M(0,1.85,1.3,-.15),B);add(rbox(1.2,.6,1.2,.25),M(0,1.0,1.75),B);
    add(new T.CylinderGeometry(.12,.12,1.6,8),M(0,2.7,1.5,-.25),LG);add(rbox(2.1,.18,.18,.06),M(0,3.45,1.75),K);
    add(rbox(1.9,.15,1.9,.05),M(0,2.25,-1.55),LG);add(rbox(1.8,1.2,1.8,.1),M(0,2.95,-1.55),P.red);add(rbox(1.84,.12,1.84,.04),M(0,3.5,-1.55),P.white);
    out.head.push({geo:new T.SphereGeometry(.28,10,8),m:M(0,2.65,1.75)});out.tail.push({geo:rbox(.5,.25,.12,.04),m:M(0,1.7,-1.78)});
    const pt=labelTex('PIZZA','#C91A09','#FFFDF6',256,96);
    out.tex.push({geo:new T.PlaneGeometry(1.7,.7),m:M(0,2.95,-2.46,0,Math.PI),mat:new SMat({map:pt,roughness:.35})});
    [[0,1.7],[0,-1.7]].forEach(([x,z])=>out.wheels.push({x,y:.72,z,s:.69,w:.5,front:z>0}));
  }
  return out;
}
const VPOOL={};
function vehicleClone(m){const mm=m.clone();mm.emissive=m.emissive.clone();return mm;}
/* live vehicle */
function buildVehicle(type,look,driverLook){
  const spec=VEH[type],parts=vehicleParts(type,look);
  const g=new T.Group(),body=new T.Group();g.add(body);g.rotation.order='YXZ';
  const bodyMat=vcolMat.clone();
  const shell=new T.Mesh(mergeGeos(parts.plain),bodyMat);shell.castShadow=true;shell.receiveShadow=true;body.add(shell);
  if(parts.clear.length){const c=new T.Mesh(mergeGeos(parts.clear),transClear);c.renderOrder=2;body.add(c);}
  if(parts.glass.length)body.add(new T.Mesh(mergeGeos(parts.glass),glassMat));
  const headMat=new SMat({color:lin('#FFF8E0').clone(),emissive:lin('#FFF1C0').clone(),emissiveIntensity:.5,roughness:.05,envMapIntensity:1.4});
  const tailMat=new SMat({color:lin('#D01C1C').clone(),emissive:lin('#A01010').clone(),emissiveIntensity:.35,roughness:.08,envMapIntensity:1.2});
  body.add(new T.Mesh(mergeGeos(parts.head),headMat));body.add(new T.Mesh(mergeGeos(parts.tail),tailMat));
  parts.tex.forEach(t=>{const m=new T.Mesh(t.geo,t.mat);m.position.setFromMatrixPosition(t.m);m.quaternion.setFromRotationMatrix(t.m);m.castShadow=true;body.add(m);});
  let sw=null;
  if(parts.sw){sw=new T.Mesh(mergeGeos([{geo:new T.TorusGeometry(.5,.09,8,18)},{geo:rbox(.9,.12,.12,.04)}]),plastic(P.black));sw.position.setFromMatrixPosition(parts.sw);sw.quaternion.setFromRotationMatrix(parts.sw);body.add(sw);}
  const wheels=parts.wheels.map(w=>{
    const steerG=new T.Group();steerG.position.set(w.x,w.y,w.z);g.add(steerG);
    const spin=new T.Mesh(WHEEL,wheelMat);spin.castShadow=true;spin.scale.set((w.w?w.w/.95:1)*w.s*(w.x<0?-1:1),w.s,w.s);steerG.add(spin);
    return{steerG,spin,front:w.front,r:1.05*w.s};
  });
  /* driver */
  const drv=makeFigure(driverLook);seat(drv);drv.scale.setScalar(spec.figScale);
  drv.position.set(spec.seat[0],spec.seat[1]-1.7*spec.figScale,spec.seat[2]);
  drv.userData.arms.forEach(a=>{a.rotation.x=type==='scooter'?-1.3:-1.05;});
  if(type==='scooter')drv.userData.legs.forEach(l=>l.rotation.x=-1.25);
  body.add(drv);
  /* night headlight beams */
  const beamMat=new T.MeshBasicMaterial({map:glowTex,color:new T.Color('#FFE9B0'),transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false});
  const front=Math.max(...parts.head.map(h=>new T.Vector3().setFromMatrixPosition(h.m).z));
  const beam=new T.Mesh(new T.PlaneGeometry(type==='scooter'?6:10,16),beamMat);beam.rotation.x=-Math.PI/2;beam.position.set(0,.3,front+8);g.add(beam);
  return{type,spec,group:g,body,wheels,sw,headMat,tailMat,bodyMat,driver:drv,beamMat,parts};
}
/* bake a parked vehicle into the town chunks */
function putVehicle(type,look,x,y,z,ry){
  const parts=vehicleParts(type,look),base=M(x,y,z,0,ry,0);
  const tm=m=>new T.Matrix4().multiplyMatrices(base,m);
  parts.plain.forEach(p=>{if(LOW&&p.geo===studGeo)return;put('plain',p.geo,tm(p.m),p.color);});
  parts.head.forEach(p=>put('plain',p.geo,tm(p.m),'#FFF8E0'));
  parts.tail.forEach(p=>put('plain',p.geo,tm(p.m),'#D01C1C'));
  parts.clear.forEach(p=>put('glass',p.geo,tm(p.m)));
  parts.wheels.forEach(w=>put('plain',WHEEL,tm(MS(w.x,w.y,w.z,w.s*(w.x<0?-1:1),w.s,w.s)),null,true));
}

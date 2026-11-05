/* =====================================================================
   WORLD: static town built into per-block chunks so far blocks are culled
   ===================================================================== */
const CH=112,CHO=448;
const chunks=new Map();
const roadMat=new SMat({vertexColors:true,roughness:.6,envMapIntensity:.45});
const paveMat=new SMat({map:tileTex,roughness:.5,envMapIntensity:.5});
const grassMat=new SMat({map:grassTex,roughness:.45,envMapIntensity:.5});
const plazaMat=new SMat({map:plazaTex,roughness:.45,envMapIntensity:.5});
const dirtMat=new SMat({map:dirtTex,roughness:.6,envMapIntensity:.4});
const sandMat=new SMat({map:sandTex,roughness:.55,envMapIntensity:.4});
const deckMat=new SMat({map:deckTex,roughness:.6,envMapIntensity:.4});
const KMAT={plain:vcolMat,brick:brickVMat,glass:glowMat,glow:glowMat,sign:null,pool:poolMat,road:roadMat,pave:paveMat,grass:grassMat,plaza:plazaMat,dirt:dirtMat,sand:sandMat,deck:deckMat};
function put(kind,geo,m,color,cast){
  const e=m.elements;const key=Math.floor((e[12]+CHO)/CH)+':'+Math.floor((e[14]+CHO)/CH);
  let c=chunks.get(key);if(!c){c={};chunks.set(key,c);}
  if(kind==='glass')kind='glow';
  if(LOW&&kind==='road')kind='plain';
  (c[kind]||(c[kind]=[])).push({geo,m,color});
}
const poolMeshes=[];
function finalizeChunks(){
  KMAT.sign=signMat;atlasTex.needsUpdate=true;
  chunks.forEach(c=>{for(const kind in c){
    const mesh=new T.Mesh(mergeGeos(c[kind]),KMAT[kind]);
    mesh.castShadow=kind==='plain'||kind==='brick';mesh.receiveShadow=kind!=='pool'&&kind!=='sign';
    if(kind==='pool'){mesh.renderOrder=1;poolMeshes.push(mesh);}
    mesh.matrixAutoUpdate=false;mesh.updateMatrix();
    scene.add(mesh);
  }});
  chunks.clear();
}
/* stand-alone textured meshes (signs etc.) */
function addMesh(geo,mat,x,y,z,ry,cast){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry||0;m.castShadow=!!cast;m.receiveShadow=true;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);return m;}

/* ---------- colliders in a spatial hash ---------- */
const CG=16,colGrid=new Map();let colStamp=0;
function reg(c,x0,z0,x1,z1){for(let i=Math.floor(x0/CG);i<=Math.floor(x1/CG);i++)for(let j=Math.floor(z0/CG);j<=Math.floor(z1/CG);j++){const k=i*10007+j;let a=colGrid.get(k);if(!a)colGrid.set(k,a=[]);a.push(c);}return c;}
function addBox(x0,z0,x1,z1,col,h){return reg({t:'box',x0,z0,x1,z1,col:col||P.lgrey,h:h||0,s:0},x0,z0,x1,z1);}
function addCirc(x,z,r,col,ref,h){return reg({t:'circ',x,z,r,col:col||P.lgrey,ref,h:h||0,s:0},x-r,z-r,x+r,z+r);}
const _near=[];
function nearCols(x,z,r){colStamp++;_near.length=0;for(let i=Math.floor((x-r)/CG);i<=Math.floor((x+r)/CG);i++)for(let j=Math.floor((z-r)/CG);j<=Math.floor((z+r)/CG);j++){const a=colGrid.get(i*10007+j);if(a)for(const c of a)if(c.s!==colStamp){c.s=colStamp;_near.push(c);}}return _near;}
function blocked(x,z,r){for(const c of nearCols(x,z,r)){if(c.t==='box'){if(x>c.x0-r&&x<c.x1+r&&z>c.z0-r&&z<c.z1+r)return true;}else if(Math.hypot(x-c.x,z-c.z)<r+c.r)return true;}return false;}

/* ---------- ground heights: raised areas and ramps ---------- */
const rects=[],ramps=[];
function groundAt(x,z){
  let h=.14;
  for(const r of rects)if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1&&r.h>h)h=r.h;
  for(const r of ramps){const dx=x-r.x,dz=z-r.z,s=Math.sin(r.ang),c=Math.cos(r.ang);const u=dx*s+dz*c+r.len/2,v=dx*c-dz*s;if(u>0&&u<r.len&&Math.abs(v)<r.w/2){const y=r.base+r.h*u/r.len;if(y>h)h=y;}}
  return h;
}

/* ---------- layout ---------- */
const NB=6,L=56,RW=14,PV=4,HALF=NB*L/2;
const roadC=k=>k*L-HALF;
const blockMin=i=>roadC(i)+RW/2;
const BS=L-RW,LOT=BS-PV*2;
const LAYOUT=['HHPHHH','HSSCSH','PSQSWH','HSSSCH','HCSLSH','HHPHHP'];
const ZN=['Acorn Road','Daisy Lane','Pudding Street','High Street','Teapot Lane','Marble Road','Seaside Road'];
const XN=['Stunt Lane','Brick Lane','Market Street','Clock Street','Rainbow Road','Station Road','Harbour Way'];
const BOUND={x0:-262,x1:204,z0:-262,z1:205};

/* registries used by jobs and town life */
const places=[],bays=[],busStops=[],iceSpots=[],crossings=[],puddles=[],goldSpots=[],walkPaths=[],lamps=[];
let pizzaPlace=null,washZone=null;
const houseNums={};
const title=s=>s.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(' & ',' & ');
function addPlace(o){places.push(o);return o;}
/* a stop spot on the road in front of a face, plus a pavement point to wait on */
function frontSpots(fx,fz,nx,nz){return{x:fx+nx*(PV+3.6),z:fz+nz*(PV+3.6),px:fx+nx*2.2,pz:fz+nz*2.2,face:Math.atan2(nx,nz)};}
function edgeSpot(i,j,side,t){
  const x0=blockMin(i),z0=blockMin(j);
  if(side==='n')return{x:x0+BS*t,z:z0-3.6,px:x0+BS*t,pz:z0+2,face:Math.PI};
  if(side==='s')return{x:x0+BS*t,z:z0+BS+3.6,px:x0+BS*t,pz:z0+BS-2,face:0};
  if(side==='w')return{x:x0-3.6,z:z0+BS*t,px:x0+2,pz:z0+BS*t,face:-Math.PI/2};
  return{x:x0+BS+3.6,z:z0+BS*t,px:x0+BS-2,pz:z0+BS*t,face:Math.PI/2};
}

/* ---------- small shared props ---------- */
function studsOn(x0,z0,w,d,y,col,every){if(LOW)return;for(let a=0;a<w;a++)for(let b=0;b<d;b++){if(every&&!(a===0||b===0||a===w-1||b===d-1||((a+b)%every===0)))continue;put('plain',studGeo,M(x0+a+.5,y,z0+b+.5),col);}}
function tree(x,z,y,s,col){
  y=y||0;s=s||1;const ry=rnd()*3;
  put('plain',new T.CylinderGeometry(.75,.75,2.4,10),MS(x,y+1.2*s,z,s,s,s),P.brown);
  col=col||pick(['#2C9A47','#3FAE4F','#228B3E','#9BC53D']);
  [[3.4,3.0],[2.6,4.2],[1.7,5.4],[.9,6.6]].forEach(([r,h])=>put('plain',new T.CylinderGeometry(r,r,1.2,LOW?10:14),MS(x,y+h*s,z,s,s,s,0,ry,0),col,true));
}
const lampParts=[{geo:new T.CylinderGeometry(.3,.38,7,8),m:M(0,3.5,0),color:P.dgrey},{geo:rbox(2.6,.35,.6,.08),m:M(.9,7.05,0),color:P.dgrey},{geo:new T.CylinderGeometry(.6,.6,.3,10),m:M(0,.15,0),color:P.dgrey}];
const lampGeo=mergeGeos(lampParts);
function lamp(x,z,y,dx,dz){
  const a=Math.atan2(-dz,dx);
  put('plain',lampGeo,M(x,y,z,0,a,0),null);
  const hx=x+Math.cos(a)*1.8,hz=z-Math.sin(a)*1.8;
  put('glow',rbox(1.1,.25,.8,.06),M(hx,y+6.75,hz,0,a,0),'#FFF4C2');
  put('pool',new T.PlaneGeometry(13,13),M(hx,.36,hz,-Math.PI/2));
  addCirc(x,z,.7,P.dgrey);lamps.push({x:hx,z:hz});
}
function windowAt(x,y,z,ry){put('plain',rbox(2.3,2.5,.3,.07),M(x,y,z,0,ry,0),P.white);const o=.17;put('glass',GLASS_PLANE,M(x+Math.sin(ry)*o,y,z+Math.cos(ry)*o,0,ry,0),'#3E78B8');}
const GLASS_PLANE=new T.PlaneGeometry(1.8,2.0);
function doorAt(x,y,z,ry,col){put('plain',rbox(2.2,3.4,.3,.07),M(x,y,z,0,ry,0),col);put('plain',new T.SphereGeometry(.16,8,6),M(x+Math.cos(ry)*.7+Math.sin(ry)*.18,y,z-Math.sin(ry)*.7+Math.cos(ry)*.18),P.gold);}
function bench(x,y,z,ry){addCirc(x,z,1.6,P.brown,null,1.5);put('plain',rbox(4,.4,1.2,.08),M(x,y+1.1,z,0,ry,0),P.brown,true);put('plain',rbox(4,1,.3,.08),M(x-Math.sin(ry)*.5,y+1.7,z-Math.cos(ry)*.5,0,ry,0),P.brown,true);[-1.6,1.6].forEach(o=>put('plain',rbox(.4,1,.9,.05),M(x+Math.cos(ry)*o,y+.5,z-Math.sin(ry)*o,0,ry,0),P.dgrey));}
function flowerBed(x0,z0,w,d,y){for(let k=0;k<w*d*.45;k++){const fx=x0+Math.floor(rnd()*w)+.5,fz=z0+Math.floor(rnd()*d)+.5,c=pick([P.red,P.yellow,P.white,P.pink,P.orange,P.lilac]);put('plain',new T.CylinderGeometry(.12,.12,.8,5),M(fx,y+.4,fz),'#2E8B4A');put('plain',new T.CylinderGeometry(.42,.42,.3,8),M(fx,y+.85,fz),c);}}
/* every sign's lettering lives in one shared texture so signs merge into the chunks */
const ATLAS=document.createElement('canvas');ATLAS.width=2048;ATLAS.height=2048;const actx=ATLAS.getContext('2d');let atlasN=0;
const atlasTex=new T.CanvasTexture(ATLAS);atlasTex.encoding=T.sRGBEncoding;atlasTex.anisotropy=maxAniso;
const signMat=new SMat({map:atlasTex,roughness:.35,envMapIntensity:.6,emissive:new T.Color(1,1,1),emissiveMap:atlasTex,emissiveIntensity:.05});
const nightSigns=[signMat];
function atlasSlot(text,bg,fg,aspect){
  const col=atlasN%4,row=Math.floor(atlasN/4);atlasN++;
  const cw=Math.min(512,Math.round(128*aspect)),x=col*512,y=row*128;
  actx.fillStyle=bg;actx.fillRect(x,y,cw,128);actx.fillStyle=fg;
  let size=80;const font=n=>`${n}px "Lilita One", "Arial Black", sans-serif`;actx.font=font(size);
  while(actx.measureText(text).width>cw*.88&&size>16){size-=4;actx.font=font(size);}
  actx.textAlign='center';actx.textBaseline='middle';actx.fillText(text,x+cw/2,y+68);
  return[x/2048,1-(y+128)/2048,(x+cw)/2048,1-y/2048];
}
function signMesh(text,bg,fg,w,h,x,y,z,ry){
  put('plain',rbox(w,h,.3,.05),M(x,y,z,0,ry,0),bg);
  const [u0,v0,u1,v1]=atlasSlot(text,bg,fg,w/h);
  const g=new T.PlaneGeometry(w*.98,h*.96);const uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)?u1:u0,uv.getY(i)?v1:v0);
  put('sign',g,M(x+Math.sin(ry)*.16,y,z+Math.cos(ry)*.16,0,ry,0));
}

/* ---------- roads ---------- */
function buildRoads(){
  const span0=roadC(0)-RW/2,span1=roadC(NB)+RW/2;
  for(let k=0;k<=NB;k++)for(let s=0;s<NB;s++){
    const a=roadC(s)+RW/2,b=roadC(s+1)-RW/2,mid=(a+b)/2,len=b-a;
    put('road',box(len,.2,RW),M(mid,.04,roadC(k)),'#4A4E55');
    put('road',box(RW,.2,len),M(roadC(k),.04,mid),'#4A4E55');
    for(let t=a+5;t<b-4;t+=6){put('road',box(3,.06,.45),M(t+1.5,.17,roadC(k)),P.white);put('road',box(.45,.06,3),M(roadC(k),.17,t+1.5),P.white);}
  }
  for(let i=0;i<=NB;i++)for(let j=0;j<=NB;j++){
    const x=roadC(i),z=roadC(j);
    put('road',box(RW,.2,RW),M(x,.04,z),'#4A4E55');
    [[j>0,-1],[j<NB,1]].forEach(([ok,sz])=>{if(!ok)return;const cz=z+sz*(RW/2+2.4);
      for(let s=-3;s<=3;s++)put('road',box(1.1,.06,3.4),M(x+s*1.9,.17,cz),P.white);
      crossings.push({x,z:cz,dir:sz,walker:null,cool:0});});
  }
}

/* ---------- pavements + corner lamps ---------- */
function pavement(i,j){
  const x0=blockMin(i),z0=blockMin(j),cx=x0+BS/2,cz=z0+BS/2;
  put('pave',worldUV(rbox(BS,.3,BS,.06),8,8),M(cx,.15,cz));
  put('plain',rbox(BS+.2,.32,BS+.2,.1),M(cx,.12,cz),'#8E959C');
  rects.push({x0,z0,x1:x0+BS,z1:z0+BS,h:.3});
  [[x0+1.2,z0+1.2],[x0+BS-1.2,z0+1.2],[x0+1.2,z0+BS-1.2],[x0+BS-1.2,z0+BS-1.2]].forEach(([x,z])=>lamp(x,z,.3,x-cx,z-cz));
}

/* ---------- shop buildings ---------- */
const SHOPS=[['PIZZA','#C91A09','#FFFDF6'],['BAKERY','#F3E7C5','#8A4B1F'],['CAFE','#2E8B4A','#FFFDF6'],['BOOKS','#203A72','#F2C230'],['FLOWERS','#E87AA4','#FFFDF6'],['TOYS','#F2C230','#C91A09'],['FISH & CHIPS','#0A5BC4','#FFFDF6'],['BANK','#5F6266','#F3E7C5'],['POST OFFICE','#C91A09','#F2C230'],['HOTEL','#22262C','#F2C230'],['GROCER','#A5CA18','#22262C'],['LIBRARY','#6B3B1F','#F3E7C5'],['PET SHOP','#36AEBF','#FFFDF6'],['SWEETS','#E87AA4','#22262C'],['BIKES','#F57F1F','#22262C'],['MUSIC','#7A4FA8','#FFFDF6'],['SHOES','#1A8F8A','#FFFDF6'],['BARBER','#F4F4F2','#C91A09'],['ICE RINK','#9FE0C3','#203A72'],['PHARMACY','#2E8B4A','#FFFDF6'],['MUSEUM','#F3E7C5','#203A72'],['BURGERS','#F57F1F','#FFFDF6'],['GAMES','#22262C','#9FE0C3'],['FARM SHOP','#6B3B1F','#F2C230'],['DENTIST','#F4F4F2','#0A5BC4'],['NOODLES','#C91A09','#F2C230']];
let shopIdx=0;
const SHOP_LABEL={'PIZZA':'the Pizza Shop','BOOKS':'the Bookshop','FLOWERS':'the Flower Shop','TOYS':'the Toy Shop','FISH & CHIPS':'the Chip Shop','SWEETS':'the Sweet Shop','BIKES':'the Bike Shop','MUSIC':'the Music Shop','SHOES':'the Shoe Shop','BURGERS':'the Burger Bar','GAMES':'the Games Shop','NOODLES':'the Noodle Bar'};
function addBuilding(x0,z0,w,d,floors,outFaces,forceSign){
  const col=pick(BUILD_COLS),H=floors*3.6;
  put('brick',worldUV(rbox(w,H,d,.1),8,2.4),M(x0+w/2,.3+H/2,z0+d/2),col);
  addBox(x0,z0,x0+w,z0+d,col,H+.3);
  const roofCol=rnd()<.5?P.dgrey:rnd()<.5?col:P.lgrey;
  put('plain',rbox(w+.4,.45,d+.4,.08),M(x0+w/2,.3+H+.22,z0+d/2),roofCol);
  if(!LOW)studsOn(x0,z0,w,d,.3+H+.45,roofCol,3);
  if(rnd()<.6){const ux=x0+w/2+(rnd()-.5)*(w-5),uz=z0+d/2+(rnd()-.5)*(d-5);put('plain',rbox(3,1.6,2.4,.1),M(ux,.3+H+1.25,uz),P.lgrey,true);put('plain',new T.CylinderGeometry(.8,.8,.15,12),M(ux,.3+H+2.1,uz),P.dgrey);}
  const sign=forceSign||(shopIdx<SHOPS.length&&rnd()<.8?SHOPS[shopIdx++]:null);
  outFaces.forEach(([nx,nz],fi)=>{
    const len=nx===0?w:d,cnt=Math.max(1,Math.floor((len-2)/4.5)),step=len/cnt;
    const ry=Math.atan2(nx,nz);
    const fx=x0+w/2+nx*(w/2),fz=z0+d/2+nz*(d/2);
    for(let f=0;f<floors;f++)for(let k=0;k<cnt;k++){
      const t=-len/2+step*(k+.5);
      const wx=fx+(nx!==0?0:t),wz=fz+(nz!==0?0:t);
      const y=.3+f*3.6+1.95;
      if(f===0&&k===Math.floor(cnt/2)){doorAt(wx+nx*.05,.3+1.75,wz+nz*.05,ry,pick([P.brown,P.navy,P.red,P.green]));continue;}
      windowAt(wx+nx*.06,y,wz+nz*.06,ry);
    }
    const s=fi===0?sign:null;
    if(s){
      const sw=Math.min(len-2,s[0].length>7?11:7.5);
      const sx=fx+nx*.2,sz=fz+nz*.2;
      signMesh(s[0],s[1],s[2],sw,1.4,sx,.3+3.95,sz,ry);
      /* striped awning as plain bricks */
      const n=8,stw=sw/n,ax=sx+nx*1.05,az=sz+nz*1.05,tx=Math.cos(ry),tz=-Math.sin(ry);
      for(let k=0;k<n;k++){const o=-sw/2+stw*(k+.5);const m=new T.Matrix4().makeRotationY(ry).multiply(new T.Matrix4().makeRotationX(.32));m.setPosition(ax+tx*o,.3+3.05,az+tz*o);put('plain',box(stw,.18,2.2),m,k%2?'#FFFDF6':s[1]);}
      const p=addPlace(Object.assign({name:s[0],label:SHOP_LABEL[s[0]]||'the '+title(s[0]),kind:'shop'},frontSpots(fx,fz,nx,nz)));
      if(s[0]==='PIZZA')pizzaPlace=p;
    }
  });
}
function buildShops(i,j){
  const lx=blockMin(i)+PV,lz=blockMin(j)+PV;
  const centre=(i>=2&&i<=3)&&(j>=2&&j<=3);
  [[lz,16,[0,-1]],[lz+18,16,[0,1]]].forEach(([rz,rd,rf])=>{
    const pattern=pick([[34],[16,16],[10,22],[22,10],[10,10,10]]);
    let x=lx;
    pattern.forEach((pw,idx)=>{
      const out=[rf];if(idx===0)out.push([-1,0]);if(idx===pattern.length-1)out.push([1,0]);
      addBuilding(x,rz,pw,rd,centre?2+Math.floor(rnd()*3):1+Math.floor(rnd()*3),out);
      x+=pw+2;
    });
  });
  const x0=blockMin(i),z0=blockMin(j);
  walkPaths.push({ax:x0+2.2,az:z0+2.2,bx:x0+BS-2.2,bz:z0+2.2},{ax:x0+2.2,az:z0+BS-2.2,bx:x0+BS-2.2,bz:z0+BS-2.2});
}

/* ---------- houses ---------- */
const WALLS=['#F3E7C5','#E4CD9E','#F4F4F2','#EBA9A0','#A8C8E8','#C8E0A8','#F2D488','#D9B8E8'];
const ROOFS=['#B5452E','#5F6266','#2E5E8C','#3C6E47','#8A4B1F'];
function buildHouses(i,j){
  const lx=blockMin(i)+PV,lz=blockMin(j)+PV;
  addBox(lx,lz,lx+LOT,lz+LOT,'#3C9A4D',3);
  put('grass',worldUV(rbox(LOT,.35,LOT,.08),8,8),M(lx+LOT/2,.47,lz+LOT/2));
  [[-1,j,lz,lz+4],[1,j+1,lz+LOT,lz+LOT-4]].forEach(([dir,road,edge,front])=>{
    const street=ZN[road];
    for(let k=0;k<3;k++){
      const hx=lx+5.67+k*11.33,w=8,d=8,H=4.4;
      const hz=front-dir*d/2,ry=dir<0?Math.PI:0;
      const wall=pick(WALLS),roof=pick(ROOFS);
      put('brick',worldUV(rbox(w,H,d,.1),8,2.4),M(hx,.6+H/2,hz),wall);
      put('plain',prismGeo,MS(hx,.6+H,hz,w+1,3.2,d+1.2),roof);
      put('plain',rbox(1.2,2.4,1.2,.08),M(hx+2.4,.6+H+2.2,hz+1),P.dgrey);
      doorAt(hx,.6+1.75,front+dir*.05,ry,pick([P.red,P.navy,P.green,P.yellow,P.brown]));
      windowAt(hx-2.5,.6+2.1,front+dir*.06,ry);windowAt(hx+2.5,.6+2.1,front+dir*.06,ry);
      put('plain',rbox(2,.1,4,.03),M(hx,.68,(edge+front)/2),P.tan);
      for(let f=-5;f<5;f++){if(f===-1||f===0)continue;put('plain',rbox(1,.8,.6,.06),M(hx+f+.5,1,edge-dir*.4),P.white);if(!LOW)put('plain',studGeo,M(hx+f+.5,1.4,edge-dir*.4),P.white);}
      if(!LOW)flowerBed(hx-4.5,Math.min(edge,front)+.6,3,2.6,.6);
      if(rnd()<.6)tree(hx+(rnd()-.5)*5,lz+LOT/2+(rnd()-.5)*4,.6,.7+rnd()*.25);
      houseNums[street]=(houseNums[street]||0)+1;
      const n=houseNums[street]*2-(dir<0?1:0);
      addPlace(Object.assign({name:'No. '+n+' '+street,label:'No. '+n+' '+street,kind:'house'},frontSpots(hx,edge,0,dir)));
    }
  });
}

/* ---------- parks ---------- */
const PARKS=['Duck Pond Park','Conker Park','Bluebell Park','Rainbow Park'];let parkIdx=0;
function buildPark(i,j){
  const lx=blockMin(i)+PV,lz=blockMin(j)+PV,cx=lx+LOT/2,cz=lz+LOT/2;
  put('grass',worldUV(rbox(LOT,.4,LOT,.1),8,8),M(cx,.5,cz));
  addBox(lx-.8,lz-.8,lx+LOT+.8,lz+LOT+.8,'#2E8B4A',2.5);
  [[cx,lz-.4,LOT+1.6,1.2],[cx,lz+LOT+.4,LOT+1.6,1.2],[lx-.4,cz,1.2,LOT],[lx+LOT+.4,cz,1.2,LOT]].forEach(([x,z,w,d])=>put('plain',rbox(w,2,d,.15),M(x,1.3,z),'#256F37',true));
  const px=lx+8+rnd()*10,pz=lz+8+rnd()*10;
  addMesh(rbox(12,.3,9,.2),new SMat({color:lin('#2C8FD0').clone(),roughness:.05,metalness:.1,envMapIntensity:1.5}),px+6,.72,pz+4.5);
  put('plain',rbox(13.4,.5,10.4,.2),M(px+6,.65,pz+4.5),P.tan);
  put('plain',rbox(3,.42,LOT,.08),M(cx,.52,cz),P.tan);
  for(let k=0;k<5;k++){let tx,tz,tries=0;do{tx=lx+3+rnd()*(LOT-6);tz=lz+3+rnd()*(LOT-6);tries++;}while(tries<20&&((tx>px-3&&tx<px+15&&tz>pz-3&&tz<pz+12)||Math.abs(tx-cx)<4));tree(tx,tz,.7,.9+rnd()*.5);}
  if(!LOW)flowerBed(lx+2,lz+2,6,4,.7);
  bench(cx+3,.7,cz,Math.PI/2);
  const name=PARKS[parkIdx++%PARKS.length];
  const s=edgeSpot(i,j,'n',.5);
  addPlace(Object.assign({name,label:name,kind:'park'},s));
  iceSpots.push(Object.assign({name},s));
}

/* ---------- car parks ---------- */
function buildCarPark(i,j){
  const lx=blockMin(i)+PV,lz=blockMin(j)+PV;
  put('plain',rbox(LOT+2,.3,LOT+2,.08),M(lx+LOT/2,.32,lz+LOT/2),'#585C62');
  rects.push({x0:lx-1,z0:lz-1,x1:lx+LOT+1,z1:lz+LOT+1,h:.47});
  const bw=6.2,bl=10.5,margin=(LOT-5*bw)/2;
  [[lz,1],[lz+LOT-bl,-1]].forEach(([rz,dir])=>{
    for(let k=0;k<=5;k++)put('road',box(.35,.06,bl),M(lx+margin+k*bw,.49,rz+bl/2),P.white);
    put('road',box(5*bw,.06,.35),M(lx+LOT/2,.49,dir===1?rz+.3:rz+bl-.3),P.white);
    for(let k=0;k<5;k++)bays.push({x:lx+margin+(k+.5)*bw,z:rz+bl/2,rot:dir===1?Math.PI:0,taken:false});
  });
  put('plain',rbox(LOT+2.4,2,1.2,.15),M(lx+LOT/2,1.3,lz-1.2),'#256F37',true);put('plain',rbox(LOT+2.4,2,1.2,.15),M(lx+LOT/2,1.3,lz+LOT+1.2),'#256F37');
  addBox(lx-1.8,lz-1.8,lx+LOT+1.8,lz-.6,'#2E8B4A',2.5);addBox(lx-1.8,lz+LOT+.6,lx+LOT+1.8,lz+LOT+1.8,'#2E8B4A',2.5);
  const seg=bl+.6;
  [lx-1.2,lx+LOT+1.2].forEach(x=>{[lz-1.2+seg/2,lz+LOT+1.2-seg/2].forEach(z=>{put('plain',rbox(1.2,2,seg+1.2,.15),M(x,1.3,z),'#256F37',true);addBox(x-.6,z-(seg+1.2)/2,x+.6,z+(seg+1.2)/2,'#2E8B4A',2.5);});});
  [lx-1.2,lx+LOT+1.2].forEach(x=>{put('plain',new T.CylinderGeometry(.18,.18,5,8),M(x,2.6,lz+bl),P.lgrey);signMesh('P','#0A5BC4','#FFFDF6',1.8,1.8,x,5.6,lz+bl,Math.PI/2);});
  goldSpots.push({x:lx+LOT/2,y:1.6,z:lz+LOT/2});
}

/* ---------- town square with clock tower ---------- */
let clockHands=null;
function buildSquare(i,j){
  const x0=blockMin(i),z0=blockMin(j),cx=x0+BS/2,cz=z0+BS/2;
  put('plaza',worldUV(rbox(BS,.3,BS,.06),8,8),M(cx,.15,cz));
  put('plain',rbox(BS+.2,.32,BS+.2,.1),M(cx,.12,cz),'#8E959C');
  rects.push({x0,z0,x1:x0+BS,z1:z0+BS,h:.3});
  [[x0+1.2,z0+1.2],[x0+BS-1.2,z0+1.2],[x0+1.2,z0+BS-1.2],[x0+BS-1.2,z0+BS-1.2]].forEach(([x,z])=>lamp(x,z,.3,x-cx,z-cz));
  /* clock tower */
  const tx=cx,tz=cz-8;
  put('brick',worldUV(rbox(6,22,6,.12),8,2.4),M(tx,.3+11,tz),'#D9C9A8');
  put('plain',rbox(7,1,7,.12),M(tx,.3+22.5,tz),P.dgrey);
  put('plain',new T.ConeGeometry(4.6,7,4),M(tx,.3+26.5,tz,0,Math.PI/4,0),'#3C6E47');
  put('plain',new T.SphereGeometry(.5,10,8),M(tx,.3+30.4,tz),P.gold);
  addBox(tx-3,tz-3,tx+3,tz+3,'#D9C9A8',30);
  const face=canvasTex(256,256,(g)=>{g.fillStyle='#FFFDF6';g.beginPath();g.arc(128,128,124,0,7);g.fill();g.fillStyle='#22262C';for(let k=0;k<12;k++){const a=k/12*Math.PI*2;g.save();g.translate(128+Math.sin(a)*100,128-Math.cos(a)*100);g.rotate(a);g.fillRect(-5,-14,10,28);g.restore();}g.lineWidth=10;g.strokeStyle='#22262C';g.beginPath();g.arc(128,128,122,0,7);g.stroke();});
  const fm=new SMat({map:face,roughness:.3,emissive:new T.Color(1,1,1),emissiveMap:face,emissiveIntensity:0});nightSigns.push(fm);
  clockHands=[];
  [[0,1],[0,-1],[1,0],[-1,0]].forEach(([nx,nz])=>{const ry=Math.atan2(nx,nz);
    addMesh(new T.CircleGeometry(2.2,32),fm,tx+nx*3.05,.3+18,tz+nz*3.05,ry);
    const h=new T.Group();h.position.set(tx+nx*3.12,.3+18,tz+nz*3.12);h.rotation.y=ry;scene.add(h);
    const hr=new T.Mesh(rbox(.3,1.2,.08,.03),plastic(P.black));hr.position.y=.5;const hh=new T.Group();hh.add(hr);h.add(hh);
    const mr=new T.Mesh(rbox(.2,1.8,.08,.03),plastic(P.black));mr.position.y=.8;const mh=new T.Group();mh.add(mr);mh.position.z=.05;h.add(mh);
    clockHands.push({hh,mh});});
  /* fountain */
  const fx=cx,fz=cz+8;
  put('plain',new T.CylinderGeometry(5.5,5.8,1.2,24),M(fx,.9,fz),P.lgrey);
  addMesh(new T.CylinderGeometry(4.9,4.9,.2,24),new SMat({color:lin('#4FB3E8').clone(),roughness:.05,envMapIntensity:1.6}),fx,1.45,fz);
  put('plain',new T.CylinderGeometry(.8,1.1,3.2,12),M(fx,2.1,fz),P.lgrey);
  put('plain',new T.CylinderGeometry(2.4,1.2,.6,16),M(fx,3.8,fz),P.lgrey);
  addMesh(new T.CylinderGeometry(.35,.6,2.2,10),transClear,fx,4.9,fz);
  addCirc(fx,fz,5.9,P.lgrey,null,2);
  bench(cx-12,.3,cz+8,Math.PI/2);bench(cx+12,.3,cz+8,-Math.PI/2);
  tree(x0+5,z0+BS-5,.3,.8);tree(x0+BS-5,z0+BS-5,.3,.8);tree(x0+5,z0+6,.3,.8);tree(x0+BS-5,z0+6,.3,.8);
  [[x0+5,z0+BS-5],[x0+BS-5,z0+BS-5],[x0+5,z0+6],[x0+BS-5,z0+6]].forEach(([x,z])=>addCirc(x,z,1.4,'#2E8B4A'));
  if(!LOW){flowerBed(cx-9,cz-14,4,4,.3);flowerBed(cx+5,cz-14,4,4,.3);}
  const s=edgeSpot(i,j,'n',.5);
  addPlace(Object.assign({name:'Clock Tower',label:'the Clock Tower',kind:'landmark'},s));
  iceSpots.push(Object.assign({name:'Clock Tower'},edgeSpot(i,j,'s',.5)));
  goldSpots.push({x:tx,y:1.4,z:tz-6.5});
}

/* ---------- car wash + petrol station ---------- */
const brushes=[];
function buildCarWash(i,j){
  const x0=blockMin(i),z0=blockMin(j),cx=x0+BS/2;
  put('pave',worldUV(rbox(BS,.3,BS,.06),8,8),M(cx,.15,z0+BS/2));
  put('plain',rbox(BS+.2,.32,BS+.2,.1),M(cx,.12,z0+BS/2),'#8E959C');
  rects.push({x0,z0,x1:x0+BS,z1:z0+BS,h:.3});
  /* tunnel along x on the south half */
  const tz=z0+BS-11,len=26,tx0=cx-len/2,tx1=cx+len/2;
  [-1,1].forEach(s=>{put('brick',worldUV(rbox(len,7,1.2,.1),8,2.4),M(cx,.3+3.5,tz+s*5.6),'#36AEBF',true);addBox(tx0,tz+s*5.6-.6,tx1,tz+s*5.6+.6,'#36AEBF',7.3);});
  put('plain',rbox(len+.6,.8,12.6,.12),M(cx,.3+7.4,tz),P.white);
  signMesh('CAR WASH','#0A5BC4','#FFFDF6',10,1.6,cx,.3+8.8,tz+6.4,0);
  signMesh('CAR WASH','#0A5BC4','#FFFDF6',10,1.6,cx,.3+8.8,tz-6.4,Math.PI);
  [tx0+5,tx1-5].forEach(bx=>[-1,1].forEach(s=>{const b=new T.Mesh(new T.CylinderGeometry(.9,.9,5,12),new SMat({color:lin(s>0?'#2E86DE':'#E84393').clone(),roughness:.8}));b.position.set(bx,.3+3,tz+s*3.6);scene.add(b);brushes.push(b);}));
  const rb=new T.Mesh(new T.CylinderGeometry(.8,.8,8,12),new SMat({color:lin('#F2C230').clone(),roughness:.8}));rb.rotation.x=Math.PI/2;rb.position.set(cx,.3+6.1,tz);scene.add(rb);brushes.push(rb);
  washZone={x0:tx0,x1:tx1,z0:tz-4.6,z1:tz+4.6};
  /* petrol canopy (north half) */
  const pz=z0+11;
  [[cx-8,pz-5],[cx+8,pz-5],[cx-8,pz+5],[cx+8,pz+5]].forEach(([x,z])=>{put('plain',rbox(.8,6,.8,.1),M(x,.3+3,z),P.white,true);addCirc(x,z,.6,P.white);});
  put('plain',rbox(20,1,14,.15),M(cx,.3+6.5,pz),P.red);
  put('glow',box(18,.1,12),M(cx,.3+5.95,pz),'#FFF4C2');
  signMesh('BRICK FUEL','#C91A09','#FFFDF6',9,1.2,cx,.3+6.5,pz+7.05,0);
  [cx-3.5,cx+3.5].forEach(x=>{put('plain',rbox(1.4,2.6,1,.12),M(x,.3+1.3,pz),P.white,true);put('plain',rbox(1,.6,.2,.05),M(x,.3+2,pz+.55),P.red);addCirc(x,pz,1,P.white);});
  const s=edgeSpot(i,j,'w',.75);
  addPlace(Object.assign({name:'Car Wash',label:'the Car Wash',kind:'landmark'},s));
  addPlace(Object.assign({name:'Petrol Station',label:'the Petrol Station',kind:'landmark'},edgeSpot(i,j,'n',.5)));
  goldSpots.push({x:tx1+3,y:1.6,z:tz},{x:cx,y:1.6,z:pz+4});
}

/* ---------- landmark block: cinema + swimming pool ---------- */
function buildLandmarks(i,j){
  const lx=blockMin(i)+PV,lz=blockMin(j)+PV;
  addBuilding(lx,lz,LOT,15,3,[[0,-1],[-1,0],[1,0]],['CINEMA','#22262C','#F2C230']);
  addBuilding(lx,lz+19,LOT,15,2,[[0,1],[-1,0],[1,0]],['SWIMMING POOL','#36AEBF','#FFFDF6']);
  /* cinema marquee bulbs */
  for(let k=0;k<14;k++)put('glow',new T.SphereGeometry(.22,8,6),M(lx+LOT/2-6.5+k,.3+3.1,lz-.35),'#FFE48A');
}

/* ---------- outskirts ---------- */
function buildGround(){
  /* the shared grass texture uses world UVs elsewhere, so this plane gets its own repeat */
  const gt=grassTex.clone();gt.needsUpdate=true;gt.repeat.set(137,137);
  const g=new T.Mesh(new T.PlaneGeometry(1100,1100),new SMat({map:gt,roughness:.45,envMapIntensity:.5}));
  g.rotation.x=-Math.PI/2;g.receiveShadow=true;g.matrixAutoUpdate=false;g.updateMatrix();scene.add(g);
}
function buildStuntField(){
  const cx=-219,cz=0;
  /* dirt oval track */
  const segs=48;
  for(let k=0;k<segs;k++){const a0=k/segs*Math.PI*2,a1=(k+1)/segs*Math.PI*2;
    const p0x=cx+Math.cos(a0)*30,p0z=cz+Math.sin(a0)*120,p1x=cx+Math.cos(a1)*30,p1z=cz+Math.sin(a1)*120;
    const mx=(p0x+p1x)/2,mz=(p0z+p1z)/2,len=Math.hypot(p1x-p0x,p1z-p0z)+1.2,ang=Math.atan2(p1x-p0x,p1z-p0z);
    put('dirt',worldUV(box(12,.12,len),8,8),M(mx,.06,mz,0,ang,0));}
  /* ramps on the straights, rising in the driving direction */
  [[cx+30,-70,0,3.2],[cx+30,-10,0,4],[cx+30,50,0,3.2],[cx-30,60,Math.PI,3.2],[cx-30,0,Math.PI,4.5],[cx-30,-60,Math.PI,3.2]].forEach(([x,z,ang,h])=>{
    const len=h*3.6,w=9;
    ramps.push({x,z,ang,len,w,h,base:.14});
    const geo=new T.BufferGeometry();
    const hw=w/2,hl=len/2;
    const v=[-hw,0,-hl, hw,0,-hl, hw,h,hl, -hw,h,hl, -hw,0,hl, hw,0,hl];
    const idx=[0,2,1,0,3,2, 4,5,2,4,2,3, 0,4,3, 1,2,5, 0,1,5,0,5,4];
    const pos=[];idx.forEach(i=>pos.push(v[i*3],v[i*3+1],v[i*3+2]));
    geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));geo.computeVertexNormals();
    put('plain',geo,M(x,.14,z,0,ang,0),pick([P.orange,P.yellow,P.red,P.blue]));
    /* golden stud hanging in the air past the lip: only reachable by jumping */
    goldSpots.push({x:x+Math.sin(ang)*(len/2+6),y:h+2.4,z:z+Math.cos(ang)*(len/2+6),air:true});
  });
  /* puddles on the bends */
  [[cx,-112],[cx+8,116],[cx-14,-100],[cx-26,10]].forEach(([x,z])=>{puddles.push({x,z,r:5});put('plain',new T.CylinderGeometry(5,5,.1,20),M(x,.16,z),'#5A3A1E');});
  /* stands + flags */
  put('plain',rbox(8,3,40,.15),M(cx-48,1.5,cz),P.lgrey,true);put('plain',rbox(6,1,40,.1),M(cx-46.5,3.4,cz),P.blue,true);addBox(cx-52,cz-20,cx-44,cz+20,P.lgrey,4);
  for(let k=-4;k<=4;k++){put('plain',new T.CylinderGeometry(.12,.12,5,6),M(cx+42,2.5,k*25),P.white);put('plain',box(.1,1.2,2),M(cx+42,4.4,k*25+1),k%2?P.red:P.yellow);}
  signMesh('STUNT PARK','#F57F1F','#22262C',12,2.4,-180,4,-30,Math.PI/2,true);put('plain',new T.CylinderGeometry(.2,.2,3,8),M(-180,1.5,-26),P.dgrey);put('plain',new T.CylinderGeometry(.2,.2,3,8),M(-180,1.5,-34),P.dgrey);
  const sp={x:-184,z:roadC(3)+4,px:-188,pz:roadC(3)+8,face:-Math.PI/2};
  addPlace(Object.assign({name:'Stunt Park',label:'the Stunt Park',kind:'landmark'},sp));
  iceSpots.push(Object.assign({name:'Stunt Park'},{x:-184,z:-40,px:-189,pz:-44,face:-Math.PI/2}));
  goldSpots.push({x:cx,y:1.6,z:-120},{x:cx,y:1.6,z:120});
  /* boundary fence */
  for(let z=-255;z<=200;z+=6)put('plain',rbox(.6,1.6,5.4,.1),M(BOUND.x0-1,.8,z+3),P.brown);
  addBox(BOUND.x0-6,-400,BOUND.x0,400,P.brown,2);
}
function buildBeach(){
  const sand=new T.Mesh(new T.PlaneGeometry(BOUND.x1-BOUND.x0+60,36),sandMat.clone());const st=sandTex.clone();st.needsUpdate=true;st.repeat.set(70,4.5);sand.material.map=st;
  sand.rotation.x=-Math.PI/2;sand.position.set((BOUND.x0+BOUND.x1)/2,.06,189);sand.receiveShadow=true;scene.add(sand);
  const sea=new T.Mesh(new T.PlaneGeometry(1100,400),new SMat({map:seaTex,roughness:.08,metalness:.05,envMapIntensity:1.2,color:new T.Color(.85,.95,1)}));
  seaTex.repeat.set(137,50);sea.rotation.x=-Math.PI/2;sea.position.set(0,.12,206+200);sea.receiveShadow=true;scene.add(sea);seaMesh=sea;
  for(let x=BOUND.x0;x<BOUND.x1;x+=12)put('plain',rbox(12.2,.25,1.6,.1),M(x+6,.15,206.4),P.white);
  /* pier with ramp up from the sand */
  ramps.push({x:40,z:201.5,ang:0,len:9,w:9,h:1.16,base:.14});
  put('plain',(()=>{const g=new T.BufferGeometry();const hw=4.5,hl=4.5,h=1.16;const v=[-hw,0,-hl,hw,0,-hl,hw,h,hl,-hw,h,hl,-hw,0,hl,hw,0,hl];const idx=[0,2,1,0,3,2,4,5,2,4,2,3,0,4,3,1,2,5];const pos=[];idx.forEach(i=>pos.push(v[i*3],v[i*3+1],v[i*3+2]));g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(new Array(pos.length/3*2).fill(0),2));g.computeVertexNormals();return g;})(),M(40,.14,201.5),'#B07A48');
  rects.push({x0:35.5,z0:205.9,x1:44.5,z1:262,h:1.3});
  put('deck',worldUV(rbox(9,.5,56,.06),8,8),M(40,1.05,234));
  for(let z=208;z<262;z+=8){[-1,1].forEach(s=>{put('plain',new T.CylinderGeometry(.5,.5,3,8),M(40+s*4.4,-.2,z),'#6B3B1F');put('plain',rbox(.4,1.4,.4,.05),M(40+s*4.4,2,z),P.white);});}
  [-1,1].forEach(s=>put('plain',rbox(.3,.3,56,.05),M(40+s*4.4,2.6,234),P.white));
  put('plain',rbox(9,1.4,.4,.05),M(40,2,262),P.white);
  addBox(-500,206.5,35.5,700,'#2B86C9',1);addBox(44.5,206.5,500,700,'#2B86C9',1);addBox(30,262,50,700,'#2B86C9',1);
  /* lighthouse on its rock */
  put('plain',new T.CylinderGeometry(6,7,2,12),M(56,.8,262),P.lgrey);
  for(let k=0;k<5;k++)put('plain',new T.CylinderGeometry(2.6-k*.2,2.8-k*.2,3.4,16),M(56,2+k*3.4+1.7,262),k%2?P.white:P.red);
  put('glow',new T.CylinderGeometry(1.8,1.8,2.4,12),M(56,2+17+1.2,262),'#FFF4C2');
  put('plain',new T.ConeGeometry(2.4,2.4,12),M(56,2+17+3.6,262),P.red);
  lighthouse={x:56,y:21,z:262};
  /* beach huts, umbrellas, lifeguard tower */
  const hutCols=[P.red,P.blue,P.yellow,P.green,P.pink,P.azure,P.orange,P.lilac];
  for(let k=0;k<8;k++){const x=-160+k*7.5;put('brick',worldUV(rbox(6,4.6,5,.1),8,2.4),M(x,2.4,181),hutCols[k],true);put('plain',prismGeo,MS(x,4.7,181,6.6,2,5.6),P.white,true);doorAt(x,1.85,183.55,0,P.white);addBox(x-3,178.5,x+3,183.5,hutCols[k],5);}
  for(let k=0;k<7;k++){const x=-60+k*22+rnd()*6,z=192+rnd()*8;put('plain',new T.CylinderGeometry(.12,.12,4.4,6),M(x,2.2,z),P.white);put('plain',new T.ConeGeometry(3.2,1.4,8),M(x,4.6,z),pick([P.red,P.blue,P.yellow,P.pink]),true);put('plain',rbox(2,.12,4,.05),M(x+2.5,.2,z),pick([P.azure,P.orange,P.lime]));addCirc(x,z,.4,P.white);}
  [[-30,198],[130,196]].forEach(([x,z])=>{[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]].forEach(([a,b])=>put('plain',rbox(.4,5,.4,.05),M(x+a,2.5,z+b),P.white,true));put('plain',rbox(4,2.6,4,.1),M(x,6.2,z),P.red,true);addBox(x-2,z-2,x+2,z+2,P.red,7);});
  addPlace(Object.assign({name:'Beach',label:'the Beach',kind:'landmark'},{x:-40,z:184,px:-40,pz:188,face:0}));
  addPlace(Object.assign({name:'Pier',label:'the end of the Pier',kind:'landmark'},{x:40,z:252,px:42,pz:256,face:0}));
  iceSpots.push({name:'Beach',x:-100,z:190,px:-100,pz:195,face:0},{name:'Pier',x:40,z:238,px:42,pz:244,face:0});
  goldSpots.push({x:40,y:3.2,z:258},{x:-165,y:1.4,z:192},{x:100,y:1.4,z:200},{x:-100,y:1.4,z:203});
}
let seaMesh=null,lighthouse=null;
function buildForest(){
  const camp={x:-60,z:-212};
  for(let k=0;k<(LOW?110:190);k++){
    const x=BOUND.x0+8+rnd()*(BOUND.x1-BOUND.x0-16),z=-180-rnd()*78;
    if(Math.hypot(x-camp.x,z-camp.z)<22)continue;
    if(Math.abs(x-(-60))<7&&z>-200)continue;
    if(Math.hypot(x+150,z+220)<14||Math.hypot(x-120,z+230)<14||Math.hypot(x-20,z+200)<10)continue;
    tree(x,z,0,1+rnd()*.6,pick(['#2C7A3F','#3C8E47','#1F6B35','#4F9E3A']));addCirc(x,z,1.5,'#2E8B4A');
  }
  /* campsite */
  [[camp.x-8,camp.z-6,P.orange],[camp.x+7,camp.z-8,P.blue],[camp.x+9,camp.z+5,P.lime]].forEach(([x,z,c])=>{put('plain',prismGeo,MS(x,.14,z,5,3.4,4.4,0,.4,0),c,true);addBox(x-2.6,z-2.4,x+2.6,z+2.4,c,3.4);});
  put('plain',new T.CylinderGeometry(1.6,1.6,.5,10),M(camp.x,.4,camp.z),P.lgrey);put('glow',new T.ConeGeometry(.9,1.6,6),M(camp.x,1.3,camp.z),'#FF8A2A');addCirc(camp.x,camp.z,1.8,P.lgrey);
  campfire={x:camp.x,z:camp.z};
  [[camp.x-4,camp.z+4],[camp.x+4,camp.z+3]].forEach(([x,z])=>{put('plain',new T.CylinderGeometry(.6,.6,3,10),M(x,.6,z,0,0,Math.PI/2),P.brown);});
  for(let z=-176;z>-200;z-=4)put('dirt',worldUV(box(9,.1,4.2),8,8),M(-60,.07,z));
  puddles.push({x:-60,z:-190,r:4});put('plain',new T.CylinderGeometry(4,4,.1,18),M(-60,.12,-190),'#5A3A1E');
  addPlace(Object.assign({name:'Campsite',label:'the Campsite',kind:'landmark'},{x:-60,z:-196,px:-55,pz:-200,face:Math.PI}));
  iceSpots.push({name:'Campsite',x:-45,z:-194,px:-40,pz:-197,face:Math.PI/2});
  goldSpots.push({x:-150,y:1.4,z:-220},{x:120,y:1.4,z:-230},{x:20,y:1.4,z:-200},{x:-60,y:1.4,z:-222});
  for(let x=BOUND.x0;x<BOUND.x1;x+=6)put('plain',rbox(5.4,1.6,.6,.1),M(x+3,.8,BOUND.z0-1),P.brown);
  addBox(-400,BOUND.z0-6,400,BOUND.z0,P.brown,2);
}
let campfire=null;
const trainCars=[];
function buildStation(){
  /* forecourt */
  put('plaza',worldUV(box(28,.2,90),8,8),M(189,.1,0));rects.push({x0:175,z0:-45,x1:203,z1:45,h:.2});
  addBox(202,-60,208,60,P.lgrey,1.2);
  /* station building */
  put('brick',worldUV(rbox(12,8,44,.12),8,2.4),M(196,.3+4,0),'#B5452E');
  put('plain',prismGeo,MS(196,8.3,0,46,4,13.6,0,Math.PI/2,0),P.dgrey);
  addBox(190,-22,202,22,'#B5452E',12);
  signMesh('BRICKTON STATION','#203A72','#FFFDF6',18,2,189.8,6.6,0,-Math.PI/2);
  for(let z=-16;z<=16;z+=8){if(z===0){doorAt(189.9,.3+1.75,z,-Math.PI/2,P.navy);continue;}windowAt(189.9,.3+2.2,z,-Math.PI/2);}
  put('plain',rbox(6,1,2,.1),M(184,.6,-12),P.lgrey);signMesh('TAXI','#F2C230','#22262C',3.2,1,182,2.8,-12,-Math.PI/2);put('plain',new T.CylinderGeometry(.15,.15,2.4,6),M(182,1.2,-12),P.dgrey);addCirc(182,-12,.4,P.dgrey);addBox(181,-13,187,-11,P.lgrey,1);
  /* platform + track (behind the fence) */
  put('plain',rbox(6,1,120,.1),M(205,.5,0),P.lgrey);
  put('plain',box(1,.3,560),M(212,.25,0),P.dgrey);put('plain',box(1,.3,560),M(216,.25,0),P.dgrey);
  for(let z=-276;z<276;z+=3)put('plain',box(7,.2,1.2),M(214,.12,z),P.brown);
  for(let z=-255;z<=200;z+=6){if(z>-62&&z<56)continue;put('plain',rbox(.6,1.6,5.4,.1),M(BOUND.x1+1,.8,z+3),P.white);}
  addBox(BOUND.x1,-400,BOUND.x1+6,400,P.white,2);
  /* the train */
  const cols=[P.green,P.cream,P.cream,P.cream];
  cols.forEach((c,k)=>{const g=new T.Group();
    const parts=[{geo:rbox(4.8,4.4,14,.25),m:M(0,3.2,0),color:c},{geo:rbox(5,.5,14.4,.15),m:M(0,5.6,0),color:k?P.dgrey:P.green},{geo:rbox(4.4,.8,13,.1),m:M(0,.9,0),color:P.dgrey}];
    if(!k){parts.push({geo:new T.CylinderGeometry(.6,.6,2,10),m:M(0,6.6,4.5),color:P.black},{geo:rbox(4.9,1.6,1,.1),m:M(0,2,7.2),color:P.red});}
    for(let w=-1;w<=1;w++)if(k)parts.push({geo:box(4.9,1.4,3),m:M(0,3.8,w*4),color:'#3E78B8'});
    [-4.5,4.5].forEach(z=>[-2.2,2.2].forEach(x=>parts.push({geo:new T.CylinderGeometry(.8,.8,.5,12),m:M(x,.8,z,0,0,Math.PI/2),color:P.black})));
    const m=new T.Mesh(mergeGeos(parts),vcolMat);m.castShadow=true;g.add(m);g.position.set(214,0,-300-k*15);scene.add(g);trainCars.push(g);});
  addPlace(Object.assign({name:'Station',label:'the Station',kind:'landmark'},{x:181,z:6,px:187,pz:6,face:Math.PI/2}));
  goldSpots.push({x:184,y:1.4,z:36},{x:180,y:1.4,z:-40});
}

/* ---------- bus stops ---------- */
function buildBusStops(){
  [['Forest Edge',1,0,'n',.5],['Market',4,1,'s',.5],['Station Road',5,3,'e',.5],['Seaside',3,5,'s',.5],['Stunt Park',0,4,'w',.5],['Clock Tower',2,2,'n',.25]].forEach(([name,i,j,side,t])=>{
    const s=edgeSpot(i,j,side,t);
    const ry=s.face;const sx=s.px+Math.sin(ry)*-.2,sz=s.pz+Math.cos(ry)*-.2;
    const cx=Math.cos(ry),cz=-Math.sin(ry);
    put('plain',rbox(5,.3,2,.08),M(sx-Math.sin(ry)*.6,3.4,sz-Math.cos(ry)*.6,0,ry,0),P.red);
    put('glass',new T.PlaneGeometry(5,2.6),M(sx-Math.sin(ry)*1.5,1.8,sz-Math.cos(ry)*1.5,0,ry,0),'#6FA3D6');
    [-2.3,2.3].forEach(o=>put('plain',rbox(.25,3.2,.25,.04),M(sx+cx*o,1.9,sz+cz*o),P.dgrey));
    put('plain',new T.CylinderGeometry(.12,.12,4,6),M(sx+cx*3.2,2.3,sz+cz*3.2),P.dgrey);
    signMesh('BUS','#C91A09','#FFFDF6',1.6,1.1,sx+cx*3.2,4.6,sz+cz*3.2,ry);
    busStops.push(Object.assign({name},s));
  });
}

/* ---------- golden studs placed on roads too ---------- */
function roadGold(){
  [[roadC(0),roadC(0)+28],[roadC(6),roadC(5)+28],[roadC(3)+28,roadC(6)],[roadC(1)+28,roadC(0)],[roadC(5),roadC(2)+28],[roadC(2)+28,roadC(4)],[roadC(4)+28,roadC(3)],[roadC(1),roadC(1)+28]].forEach(([x,z])=>goldSpots.push({x,y:1.4,z}));
}

function buildWorld(){
  buildGround();buildRoads();
  for(let j=0;j<NB;j++)for(let i=0;i<NB;i++){
    const t=LAYOUT[j][i];
    if(t==='S'||t==='L')pavement(i,j);
    if(t==='H'||t==='P'||t==='C')pavement(i,j);
    if(t==='S')buildShops(i,j);else if(t==='H')buildHouses(i,j);else if(t==='P')buildPark(i,j);else if(t==='C')buildCarPark(i,j);else if(t==='Q')buildSquare(i,j);else if(t==='W')buildCarWash(i,j);else if(t==='L')buildLandmarks(i,j);
  }
  buildStuntField();buildBeach();buildForest();buildStation();buildBusStops();roadGold();
  /* brick clouds */
  for(let k=0;k<(LOW?5:9);k++){
    const parts=[];const n=3+Math.floor(rnd()*3);
    for(let p=0;p<n;p++){const w=8+rnd()*10,d=6+rnd()*8;parts.push({geo:rbox(w,1.2,d,.3),m:M((p-n/2)*5+rnd()*3,(p%2)*1.2,rnd()*4-2),color:'#FFFFFF'});}
    const c=new T.Mesh(mergeGeos(parts),new SMat({vertexColors:true,roughness:.4,emissive:new T.Color(1,1,1),emissiveIntensity:.25,fog:false}));
    c.position.set(rnd()*500-250,70+rnd()*30,rnd()*500-250);scene.add(c);clouds.push(c);
  }
}
const clouds=[];

'use strict';
if(!window.THREE){document.getElementById('err').style.display='grid';return;}
const T=THREE;
const $=id=>document.getElementById(id);

/* ---------- saved progress (per device) ---------- */
const store={
  get(k,d){try{const v=localStorage.getItem('brickton.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem('brickton.'+k,JSON.stringify(v));}catch(e){}},
  clear(){try{Object.keys(localStorage).filter(k=>k.startsWith('brickton.')).forEach(k=>localStorage.removeItem(k));}catch(e){}}
};

/* everything the player has earned or chosen */
const save=Object.assign({studs:0,golden:[],stickers:[],counts:{},owned:{vehicles:['cab'],paints:[],hats:[]},paint:{},driver:{skin:'#E9B98E',shirt:'#2D3F6E',legs:'#22262C',hat:'cap',hatCol:'#22262C',hair:'#6B3B1F',trim:'#F2C230'},vehicle:'cab',time:'auto',sound:true,radio:'off'},store.get('save',{}));
['golden','stickers'].forEach(k=>{if(!Array.isArray(save[k]))save[k]=[];});
save.owned=Object.assign({vehicles:['cab'],paints:[],hats:[]},save.owned||{});save.counts=save.counts||{};save.paint=save.paint||{};
let saveTimer=0;function persist(){store.set('save',save);}

/* ---------- detail level: Fire tablets and saved choice pick Low ---------- */
const UA=navigator.userAgent;
const IS_FIRE=/Silk|\bKF[A-Z]{2,6}\b|Kindle/i.test(UA);
const MOBILE=/Android|iPhone|iPad|Mobile|Silk/i.test(UA)||Math.min(screen.width,screen.height)<600;
const DETAIL=store.get('detail',null)||(IS_FIRE?'low':'high');
const LOW=DETAIL==='low';
/* Low detail swaps the shiny plastic shader for a much cheaper one that older tablets can keep up with */
const DROP=['roughness','metalness','envMapIntensity','normalMap','normalScale'];
function SMat(p){p=Object.assign({},p||{});if(LOW){DROP.forEach(k=>delete p[k]);return new THREE.MeshLambertMaterial(p);}return new THREE.MeshStandardMaterial(p);}

/* ---------- palette & helpers ---------- */
const P={red:'#C91A09',blue:'#0A5BC4',yellow:'#F2C230',green:'#2E8B4A',lime:'#A5CA18',white:'#F4F4F2',lgrey:'#A3A8AD',dgrey:'#5F6266',tan:'#E4CD9E',orange:'#F57F1F',azure:'#36AEBF',brown:'#6B3B1F',black:'#22262C',pink:'#E87AA4',sand:'#9FB8A0',navy:'#203A72',cream:'#F3E7C5',teal:'#1A8F8A',purple:'#7A4FA8',gold:'#F5B700',mint:'#9FE0C3',lilac:'#B9A2E0'};
const BUILD_COLS=[P.red,P.blue,P.yellow,P.white,P.tan,P.orange,P.azure,P.sand,P.cream,P.teal,P.lgrey,P.pink];
const linCache=new Map();
const lin=h=>{if(h&&h.isColor)return h;let c=linCache.get(h);if(!c){c=new T.Color(h).convertSRGBToLinear();linCache.set(h,c);}return c;};
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const pick=a=>a[Math.floor(rnd()*a.length)];
const rpick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const damp=(a,b,k,dt)=>lerp(a,b,1-Math.exp(-k*dt));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const dist2=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);

/* rounded (chamfered) box: crisp toy-plastic edges that catch the light */
const rboxCache=new Map();
let SIMPLE_BOXES=false; /* Low detail bakes the town from plain boxes: 12 triangles instead of 108 */
function rbox(w,h,d,r){
  if(SIMPLE_BOXES)return box(w,h,d);
  r=Math.min(r===undefined?0.08:r,w/2-1e-3,h/2-1e-3,d/2-1e-3);
  const key=[w,h,d,r].map(v=>v.toFixed(3)).join(',');
  const cached=rboxCache.get(key);if(cached)return cached;
  const n=3,g=new T.BoxGeometry(1,1,1,n,n,n);
  const p=g.attributes.position.array,nm=g.attributes.normal.array,half=[w/2,h/2,d/2];
  for(let i=0;i<p.length;i+=3){
    let dl=0;const q=[0,0,0],df=[0,0,0];
    for(let a=0;a<3;a++){
      const idx=Math.round((p[i+a]+.5)*n),inner=half[a]-r;
      const c=idx===0?-half[a]:idx===1?-inner:idx===2?inner:half[a];
      q[a]=clamp(c,-inner,inner);df[a]=c-q[a];dl+=df[a]*df[a];
    }
    dl=Math.sqrt(dl)||1;
    for(let a=0;a<3;a++){const nn=df[a]/dl;p[i+a]=q[a]+nn*r;nm[i+a]=nn;}
  }
  rboxCache.set(key,g);
  return g;
}
/* plain box for things never seen up close (cheaper than rbox) */
const boxCache=new Map();
function box(w,h,d){const k=w+','+h+','+d;let g=boxCache.get(k);if(!g){g=new T.BoxGeometry(w,h,d);boxCache.set(k,g);}return g;}
/* world-unit UVs so brick seams line up at real brick sizes */
function worldUV(g,sx,sy){
  g=g.clone();
  const p=g.attributes.position.array,n=g.attributes.normal.array,uv=g.attributes.uv.array;
  for(let i=0,j=0;i<p.length;i+=3,j+=2){
    const ax=Math.abs(n[i]),ay=Math.abs(n[i+1]),az=Math.abs(n[i+2]);
    let u,v;
    if(ay>=ax&&ay>=az){u=p[i];v=p[i+2];}else if(ax>=az){u=p[i+2]*(n[i]>0?-1:1);v=p[i+1];}else{u=p[i]*(n[i+2]>0?1:-1);v=p[i+1];}
    uv[j]=u/sx;uv[j+1]=v/sy;
  }
  return g;
}
/* merge many parts into one geometry; a colour per part becomes vertex colour */
function mergeGeos(list){
  let total=0;const parts=[];
  for(const it of list){
    let g=it.geo.index?it.geo.toNonIndexed():it.geo.clone();
    if(it.m){g.applyMatrix4(it.m);
      if(it.m.determinant()<0){for(const k of ['position','normal','uv','color']){const a=g.attributes[k];if(!a)continue;const s=a.itemSize,arr=a.array;for(let t=0;t<arr.length;t+=s*3)for(let c=0;c<s;c++){const tmp=arr[t+s+c];arr[t+s+c]=arr[t+2*s+c];arr[t+2*s+c]=tmp;}}}}
    parts.push([g,it.color]);total+=g.attributes.position.count;
  }
  const pos=new Float32Array(total*3),nor=new Float32Array(total*3),uv=new Float32Array(total*2),col=new Float32Array(total*3);
  let o=0;
  for(const [g,c] of parts){
    const n=g.attributes.position.count;
    pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);
    if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);
    if(!c&&g.attributes.color)col.set(g.attributes.color.array,o*3);
    else{const cc=c?lin(c):new T.Color(1,1,1);for(let i=0;i<n;i++){col[(o+i)*3]=cc.r;col[(o+i)*3+1]=cc.g;col[(o+i)*3+2]=cc.b;}}
    o+=n;
  }
  const out=new T.BufferGeometry();
  out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));
  out.setAttribute('uv',new T.BufferAttribute(uv,2));out.setAttribute('color',new T.BufferAttribute(col,3));
  out.computeBoundingSphere();return out;
}
const M=(x,y,z,rx,ry,rz,s)=>{const m=new T.Matrix4();m.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)),new T.Vector3(s||1,s||1,s||1));return m;};
const MS=(x,y,z,sx,sy,sz,rx,ry,rz)=>{const m=new T.Matrix4();m.compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx||0,ry||0,rz||0)),new T.Vector3(sx,sy,sz));return m;};
/* triangular prism (pitched roofs): ridge along x, base on y=0, 1 long x 1 high x 1 wide */
const prismGeo=(()=>{let g=new T.CylinderGeometry(1,1,1,3,1);g.rotateZ(Math.PI/2);g.rotateX(-Math.PI/2);g=g.toNonIndexed();g.translate(0,.5,0);g.scale(1,1/1.5,1/1.732);g.computeVertexNormals();return g;})();
const studGeo=(()=>{const g=new T.CylinderGeometry(.3,.3,.2,9,1,true);const cap=new T.CircleGeometry(.3,9);cap.rotateX(-Math.PI/2);cap.translate(0,.1,0);const m=mergeGeos([{geo:g},{geo:cap}]);m.deleteAttribute('color');m.translate(0,.1,0);return m;})();

/* ---------- renderer ---------- */
const host=$('game');
let renderer;
try{renderer=new T.WebGLRenderer({antialias:false,powerPreference:'high-performance'});}catch(e){$('err').style.display='grid';return;}
host.prepend(renderer.domElement);
const isWebGL2=renderer.capabilities.isWebGL2;
let pixelRatio=Math.min(window.devicePixelRatio||1,LOW?1:(MOBILE?1.75:2));
let usePost=!LOW;
renderer.setPixelRatio(pixelRatio);
renderer.shadowMap.enabled=!LOW;renderer.shadowMap.type=LOW?T.PCFShadowMap:T.PCFSoftShadowMap;
renderer.outputEncoding=T.sRGBEncoding;
const maxAniso=Math.min(LOW?2:8,renderer.capabilities.getMaxAnisotropy());

const scene=new T.Scene();
const FOG_FAR=LOW?150:270;
scene.fog=new T.Fog(lin('#CFE7F5').clone(),LOW?75:150,FOG_FAR);
const camera=new T.PerspectiveCamera(46,1,0.5,FOG_FAR+30);

/* render target + tilt-shift / grade pass (High detail only) */
let rt;
function makeRT(w,h){
  if(rt)rt.dispose();rt=null;if(!usePost)return;
  const opt={encoding:T.sRGBEncoding,minFilter:T.LinearFilter,magFilter:T.LinearFilter};
  if(isWebGL2&&T.WebGLMultisampleRenderTarget){rt=new T.WebGLMultisampleRenderTarget(w,h,opt);rt.samples=4;}
  else rt=new T.WebGLRenderTarget(w,h,opt);
}
const postMat=new T.ShaderMaterial({
  uniforms:{tDiffuse:{value:null},uRes:{value:new T.Vector2(1,1)},uFocus:{value:.45},uAmt:{value:7},uTime:{value:0},uNight:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uRes;uniform float uFocus,uAmt,uTime,uNight;varying vec2 vUv;
  void main(){
    float d=abs(vUv.y-uFocus);
    float b=smoothstep(.12,.5,d)*uAmt;
    vec3 c=texture2D(tDiffuse,vUv).rgb;
    if(b>.35){vec3 acc=c;for(int i=0;i<12;i++){float a=float(i)*2.39996;float r=sqrt((float(i)+.5)/12.);acc+=texture2D(tDiffuse,vUv+vec2(cos(a),sin(a))*r*b/uRes).rgb;}c=acc/13.;}
    float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.1);
    c=(c-.5)*1.05+.5;
    vec2 q=vUv-.5;c*=1.-dot(q,q)*(.42+uNight*.4);
    c+=mix(vec3(.012,.006,-.008),vec3(-.01,0.,.03),uNight);
    float n=fract(sin(dot(vUv*uRes+uTime,vec2(12.9898,78.233)))*43758.5453);
    c+=(n-.5)*.022;
    gl_FragColor=vec4(c,1.);
  }`,depthTest:false,depthWrite:false});
const postScene=new T.Scene(),postCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
postScene.add(new T.Mesh(new T.PlaneGeometry(2,2),postMat));

/* ---------- lighting ---------- */
const hemi=new T.HemisphereLight(lin('#DCEBFF').clone(),lin('#8C7A5B').clone(),.62);scene.add(hemi);
const sun=new T.DirectionalLight(lin('#FFF0D8').clone(),1.55);
const sunDir=new T.Vector3(-.55,1,.42).normalize();
sun.castShadow=!LOW;const SMAP=LOW?1024:(MOBILE?1536:2048);sun.shadow.mapSize.set(SMAP,SMAP);
const SC=sun.shadow.camera;const SR=LOW?40:52;SC.left=-SR;SC.right=SR;SC.top=SR;SC.bottom=-SR;SC.near=1;SC.far=240;
sun.shadow.bias=-.0004;sun.shadow.normalBias=.04;
scene.add(sun);scene.add(sun.target);

/* painted skies for plastic reflections: day, dusk and night */
function envFrom(top,hor,gnd,lights){
  const c=document.createElement('canvas');c.width=512;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,top);gr.addColorStop(.47,hor);gr.addColorStop(.53,gnd[0]);gr.addColorStop(1,gnd[1]);
  g.fillStyle=gr;g.fillRect(0,0,512,256);
  g.filter='blur(6px)';g.fillStyle=lights;g.fillRect(70,48,110,30);g.fillRect(300,30,90,24);g.beginPath();g.arc(250,62,16,0,7);g.fill();
  const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.encoding=T.sRGBEncoding;
  const pm=new T.PMREMGenerator(renderer);const out=pm.fromEquirectangular(t).texture;pm.dispose();t.dispose();return out;
}
const ENV={};
try{
  ENV.day=envFrom('#6E9EE6','#EEF2F6',['#B9B5A6','#4D5546'],'#FFFFFF');
  ENV.dusk=envFrom('#5A5C9E','#F2B48A',['#8E7A6A','#3B3A3A'],'#FFE2C0');
  ENV.night=envFrom('#0E1430','#34406A',['#2A2C38','#14161C'],'#9FB4FF');
  scene.environment=ENV.day;
}catch(e){hemi.intensity=.85;}

/* sky dome (written straight in display colour) */
const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
  uniforms:{uTop:{value:new T.Color(.36,.66,.92)},uHor:{value:new T.Color(.81,.906,.96)},uStars:{value:0}},
  vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform vec3 uTop,uHor;uniform float uStars;varying vec3 vP;
  void main(){vec3 d=normalize(vP);float h=d.y;vec3 c=mix(uHor,uTop,smoothstep(-.02,.55,h));
    if(uStars>0.){vec2 s=floor(d.xz/(d.y+.6)*90.);float r=fract(sin(dot(s,vec2(12.99,78.23)))*43758.5);c+=step(.992,r)*uStars*smoothstep(.05,.3,h)*vec3(1.,1.,.9);}
    gl_FragColor=vec4(c,1.);}`});
const skyDome=new T.Mesh(new T.SphereGeometry(FOG_FAR-10,32,16),skyMat);skyDome.frustumCulled=false;skyDome.renderOrder=-1;
scene.add(skyDome);

/* ---------- textures ---------- */
function canvasTex(w,h,draw,srgb){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=maxAniso;if(srgb!==false)t.encoding=T.sRGBEncoding;return t;}
/* running-bond brick seams: 8 studs x 2 bricks per tile (white, so vertex colour tints it) */
const brickMap=canvasTex(512,128,(g,w,h)=>{
  g.fillStyle='#fff';g.fillRect(0,0,w,h);
  const img=g.getImageData(0,0,w,h);for(let i=0;i<img.data.length;i+=4){const n=246+Math.random()*9;img.data[i]=img.data[i+1]=img.data[i+2]=n;}g.putImageData(img,0,0);
  g.fillStyle='rgba(40,40,50,.55)';
  [0,64].forEach(y=>{g.fillRect(0,y,w,2);});g.fillRect(0,h-1,w,1);
  [[0,0],[256,0],[128,64],[384,64]].forEach(([x,y])=>{g.fillRect(x,y,2,64);});
  g.fillStyle='rgba(255,255,255,.6)';[2,66].forEach(y=>g.fillRect(0,y,w,1));
});
const brickNormal=canvasTex(512,128,(g,w,h)=>{
  g.fillStyle='rgb(128,128,255)';g.fillRect(0,0,w,h);
  [0,64,128].forEach(y=>{g.fillStyle='rgb(128,50,230)';g.fillRect(0,y-3,w,3);g.fillStyle='rgb(128,206,230)';g.fillRect(0,y,w,3);});
  [[0,0],[256,0],[512,0],[128,64],[384,64]].forEach(([x,y])=>{g.fillStyle='rgb(206,128,230)';g.fillRect(x-3,y,3,64);g.fillStyle='rgb(50,128,230)';g.fillRect(x,y,3,64);});
},false);
/* studded baseplates: 8x8 studs per tile */
function studTex(base,hi,lo){return canvasTex(256,256,(g,w,h)=>{
  g.fillStyle=base;g.fillRect(0,0,w,h);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const cx=x*32+16,cy=y*32+16;
    g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.arc(cx+2.5,cy+3,10,0,7);g.fill();
    const gr=g.createLinearGradient(cx-10,cy-10,cx+10,cy+10);gr.addColorStop(0,hi);gr.addColorStop(1,lo);
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,10,0,7);g.fill();
    g.fillStyle=base;g.beginPath();g.arc(cx,cy,7.6,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.arc(cx-2,cy-2.5,4,0,7);g.fill();
  }
});}
const grassTex=studTex('#3C9A4D','#78C987','#24683A');
const sandTex=studTex('#E6CF92','#FFF0C2','#BFA265');
const seaTex=studTex('#2B86C9','#7CC6F2','#1A5C94');
const dirtTex=studTex('#9A6A3E','#C99A68','#6A4424');
const tileTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#B9BEC3';g.fillRect(0,0,w,h);g.fillStyle='rgba(60,64,70,.35)';for(let i=0;i<=4;i++){g.fillRect(i*64-1,0,2,h);g.fillRect(0,i*64-1,w,2);}g.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<4;i++){g.fillRect(i*64+1,0,1,h);g.fillRect(0,i*64+1,w,1);}});
const plazaTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#D9C9A8';g.fillRect(0,0,w,h);for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=(x+y)%2?'#CDBA94':'#E3D5B6';g.fillRect(x*32+1,y*32+1,30,30);}});
const woodTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#A9744A';g.fillRect(0,0,w,h);for(let i=0;i<160;i++){g.strokeStyle=`rgba(${70+Math.random()*40},${40+Math.random()*20},20,${.08+Math.random()*.12})`;g.lineWidth=1+Math.random()*3;g.beginPath();const y=Math.random()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+Math.random()*20-10,w*.6,y+Math.random()*20-10,w,y+Math.random()*10-5);g.stroke();}});
const deckTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#B07A48';g.fillRect(0,0,w,h);for(let i=0;i<8;i++){g.fillStyle=i%2?'#A36E3E':'#B98552';g.fillRect(0,i*32+1,w,30);}g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<8;i++)g.fillRect(0,i*32,w,1);});
function labelTex(text,bg,fg,w,h,font){return canvasTex(w||256,h||64,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle=fg;let size=Math.floor(H*.62);g.font=font||`${size}px "Lilita One", "Arial Black", sans-serif`;if(!font){while(g.measureText(text).width>W*.9&&size>10){size-=2;g.font=`${size}px "Lilita One", "Arial Black", sans-serif`;}}g.textAlign='center';g.textBaseline='middle';g.fillText(text,W/2,H/2+H*.04);});}
const checkerTex=canvasTex(256,32,(g,w,h)=>{for(let x=0;x<16;x++)for(let y=0;y<2;y++){g.fillStyle=(x+y)%2?'#F4F4F2':'#22262C';g.fillRect(x*16,y*16,16,16);}});
const poolTex=canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,220,150,1)');gr.addColorStop(.5,'rgba(255,190,110,.45)');gr.addColorStop(1,'rgba(255,170,90,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const glowTex=canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.4)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});

/* ---------- materials ---------- */
const matCache={};
function plastic(hex,opts){const k=hex+(opts?JSON.stringify(opts):'');if(matCache[k])return matCache[k];const m=new SMat(Object.assign({color:lin(hex).clone(),roughness:.32,metalness:0,envMapIntensity:.75},opts||{}));matCache[k]=m;return m;}
const vcolMat=new SMat({vertexColors:true,roughness:.32,metalness:0,envMapIntensity:.75});
const brickVMat=new SMat({vertexColors:true,map:brickMap,normalMap:brickNormal,normalScale:new T.Vector2(.9,.9),roughness:.36,envMapIntensity:.7});
const glassMat=new SMat({color:lin('#3E78B8').clone(),roughness:.08,metalness:.1,envMapIntensity:.9,emissive:lin('#FFC56B').clone(),emissiveIntensity:0});
const glowMat=new SMat({vertexColors:true,roughness:.2,envMapIntensity:.6,emissive:lin('#FFE6A8').clone(),emissiveIntensity:.15});
const poolMat=new T.MeshBasicMaterial({map:poolTex,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,fog:false});
const transClear=new SMat({color:lin('#DDEEFF').clone(),roughness:.04,metalness:.1,transparent:true,opacity:.32,envMapIntensity:1.6,depthWrite:false});

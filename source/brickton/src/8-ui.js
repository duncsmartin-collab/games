/* =====================================================================
   UI: wallet, toasts, stickers, garage, input, main loop
   ===================================================================== */
let frameDt=1/60,bookOpen=false;
function updateWallet(){$('studs').textContent=save.studs;$('golden').textContent=save.golden.length+'/'+GOLD_TOTAL;$('gWallet').textContent=save.studs;}
function addStuds(n){save.studs+=n;updateWallet();persist();}
let toastTimer=0;
function toast(main,sub,ms){const el=$('toast');el.innerHTML=main+(sub?`<small>${sub}</small>`:'');el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),ms||2400);}

/* ---------- stickers ---------- */
const ICONS={
  cab:'M4 16v-3.5L6.2 7h11.6l2.2 5.5V16h-1.2a2.2 2.2 0 0 1-4.4 0H9.6a2.2 2.2 0 0 1-4.4 0zM7.6 11.5h8.8l-1.3-3H8.9z',
  note:'M9 18.5a3 3 0 1 1-2-2.8V5.2l11-2.2v11.5a3 3 0 1 1-2-2.8V6.4L9 7.8z',
  cake:'M4 21v-7h16v7zM6 13v-3h12v3zM11 9V6.5h2V9zM12 5.6c-1.2 0-1.2-1.8 0-3.4 1.2 1.6 1.2 3.4 0 3.4z',
  clock:'M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm-1 4h2v5.2l3.6 2.1-1 1.7L11 12.8z',
  P:'M7 3h6.2a5.4 5.4 0 0 1 0 10.8H10.4V21H7zm3.4 3.2v4.4h2.6a2.2 2.2 0 0 0 0-4.4z',
  heart:'M12 21s-8.5-5.4-8.5-11.4A4.6 4.6 0 0 1 12 6.9a4.6 4.6 0 0 1 8.5 2.7C20.5 15.6 12 21 12 21z',
  drop:'M12 2s7.5 8 7.5 12.6a7.5 7.5 0 0 1-15 0C4.5 10 12 2 12 2z',
  bubbles:'M8 13a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm9.5-4.5a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6zM11 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  jump:'M2.5 21.5l9-7.5v7.5zM15.5 2.5l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7-2.7-2.6 3.7-.5z',
  stud:'M12 3.5c5 0 8.5 1.6 8.5 3.8v9.4c0 2.2-3.5 3.8-8.5 3.8s-8.5-1.6-8.5-3.8V7.3C3.5 5.1 7 3.5 12 3.5zm0 2c-3.7 0-6.2 1-6.2 1.8s2.5 1.8 6.2 1.8 6.2-1 6.2-1.8-2.5-1.8-6.2-1.8z',
  crown:'M3 19l-1.2-12 6 4.2L12 3.5l4.2 7.7 6-4.2L21 19z',
  moon:'M20.5 14.5A8.8 8.8 0 1 1 9.5 3.5a7 7 0 0 0 11 11z',
  pizza:'M12 2.5l10 18.5H2zm-2 9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm4.5 3.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
  cone:'M6.5 10.5a5.5 5.5 0 0 1 11 0zM7 11.5h10L12 22.5z',
  bus:'M5 2.5h14v16h-2v2.5h-3v-2.5h-4v2.5H7v-2.5H5zm2 3v6h10v-6z',
  hat:'M8 3h8v12h4.5v3.5h-17V15H8z',
  key:'M15 2.5a6.5 6.5 0 1 1-5 10.7L4.5 18.7V21.5h-3v-3l7.6-7.6A6.5 6.5 0 0 1 15 2.5zm1.6 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z'
};
const STICKERS=[
  ['first','First fare','Drop off a passenger','#F2C230','cab',c=>c.fares>=1],
  ['fares10','Busy driver','Finish 10 taxi fares','#F57F1F','cab',c=>c.fares>=10],
  ['music','DJ','Play a passenger’s favourite station','#7A4FA8','note',c=>c.music>=1],
  ['cake','Cake hero','Deliver a birthday cake with no bumps','#E87AA4','cake',c=>c.cake>=1],
  ['hurry','Just in time','Get a late passenger there in time','#C91A09','clock',c=>c.hurry>=1],
  ['park3','Perfect park','Park in a bay for three stars','#0A5BC4','P',c=>c.park3>=1],
  ['kind','Kind driver','Wait for walkers at a zebra crossing','#2E8B4A','heart',c=>c.kind>=1],
  ['kind5','Road angel','Wait at five zebra crossings','#1A8F8A','heart',c=>c.kind>=5],
  ['mud','Mud monster','Get completely covered in mud','#6B3B1F','drop',c=>c.mud>=1],
  ['wash','Squeaky clean','Wash off the mud at the Car Wash','#36AEBF','bubbles',c=>c.wash>=1],
  ['air','Big air','Fly for nearly a second off a ramp','#F57F1F','jump',c=>c.air>=1],
  ['gold5','Treasure hunter','Find five golden studs','#E3A300','stud',()=>save.golden.length>=5],
  ['goldall','Gold master','Find every golden stud','#E3A300','crown',()=>GOLD_TOTAL>0&&save.golden.length>=GOLD_TOTAL],
  ['night','Night owl','Finish a job after dark','#203A72','moon',c=>c.night>=1],
  ['pizza','Hot delivery','Deliver a pizza while it’s still hot','#C91A09','pizza',c=>c.hotpizza>=1],
  ['ice','Ice cream dream','Sell ten ice creams','#E87AA4','cone',c=>c.icecream>=10],
  ['bus','All aboard','Drive the whole bus route','#C91A09','bus',c=>c.busroute>=1],
  ['radio','Radio star','Listen to all three stations','#1A8F8A','note',c=>c.st_dance&&c.st_jazz&&c.st_pop],
  ['style','Looking sharp','Buy something in the garage','#7A4FA8','hat',c=>c.bought>=1],
  ['fleet','Fleet owner','Own all four vehicles','#5F6266','key',()=>save.owned.vehicles.length>=4]
];
const badgeSVG=(col,icon,locked)=>`<div class="badge${locked?' locked':''}" style="--bc:${col}"><svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="${ICONS[icon]}"/></svg></div>`;
const stickerQueue=[];let stickerShowing=false;
function count(k,n){save.counts[k]=(save.counts[k]||0)+(n||1);checkStickers();persist();}
function checkStickers(){
  for(const [id,name,desc,col,icon,test] of STICKERS){
    if(save.stickers.includes(id)||!test(save.counts))continue;
    save.stickers.push(id);stickerQueue.push([name,desc,col,icon]);save.studs+=10;
  }
  updateWallet();showSticker();
}
function showSticker(){
  if(stickerShowing||!stickerQueue.length)return;stickerShowing=true;
  const [name,desc,col,icon]=stickerQueue.shift();
  const el=$('sticker');el.innerHTML=badgeSVG(col,icon)+`<b>${name}</b><span>New sticker! +10 studs</span>`;
  el.classList.add('show');sfx.sticker();$('bookDot').hidden=false;
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>{stickerShowing=false;showSticker();},400);},2600);
}
function renderBook(){
  $('bProgress').textContent=save.stickers.length+' of '+STICKERS.length;
  $('bGrid').innerHTML=STICKERS.map(([id,name,desc,col,icon])=>{const got=save.stickers.includes(id);return`<div class="stk">${badgeSVG(col,icon,!got)}<b>${got?name:'???'}</b><small>${desc}</small></div>`;}).join('');
}

/* ---------- garage ---------- */
let gTab='vehicles',resetArmed=false,showHowTo=false;
const coinHTML=n=>`<span class="price"><i class="coin"></i>${n}</span>`;
function renderGarage(){
  const tabs=[['vehicles','Vehicles'],['paint','Paint'],['driver','Driver'],['settings','Settings']];
  $('gTabs').innerHTML=tabs.map(([id,l])=>`<button class="tab" role="tab" aria-selected="${gTab===id}" data-tab="${id}">${l}</button>`).join('');
  let h='';
  if(gTab==='vehicles'){
    h+='<div class="sec">Choose what to drive</div><div class="grid">';
    for(const k in VEH){const v=VEH[k],own=save.owned.vehicles.includes(k),cur=save.vehicle===k;
      h+=`<button class="item${!own&&save.studs<v.price?' cant':''}" aria-pressed="${cur}" data-veh="${k}"><b>${v.name}</b><small>${v.desc}</small>${cur?'<small>Driving now</small>':own?'<small>Tap to drive</small>':coinHTML(v.price)}</button>`;}
    h+='</div><p class="note">Each vehicle has its own jobs. Earn studs from fares, deliveries and golden studs.</p>';
  }else if(gTab==='paint'){
    const cur=save.paint[save.vehicle]||VEH[save.vehicle].paint;
    h+=`<div class="sec">Paint for the ${VEH[save.vehicle].name.toLowerCase()}</div><div class="swatches">`;
    PAINTS.forEach(([name,col,price])=>{const own=!price||save.owned.paints.includes(col);h+=`<button class="sw" style="background:${col}" aria-label="${name}" aria-pressed="${cur===col}" data-paint="${col}" data-price="${price}">${own?'':`<span class="lock"><i class="coin" style="width:10px;height:10px"></i>${price}</span>`}</button>`;});
    h+='</div><p class="note">Paint you buy works on every vehicle.</p>';
  }else if(gTab==='driver'){
    const d=save.driver;
    h+='<div class="sec">Hat or hair</div><div class="grid">';
    HATS.forEach(o=>{const own=!o.price||save.owned.hats.includes(o.id);h+=`<button class="item${!own&&save.studs<o.price?' cant':''}" aria-pressed="${d.hat===o.id}" data-hat="${o.id}"><b>${o.name}</b>${own?'<small>'+(d.hat===o.id?'Wearing':'Tap to wear')+'</small>':coinHTML(o.price)}</button>`;});
    h+='</div>';
    const sw=(key,list,label)=>`<div class="sec">${label}</div><div class="swatches">${list.map(c=>`<button class="sw" style="background:${c}" aria-label="${label} ${c}" aria-pressed="${d[key]===c}" data-dk="${key}" data-dv="${c}"></button>`).join('')}</div>`;
    h+=sw('hatCol',SHIRTS,'Hat colour')+sw('shirt',SHIRTS,'Shirt')+sw('legs',SHIRTS,'Trousers')+sw('hair',HAIRS,'Hair colour')+sw('skin',SKINS,'Skin');
  }else{
    const opt=(group,val,label,cur)=>`<button class="opt" data-set="${group}" data-val="${val}" aria-pressed="${cur===val}">${label}</button>`;
    h+='<div class="sec">Graphics</div><div class="row">'+opt('detail','high','High detail',DETAIL)+opt('detail','low','Low detail',DETAIL)+'</div><p class="note">Low detail runs more smoothly on older tablets. Changing it restarts the game; your progress is kept.</p>';
    h+='<div class="sec">Steering</div><div class="row">'+opt('steer','stick','Drag stick',save.steer||'stick')+opt('steer','buttons','Left and right buttons',save.steer||'stick')+'</div><p class="note">Buttons can be easier for small thumbs.</p>';
    h+='<div class="sec">Controls</div><div class="row"><button class="opt" data-set="move">Move the controls</button></div><p class="note">Drag the steering and pedals anywhere on the screen. Handy if part of the screen doesn’t respond well.</p>';
    const installed=matchMedia('(display-mode: standalone),(display-mode: fullscreen)').matches;
    h+='<div class="sec">Home screen</div>'+(installed?'<p class="note">Brickton is already running as a home-screen app.</p>':'<div class="row"><button class="opt" data-set="install">Add Brickton to the home screen</button></div>'+(showHowTo?`<ol class="howto"><li>Close the garage, then tap the <b>⋮</b> menu at the top right of Silk (outside the game).</li><li>Choose <b>Add to Home Screen</b>, name it <b>Brickton</b> and tap <b>Add</b>.</li><li>No option there? The tablet is probably on a child profile. A grown-up can add the website from the parent settings (Amazon Kids or Parental Controls), or switch to the adult profile to add the shortcut.</li></ol>`:''));
    h+=`<div class="sec">Speed check</div><p class="note">This device is drawing about <b>${Math.round(fpsAvg)}</b> frames a second at ${DETAIL==='low'?'Low':'High'} detail. Over 25 feels smooth.</p>`;
    h+='<div class="sec">Time of day</div><div class="row">'+opt('time','auto','Day and night',save.time)+opt('time','day','Always day',save.time)+opt('time','night','Always night',save.time)+'</div>';
    h+='<div class="sec">Sound</div><div class="row">'+opt('sound','on','Sound on',save.sound?'on':'off')+opt('sound','off','Sound off',save.sound?'on':'off')+'</div>';
    h+=`<div class="sec">Progress</div><div class="row"><button class="opt danger" data-set="reset">${resetArmed?'Tap again to erase everything':'Start again from zero'}</button></div><p class="note">Progress is saved on this device.</p>`;
  }
  $('gBody').innerHTML=h;
}
function refreshVehicle(){const keep={speed:car.speed};spawnVehicle(save.vehicle);car.speed=keep.speed;}
function deny(need){sfx.boop();toast('Not enough studs yet',`You need ${need-save.studs} more`);}
$('garage').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.tab){gTab=b.dataset.tab;resetArmed=false;sfx.click();renderGarage();return;}
  if(b.dataset.veh){const k=b.dataset.veh,v=VEH[k];
    if(!save.owned.vehicles.includes(k)){if(save.studs<v.price)return deny(v.price);save.studs-=v.price;save.owned.vehicles.push(k);sfx.cash();count('bought');}
    if(save.vehicle!==k){save.vehicle=k;spawnVehicle(k);startJob();}
    sfx.click();persist();updateWallet();renderGarage();return;}
  if(b.dataset.paint){const col=b.dataset.paint,price=+b.dataset.price;
    if(price&&!save.owned.paints.includes(col)){if(save.studs<price)return deny(price);save.studs-=price;save.owned.paints.push(col);sfx.cash();count('bought');}
    save.paint[save.vehicle]=col;refreshVehicle();sfx.click();persist();updateWallet();renderGarage();return;}
  if(b.dataset.hat){const o=HATS.find(x=>x.id===b.dataset.hat);
    if(o.price&&!save.owned.hats.includes(o.id)){if(save.studs<o.price)return deny(o.price);save.studs-=o.price;save.owned.hats.push(o.id);sfx.cash();count('bought');}
    save.driver.hat=o.id;refreshVehicle();sfx.click();persist();updateWallet();renderGarage();return;}
  if(b.dataset.dk){save.driver[b.dataset.dk]=b.dataset.dv;refreshVehicle();sfx.click();persist();renderGarage();return;}
  if(b.dataset.set==='detail'){if(b.dataset.val!==DETAIL){store.set('detail',b.dataset.val);persist();location.reload();}return;}
  if(b.dataset.set==='steer'){save.steer=b.dataset.val;applySteerMode();persist();sfx.click();renderGarage();return;}
  if(b.dataset.set==='install'){if(installEvt)doInstall();else{showHowTo=true;renderGarage();}return;}
  if(b.dataset.set==='move'){startEdit();return;}
  if(b.dataset.set==='time'){save.time=b.dataset.val;persist();sfx.click();renderGarage();return;}
  if(b.dataset.set==='sound'){const want=b.dataset.val==='on';if(want!==sfx.on)sfx.toggle();save.sound=want;persist();renderGarage();return;}
  if(b.dataset.set==='reset'){if(!resetArmed){resetArmed=true;renderGarage();return;}store.clear();location.reload();}
});
function openPanel(id){
  if(attract)return;
  garageOpen=id==='garage';bookOpen=id==='book';
  $('garage').hidden=id!=='garage';$('book').hidden=id!=='book';
  $('hud').style.visibility='hidden';input.throttle=input.brake=input.steer=0;
  if(id==='garage'){resetArmed=false;renderGarage();}else{renderBook();$('bookDot').hidden=true;}
  sfx.click();
}
function closePanels(){garageOpen=bookOpen=false;$('garage').hidden=true;$('book').hidden=true;$('hud').style.visibility='visible';camInit=false;}
$('garageBtn').addEventListener('click',()=>openPanel('garage'));
$('bookBtn').addEventListener('click',()=>openPanel('book'));
$('gClose').addEventListener('click',closePanels);$('bClose').addEventListener('click',closePanels);

/* ---------- input ---------- */
function hold(el,onDown,onUp){
  const down=e=>{e.preventDefault();sfx.init();try{el.setPointerCapture(e.pointerId);}catch(_){}el.classList.add('on');onDown();};
  const up=()=>{el.classList.remove('on');onUp();};
  el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',up);
}
hold($('go'),()=>input.throttle=1,()=>input.throttle=0);
hold($('brake'),()=>input.brake=1,()=>input.brake=0);
hold($('hornBtn'),()=>sfx.horn(V.type),()=>{});
function updateRadioTag(){const s=sfx.station,tag=$('radioTag');tag.hidden=s==='off';tag.innerHTML=`Brick FM <em>${STN[s]||''}</em>`;$('radioBtn').classList.toggle('live',s!=='off');}
function nextStation(){const s=sfx.nextStation();updateRadioTag();toast(s==='off'?'Radio off':`Brick FM · ${STN[s]}`,s==='off'?'':'Tap Radio again to change station',1400);if(s!=='off')count('st_'+s);persist();}
hold($('radioBtn'),nextStation,()=>{});
{
  const zone=$('steerZone'),pad=$('pad'),knob=$('knob');let id=null,sx=0;
  zone.addEventListener('pointerdown',e=>{e.preventDefault();sfx.init();if(id!==null)return;id=e.pointerId;try{zone.setPointerCapture(id);}catch(_){}const r=zone.getBoundingClientRect();sx=e.clientX;
    if(editing){placePad(e.clientX-r.left,e.clientY-r.top);return;}
    pad.style.left=(e.clientX-r.left)+'px';pad.style.top=(e.clientY-r.top)+'px';});
  /* small dead zone, full lock after a short drag */
  zone.addEventListener('pointermove',e=>{if(e.pointerId!==id)return;if(editing){const r=zone.getBoundingClientRect();placePad(e.clientX-r.left,e.clientY-r.top);return;}const dx=e.clientX-sx,m=Math.max(0,Math.abs(dx)-3);const d=Math.sign(dx)*Math.min(1,m/38);input.steer=d;knob.style.transform=`translateX(${d*56}px)`;});
  const end=e=>{if(e.pointerId!==id)return;id=null;input.steer=0;knob.style.transform='';padHome();};
  function placePad(x,y){const r=zone.getBoundingClientRect();x=clamp(x,96,r.width-96);y=clamp(y,50,r.height-50);pad.style.left=x+'px';pad.style.top=y+'px';save.layout=save.layout||{};save.layout.steer={x:x/r.width,y:y/r.height};}
  function padHome(){const L=save.layout&&save.layout.steer;if(L){const r=zone.getBoundingClientRect();pad.style.left=(L.x*r.width)+'px';pad.style.top=(L.y*r.height)+'px';}else{pad.style.left='';pad.style.top='';}}
  window._padHome=padHome;
  zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);zone.addEventListener('lostpointercapture',end);
}
/* optional big left/right buttons instead of the drag stick */
{
  let l=0,r=0;const sync=()=>{input.steer=r-l;};
  hold($('leftBtn'),()=>{l=1;sync();},()=>{l=0;sync();});
  hold($('rightBtn'),()=>{r=1;sync();},()=>{r=0;sync();});
}
function applySteerMode(){const b=save.steer==='buttons';$('steerBtns').hidden=!b;$('steerZone').hidden=b;input.steer=0;}
/* ---------- move the controls: for screens with a worn patch ---------- */
let editing=false;
function placeEl(el,key,x,y){const w=innerWidth,h=innerHeight,b=el.getBoundingClientRect();x=clamp(x,4,w-b.width-4);y=clamp(y,60,h-b.height-4);el.style.left=x+'px';el.style.top=y+'px';el.style.right='auto';el.style.bottom='auto';save.layout=save.layout||{};save.layout[key]={x:x/w,y:y/h};}
function applyLayout(){
  const L=save.layout||{};
  [['pedals',document.querySelector('.pedals')],['btns',$('steerBtns')]].forEach(([k,el])=>{if(L[k]){el.style.left=(L[k].x*innerWidth)+'px';el.style.top=(L[k].y*innerHeight)+'px';el.style.right='auto';el.style.bottom='auto';}else{el.style.left=el.style.top=el.style.right=el.style.bottom='';}});
  if(window._padHome)window._padHome();
}
[['pedals',document.querySelector('.pedals')],['btns',$('steerBtns')]].forEach(([k,el])=>{
  let pid=null,ox=0,oy=0;
  el.addEventListener('pointerdown',e=>{if(!editing)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;const b=el.getBoundingClientRect();ox=e.clientX-b.left;oy=e.clientY-b.top;try{el.setPointerCapture(pid);}catch(_){}},true);
  el.addEventListener('pointermove',e=>{if(!editing||e.pointerId!==pid)return;placeEl(el,k,e.clientX-ox,e.clientY-oy);});
  const up=e=>{if(e.pointerId===pid)pid=null;};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
});
function startEdit(){closePanels();editing=true;document.body.classList.add('editing');$('editBar').hidden=false;input.throttle=input.brake=input.steer=0;}
function endEdit(){editing=false;document.body.classList.remove('editing');$('editBar').hidden=true;persist();applyLayout();toast('Controls moved','Change them again in Garage › Settings',1800);}
$('editDone').addEventListener('click',endEdit);
$('editReset').addEventListener('click',()=>{delete save.layout;applyLayout();persist();});
addEventListener('resize',()=>setTimeout(applyLayout,50));
/* install as an app where the browser offers it */
let installEvt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$('installBtn').hidden=false;});
async function doInstall(){if(!installEvt)return;installEvt.prompt();try{await installEvt.userChoice;}catch(_){}installEvt=null;$('installBtn').hidden=true;if(garageOpen)renderGarage();}
$('installBtn').addEventListener('click',doInstall);
const keys={};
addEventListener('keydown',e=>{
  if(e.repeat)return;keys[e.code]=true;sfx.init();
  if(e.code==='KeyH')sfx.horn(V.type);if(e.code==='KeyC')$('camBtn').click();if(e.code==='KeyR')nextStation();if(e.code==='KeyG')garageOpen?closePanels():openPanel('garage');
  if(e.code==='Escape')closePanels();
  if(attract&&(e.code==='Enter'||e.code==='Space')&&!$('play').disabled)startGame();
  syncKeys();});
addEventListener('keyup',e=>{keys[e.code]=false;syncKeys();});
function syncKeys(){input.keySteer=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
  input.throttle=(keys.ArrowUp||keys.KeyW||$('go').classList.contains('on'))?1:0;
  input.brake=(keys.ArrowDown||keys.KeyS||keys.Space||$('brake').classList.contains('on'))?1:0;}
$('camBtn').addEventListener('click',()=>{camMode=(camMode+1)%2;toast(camMode?'High camera':'Close camera','',900);});
$('fsBtn').addEventListener('click',()=>{const d=document,el=d.documentElement;try{if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);}else{const p=(el.requestFullscreen||el.webkitRequestFullscreen).call(el);if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(_){}}).catch(()=>toast('Full screen isn’t available here','',1600));}}catch(_){toast('Full screen isn’t available here','',1600);}});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});

/* ---------- start ---------- */
function startGame(){
  if(!attract)return;attract=false;sfx.init();
  $('start').classList.add('gone');$('hud').style.visibility='visible';camInit=false;
  startJob();updateRadioTag();
  toast(save.counts.fares||save.studs?'Welcome back to Brickton!':'Follow the yellow arrow','Pick up the passenger waving at the kerb',2800);
}
$('play').addEventListener('click',startGame);
$('hud').style.visibility='hidden';

/* ---------- resize + quality watch ---------- */
function resize(){
  const w=host.clientWidth,h=host.clientHeight;
  renderer.setPixelRatio(pixelRatio);renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();
  const dw=Math.floor(w*pixelRatio),dh=Math.floor(h*pixelRatio);
  makeRT(dw,dh);postMat.uniforms.uRes.value.set(dw,dh);postMat.uniforms.uAmt.value=6.5*pixelRatio;
}
addEventListener('resize',resize);
let qFrames=0,qAcc=0,qChecks=0,qTime=0;
function watchQuality(raw){
  if(attract||garageOpen||bookOpen||qChecks>=4)return;
  qTime+=raw;if(qTime<3)return;
  qFrames++;qAcc+=raw;
  if(qFrames>=150){const avg=qAcc/qFrames;qFrames=0;qAcc=0;qChecks++;
    if(avg>1/36){
      if(usePost){usePost=false;pixelRatio=Math.min(pixelRatio,1.25);resize();store.set('detail','low');toast('Switched to smoother graphics','Change it any time in Garage › Settings',2600);}
      else if(pixelRatio>.6){pixelRatio=Math.max(.6,pixelRatio*.8);resize();}
    }
  }
}

/* ---------- main loop ---------- */
const clock=new T.Clock();let elapsed=0,saveClock=0;
function frame(){
  requestAnimationFrame(frame);
  /* slower tablets get several small physics steps per frame so the game never runs in slow motion */
  const raw=clock.getDelta(),total=Math.min(raw,.2),steps=Math.max(1,Math.ceil(total/(1/30)-.01)),dt=total/steps;
  fpsAvg=lerp(fpsAvg,1/Math.max(raw,1e-3),.05);
  const paused=garageOpen||bookOpen||editing;
  updateSky(total);
  if(!attract&&!paused){
    for(let k=0;k<steps;k++){frameDt=dt;elapsed+=dt;
      updateCar(dt);updateGearbox(dt);updateMud(dt);updateGolds(dt,elapsed);updateCones(dt);
      if(job)job.update(dt,elapsed);
      updateCrossings(dt,elapsed);}
  }else{elapsed+=total;frameDt=total;sfx.engine(.1,0,attract?0:.03,V.type);updateGolds(0,elapsed);}
  const dtv=total;
  updateFolk(dtv,elapsed);updateTrain(dtv);updateAmbient(dtv,elapsed);updateBeacon(elapsed);
  updateCamera(dtv,elapsed);
  stepPool(debris,dtv,30);stepPool(puffs,dtv,-2,'grow');stepPool(sparks,dtv,-1,'face');
  postMat.uniforms.uTime.value=elapsed%10;
  renderer.setRenderTarget(usePost&&rt?rt:null);renderer.render(scene,camera);
  stats.calls=renderer.info.render.calls;stats.tris=renderer.info.render.triangles;stats.ms=Math.round(raw*1000);
  if(usePost&&rt){postMat.uniforms.tDiffuse.value=rt.texture;renderer.setRenderTarget(null);renderer.render(postScene,postCam);}
  watchQuality(raw);
  saveClock+=dtv;if(saveClock>10){saveClock=0;persist();}
}
const stats={calls:0,tris:0};let fpsAvg=30;

/* ---------- boot: build the town after the start card has painted ---------- */
function boot(){
  const t0=performance.now();
  SIMPLE_BOXES=LOW;
  buildWorld();
  const PARK=[P.red,P.blue,P.white,P.green,P.orange,P.azure,P.black,P.lgrey,P.purple,P.teal];
  bays.forEach((b,i)=>{if(rnd()<.42){b.taken=true;putVehicle('cab',{paint:pick(PARK),taxi:false,roof:rnd()<.5},b.x,.47,b.z,b.rot+(rnd()-.5)*.08);addBox(b.x-2.6,b.z-4.9,b.x+2.6,b.z+4.9,P.lgrey,7);}});
  finalizeChunks();SIMPLE_BOXES=false;
  buildGolds();buildLightBeam();buildCones();spawnFolk();
  if(!save.owned.vehicles.includes(save.vehicle))save.vehicle='cab';
  spawnVehicle(save.vehicle);
  car.y=groundAt(car.x,car.z);V.group.position.set(car.x,car.y,car.z);V.group.rotation.y=car.h;
  updateWallet();resize();applySteerMode();applyLayout();
  buildMs=Math.round(performance.now()-t0);
  $('play').disabled=false;$('play').textContent=save.studs||save.counts.fares?'Keep driving':'Start driving';
  frame();
}
let buildMs=0;
window.BC={recam(){camInit=false;},cam:camera,step(n,dt){for(let i=0;i<n;i++){updateCar(dt);updateGearbox(dt);updateMud(dt);updateGolds(dt,elapsed);updateCones(dt);if(job)job.update(dt,elapsed);updateCrossings(dt,elapsed);updateFolk(dt,elapsed);elapsed+=dt;}},car,input,get V(){return V;},get job(){return job;},scene,save,places,goldSpots,busStops,iceSpots,bays,crossings,get stats(){return stats;},get buildMs(){return buildMs;},start:startGame,openPanel,closePanels,taxiJob,pizzaJob,iceJob,busJob,startJob,spawnVehicle,get golds(){return golds;},blocked,groundAt,get night(){return night;},setDay(t){dayT=t;},LOW,count};
/* signs are painted with the display font, so wait for it (but never for long) */
let booted=false;const go=()=>{if(!booted){booted=true;boot();}};
try{document.fonts.load('80px "Lilita One"').then(()=>setTimeout(go,30),go);}catch(e){}
setTimeout(go,2500);

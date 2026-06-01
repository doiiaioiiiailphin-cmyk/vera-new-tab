(function(){
'use strict';

var container=null,canvas=null,ctx=null,active=false,dynamic=true,performanceMode=false,bodyMode='earth',raf=0,lastTime=0;
var points=[],stars=[],latLines=[],lonLines=[],moonParticles=[],saturnParticles=[],saturnRingColors=[],moonModelSamples=[],saturnModelSamples=[],moonAngle=-0.42,initialRotation={x:-0.12,y:-0.18,z:-0.18};
var orientation=quatFromEuler(initialRotation.x,initialRotation.y,initialRotation.z);
var velocity={x:0,y:0},dragging=false,lastPointer=null;
var palette={},pixelRatio=1,width=1,height=1,earthRadius=1,center={x:0,y:0},moonTextureReady=false,moonImage=null,saturnTextureReady=false,saturnDiffuseImage=null,saturnRingsImage=null;
var interactiveSelector='a,button,input,textarea,select,canvas,.top-bar,.settings-overlay,.settings-panel,.modal-overlay,#freeContextMenu,.free-context-menu,.free-layout-item,.free-folder-panel,.link-card,.add-link-card,.widget,.search-box,.engine-dropdown,.suggest-dropdown,.theme-card,.radio-option,.btn,.toggle-switch,.pomodoro-time,.pomodoro-chip,.pomodoro-btn,.todo-item,.todo-input,.game-carousel,.game-stage,.clock-wrap,.clock-time,.clock-date';

window.VeraEarthScene={setActive:setActive,refreshTheme:refreshTheme};
document.dispatchEvent(new CustomEvent('vera:earth-ready'));

function setActive(opts){
opts=opts||{};
active=!!opts.active;
dynamic=opts.dynamic!==false;
var perf=!!opts.performance,perfChanged=perf!==performanceMode;
var nextBody=['earth','saturn','moon'].indexOf(opts.body)>=0?opts.body:'earth';
var bodyChanged=nextBody!==bodyMode;
performanceMode=perf;
bodyMode=nextBody;
ensure();
if(!container)return;
if(perfChanged)rebuildGeometry();
if(bodyChanged)resetOrientation();
container.style.display=active?'':'none';
container.classList.toggle('on',active);
document.body.classList.toggle('earth-bg',active);
if(active){refreshTheme();resize();start();}else{stop();endDrag();}
}

function ensure(){
if(container)return;
container=document.getElementById('earthScene');
if(!container)return;
canvas=document.createElement('canvas');
canvas.className='earth-canvas';
canvas.setAttribute('aria-hidden','true');
container.appendChild(canvas);
ctx=canvas.getContext('2d',{alpha:true});
rebuildGeometry();
loadModelSamples();
loadMoonTexture();
loadSaturnTextures();
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('pointermove',onPointerMove,{passive:false});
document.addEventListener('pointerdown',onPointerDown,{passive:false});
document.addEventListener('pointerup',onPointerUp,{passive:true});
document.addEventListener('pointercancel',onPointerUp,{passive:true});
document.addEventListener('dragstart',function(e){if(dragging)e.preventDefault();});
document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(active){render();start();}});
}

function createGeometry(){
var target=getParticleCount(),idx=0;
points=[];
while(points.length<target&&idx<target*8){
  var u=fract(Math.sin(idx*12.9898)*43758.5453);
  var v=fract(Math.sin(idx*78.233)*24634.6345);
  var lat=90-Math.acos(1-2*u)*180/Math.PI;
  var lon=v*360-180;
  var land=isLand(lat,lon);
  var keep=land||fract(Math.sin(idx*37.719)*9513.135)<0.22;
  if(keep){
    var p=spherePoint(lat,lon);
    var rnd=fract(Math.sin(idx*91.7)*845.2);
    points.push({
      x:p.x,y:p.y,z:p.z,
      land:land,
      size:land?(0.82+rnd*1.28):(0.34+rnd*0.62),
      alpha:land?(0.56+rnd*0.34):(0.08+rnd*0.13),
      tint:land?(0.58+rnd*0.38):(0.08+rnd*0.18)
    });
  }
  idx++;
}
var steps=performanceMode?84:150;
latLines=(performanceMode?[-55,-25,25,55]:[-60,-35,-15,15,35,60]).map(function(deg){var arr=[];for(var j=0;j<=steps;j++)arr.push(spherePoint(deg,j/steps*360-180));return arr;});
lonLines=[];var lonCount=performanceMode?6:8;for(var l=0;l<lonCount;l++){var line=[];var lon=l*(360/lonCount)-180;for(var k=0;k<=steps;k++)line.push(spherePoint(k/steps*180-90,lon));lonLines.push(line);}
stars=[];var sc=performanceMode?(window.innerWidth<700?36:68):(window.innerWidth<700?95:170);for(var s=0;s<sc;s++)stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.1+0.2,a:Math.random()*0.26+0.08});
}

function spherePoint(lat,lon){
var la=lat*Math.PI/180,lo=lon*Math.PI/180,cl=Math.cos(la);
return{x:cl*Math.sin(lo),y:Math.sin(la),z:cl*Math.cos(lo)};
}

function isLand(lat,lon){
return lat<-64||
ellipse(lat,lon,49,-105,25,46,-0.25)||ellipse(lat,lon,24,-101,14,26,-0.1)||ellipse(lat,lon,62,-150,10,23,0.05)||
ellipse(lat,lon,-16,-60,34,15,0.18)||ellipse(lat,lon,70,-42,12,20,0.05)||
ellipse(lat,lon,49,62,24,88,0.04)||ellipse(lat,lon,48,11,16,28,-0.15)||ellipse(lat,lon,7,22,38,22,-0.12)||
ellipse(lat,lon,-25,134,12,19,0.08)||ellipse(lat,lon,-42,173,5,8,0);
}

function ellipse(lat,lon,clat,clon,rlat,rlon,tilt){
var x=wrapLon(lon-clon),y=lat-clat,c=Math.cos(tilt||0),s=Math.sin(tilt||0);
var xr=x*c-y*s,yr=x*s+y*c;
return (xr*xr)/(rlon*rlon)+(yr*yr)/(rlat*rlat)<1;
}

function loadMoonTexture(){
var img=new Image();
img.onload=function(){moonImage=img;sampleMoonTexture(img);moonTextureReady=true;render();};
img.onerror=function(){moonTextureReady=false;};
img.src='assets/moon-nasa-model-1024.jpg';
}

function loadModelSamples(){
if(typeof fetch!=='function')return;
fetch('assets/moon-nasa-model-samples.json').then(function(r){return r.ok?r.json():[];}).then(function(data){moonModelSamples=Array.isArray(data)?data:[];if(moonImage)sampleMoonTexture(moonImage);render();}).catch(function(){moonModelSamples=[];});
fetch('assets/saturn-nasa-model-samples.json').then(function(r){return r.ok?r.json():[];}).then(function(data){saturnModelSamples=Array.isArray(data)?data:[];if(saturnDiffuseImage)sampleSaturnTexture(saturnDiffuseImage);render();}).catch(function(){saturnModelSamples=[];});
}

function loadSaturnTextures(){
var diffuse=new Image();
diffuse.onload=function(){saturnDiffuseImage=diffuse;sampleSaturnTexture(diffuse);saturnTextureReady=true;render();};
diffuse.onerror=function(){saturnTextureReady=false;createFallbackSaturnParticles();};
diffuse.src='assets/saturn-nasa-diffuse-1024.jpg';
var rings=new Image();
rings.onload=function(){saturnRingsImage=rings;sampleSaturnRings(rings);render();};
rings.onerror=function(){saturnRingColors=createFallbackSaturnRingColors();};
rings.src='assets/saturn-nasa-rings.png';
}

function sampleMoonTexture(img){
if(moonModelSamples.length){moonParticles=sampleModelTexture(img,moonModelSamples,getMoonParticleCount(),'moon');return;}
var c=document.createElement('canvas'),w=256,h=128;
c.width=w;c.height=h;
var cx=c.getContext('2d');
cx.drawImage(img,0,0,w,h);
var data=cx.getImageData(0,0,w,h).data;
moonParticles=[];
var count=getMoonParticleCount();
for(var i=0;i<count;i++){
  var u=(i+0.5)/count,v=fract(Math.sin(i*41.223)*13457.9);
  var theta=Math.acos(1-2*u),phi=2*Math.PI*v;
  var lat=90-theta*180/Math.PI,lon=phi*180/Math.PI-180;
  var px=Math.max(0,Math.min(w-1,Math.floor((lon+180)/360*w)));
  var py=Math.max(0,Math.min(h-1,Math.floor((90-lat)/180*h)));
  var off=(py*w+px)*4,br=(data[off]+data[off+1]+data[off+2])/765;
  var p=spherePoint(lat,lon);
  moonParticles.push({x:p.x,y:p.y,z:p.z,r:data[off],g:data[off+1],b:data[off+2],size:0.62+br*1.15,alpha:0.46+br*0.48});
}
}

function sampleSaturnTexture(img){
if(saturnModelSamples.length){saturnParticles=sampleModelTexture(img,saturnModelSamples,getSaturnParticleCount(),'saturn');return;}
var c=document.createElement('canvas'),w=320,h=240;
c.width=w;c.height=h;
var cx=c.getContext('2d');
cx.drawImage(img,0,0,w,h);
var data=cx.getImageData(0,0,w,h).data;
saturnParticles=[];
var count=getSaturnParticleCount();
for(var i=0;i<count;i++){
  var u=(i+0.5)/count,v=fract(Math.sin(i*52.983)*23791.41);
  var theta=Math.acos(1-2*u),phi=2*Math.PI*v;
  var lat=90-theta*180/Math.PI,lon=phi*180/Math.PI-180;
  var px=Math.max(0,Math.min(w-1,Math.floor((lon+180)/360*w)));
  var py=Math.max(0,Math.min(h-1,Math.floor((90-lat)/180*h)));
  var off=(py*w+px)*4,r=data[off],g=data[off+1],b=data[off+2];
  var br=(r+g+b)/765;
  if(br<0.045){i--;continue;}
  var p=spherePoint(lat,lon);
  var band=0.72+0.28*Math.abs(Math.sin(lat*Math.PI/9));
  saturnParticles.push({x:p.x,y:p.y,z:p.z,r:r,g:g,b:b,size:0.46+br*1.08,alpha:(0.34+br*0.46)*band});
}
}

function sampleModelTexture(img,samples,count,mode){
var size=mode==='moon'?384:320;
var c=document.createElement('canvas'),w=size,h=size;
c.width=w;c.height=h;
var cx=c.getContext('2d');
cx.drawImage(img,0,0,w,h);
var data=cx.getImageData(0,0,w,h).data,out=[],limit=Math.min(count,samples.length);
for(var i=0;i<limit;i++){
  var s=samples[i],x=s[0],y=s[1],z=s[2],u=s[3],v=s[4];
  u=clamp(u,0,0.9999);v=clamp(v,0,0.9999);
  var px=Math.max(0,Math.min(w-1,Math.floor(u*w)));
  var py=Math.max(0,Math.min(h-1,Math.floor((1-v)*h)));
  var off=(py*w+px)*4,r=data[off],g=data[off+1],b=data[off+2],br=(r+g+b)/765;
  if(mode==='saturn'&&br<0.04)continue;
  out.push({x:x,y:y,z:z,r:r,g:g,b:b,size:(mode==='moon'?0.5:0.42)+br*(mode==='moon'?1.25:1.08),alpha:(mode==='moon'?0.36:0.3)+br*(mode==='moon'?0.54:0.5)});
}
return out;
}

function sampleSaturnRings(img){
var c=document.createElement('canvas'),w=192,h=1;
c.width=w;c.height=1;
var cx=c.getContext('2d');
cx.drawImage(img,0,0,w,1);
var data=cx.getImageData(0,0,w,1).data;
saturnRingColors=[];
for(var i=0;i<w;i++){
  var off=i*4,br=(data[off]+data[off+1]+data[off+2])/765;
  saturnRingColors.push({r:data[off],g:data[off+1],b:data[off+2],a:0.1+br*0.65});
}
}

function createFallbackMoonParticles(){
moonParticles=[];
var count=performanceMode?180:430;
for(var i=0;i<count;i++){
  var u=(i+0.5)/count,v=fract(Math.sin(i*41.223)*13457.9),theta=Math.acos(1-2*u),phi=2*Math.PI*v;
  var p={x:Math.sin(theta)*Math.cos(phi),y:Math.cos(theta),z:Math.sin(theta)*Math.sin(phi)};
  var br=0.56+0.28*Math.sin(phi*5+Math.cos(theta*7));
  moonParticles.push({x:p.x,y:p.y,z:p.z,r:205+br*35,g:210+br*32,b:218+br*28,size:0.6+br,alpha:0.45+br*0.42});
}
}

function refreshTheme(){
var dark=document.documentElement.getAttribute('data-theme')!=='light';
palette=dark?{
  bg1:'#020714',bg2:'#081a2f',land:'#b9fbff',landAlt:'#38dff2',ocean:'#215f82',line:'rgba(137,245,255,.12)',moon:'#e8eef5',star:'rgba(223,252,255,.32)',shadow:'rgba(40,210,245,.10)'
}:{
  bg1:'#eef8ff',bg2:'#d8edf8',land:'#236f96',landAlt:'#5daed2',ocean:'#9bc9dd',line:'rgba(63,131,168,.12)',moon:'#ffffff',star:'rgba(63,131,168,.18)',shadow:'rgba(70,140,175,.07)'
};
if(container){
  container.style.setProperty('--earth-bg-1',palette.bg1);
  container.style.setProperty('--earth-bg-2',palette.bg2);
}
render();
}

function start(){if(raf||document.hidden||!shouldAnimate())return;lastTime=performance.now();raf=requestAnimationFrame(tick);}
function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function tick(now){
raf=0;
if(!active||document.hidden)return;
var dt=Math.min(0.05,(now-lastTime)/1000||0.016);
lastTime=now;
if(dynamic){
  moonAngle=wrapAngle(moonAngle+dt*0.075);
  if(!dragging)applyScreenRotation(dt*0.085,0);
}
if(!dragging){
  applyScreenRotation(velocity.x*dt,velocity.y*dt);
  velocity.x*=Math.pow(0.03,dt);
  velocity.y*=Math.pow(0.03,dt);
  if(Math.abs(velocity.x)<0.0008)velocity.x=0;
  if(Math.abs(velocity.y)<0.0008)velocity.y=0;
}
render();
if(shouldAnimate())raf=requestAnimationFrame(tick);
}

function resize(){
if(!ctx||!container)return;
width=window.innerWidth||1;height=window.innerHeight||1;
pixelRatio=performanceMode?Math.min(window.devicePixelRatio||1,width<700?1:1.25):Math.min(window.devicePixelRatio||1,width<700?1.5:2);
canvas.width=Math.max(1,Math.floor(width*pixelRatio));
canvas.height=Math.max(1,Math.floor(height*pixelRatio));
canvas.style.width=width+'px';canvas.style.height=height+'px';
ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
earthRadius=Math.min(width,height)*(width<700?0.31:0.255);
center.x=width*0.5;
center.y=height*(width<700?0.54:0.535);
render();
}

function render(){
if(!ctx||!active||document.hidden)return;
ctx.clearRect(0,0,width,height);
drawStars();
if(bodyMode==='saturn'){drawSaturn();return;}
if(bodyMode==='moon'){drawMainMoon();return;}
if(moonDepth()<0)drawMoon(true);
drawAtmosphere();
drawGrid(latLines,0.24);
drawGrid(lonLines,0.18);
drawPoints();
if(moonDepth()>=0)drawMoon(false);
}

function drawStars(){
ctx.save();
ctx.fillStyle=palette.star||'rgba(255,255,255,.2)';
stars.forEach(function(star){
  ctx.globalAlpha=star.a*(0.75+0.25*Math.sin(Date.now()/1500+star.x*9));
  ctx.beginPath();ctx.arc(star.x*width,star.y*height,star.r,0,Math.PI*2);ctx.fill();
});
ctx.restore();
}

function drawAtmosphere(){
var g=ctx.createRadialGradient(center.x,center.y,earthRadius*0.45,center.x,center.y,earthRadius*1.22);
g.addColorStop(0,'rgba(255,255,255,0)');
g.addColorStop(0.64,palette.shadow||'rgba(70,230,255,.08)');
g.addColorStop(1,'rgba(255,255,255,0)');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(center.x,center.y,earthRadius*1.22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=palette.line;ctx.lineWidth=0.9;
ctx.beginPath();ctx.arc(center.x,center.y,earthRadius*1.01,0,Math.PI*2);ctx.stroke();
}

function drawGrid(lines,alpha){
ctx.save();
ctx.strokeStyle=palette.line;ctx.lineWidth=0.8;ctx.globalAlpha=alpha;
lines.forEach(function(line){
  var started=false;ctx.beginPath();
  line.forEach(function(p){var q=project(p);if(q.z<-.04){started=false;return;}if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);});
  ctx.stroke();
});
ctx.restore();
}

function drawPoints(){
var projected=points.map(function(p){var q=project(p);q.size=p.size;q.land=p.land;q.alpha=p.alpha;q.tint=p.tint;return q;}).filter(function(p){return p.z>-0.12;});
projected.sort(function(a,b){return a.z-b.z;});
projected.forEach(function(p){
  var front=clamp((p.z+0.12)/1.12,0,1),base=p.land?palette.land:palette.ocean,alt=p.land?palette.landAlt:palette.ocean;
  ctx.globalAlpha=p.alpha*(0.2+front*0.82);
  ctx.fillStyle=mixColor(base,alt,p.tint*front);
  ctx.beginPath();ctx.arc(p.x,p.y,p.size*(0.5+front*0.58),0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=1;
}

function createFallbackSaturnParticles(){
saturnParticles=[];
var count=getSaturnParticleCount();
var bands=[
  {lat:72,c:[222,199,157]},{lat:54,c:[189,147,98]},{lat:34,c:[232,204,148]},
  {lat:14,c:[166,117,78]},{lat:-6,c:[235,211,165]},{lat:-26,c:[197,151,96]},
  {lat:-48,c:[228,197,139]},{lat:-70,c:[171,129,88]}
];
for(var i=0;i<count;i++){
  var u=(i+0.5)/count,v=fract(Math.sin(i*52.983)*23791.41),theta=Math.acos(1-2*u),phi=2*Math.PI*v;
  var lat=90-theta*180/Math.PI,lon=phi*180/Math.PI-180,p=spherePoint(lat,lon),nearest=bands[0],dist=999;
  bands.forEach(function(b){var d=Math.abs(lat-b.lat);if(d<dist){dist=d;nearest=b;}});
  var wave=0.5+0.5*Math.sin((lat*0.34+lon*0.018)*Math.PI);
  saturnParticles.push({x:p.x,y:p.y,z:p.z,r:nearest.c[0]+wave*12,g:nearest.c[1]+wave*10,b:nearest.c[2]+wave*8,size:0.55+wave*0.45,alpha:0.42+wave*0.28});
}
}

function createFallbackSaturnRingColors(){
var arr=[];
for(var i=0;i<192;i++){
  var t=i/191,br=0.45+0.3*Math.sin(t*18)+0.18*Math.sin(t*47);
  arr.push({r:204+br*36,g:176+br*30,b:128+br*22,a:0.18+br*0.42});
}
return arr;
}

function drawSaturn(){
var r=earthRadius*0.72;
drawSaturnRings(r,false);
drawBodyAtmosphere(r,bodyPalette('saturn'));
drawBodyGrid(r,0.16,bodyPalette('saturn'));
drawSaturnParticles(r);
drawSaturnRings(r,true);
}

function drawBodyAtmosphere(r,colors){
colors=colors||bodyPalette(bodyMode);
var g=ctx.createRadialGradient(center.x,center.y,r*0.35,center.x,center.y,r*1.22);
g.addColorStop(0,'rgba(255,255,255,0)');
g.addColorStop(0.64,colors.shadow);
g.addColorStop(1,'rgba(255,255,255,0)');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(center.x,center.y,r*1.22,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=colors.rim;ctx.lineWidth=0.9;
ctx.beginPath();ctx.arc(center.x,center.y,r*1.01,0,Math.PI*2);ctx.stroke();
}

function drawBodyGrid(r,alpha,colors){
drawGridScaled(latLines,alpha,r,colors);
drawGridScaled(lonLines,alpha*0.78,r,colors);
}

function drawGridScaled(lines,alpha,r,colors){
colors=colors||bodyPalette(bodyMode);
ctx.save();
ctx.strokeStyle=colors.line;ctx.lineWidth=0.8;ctx.globalAlpha=alpha;
lines.forEach(function(line){
  var started=false;ctx.beginPath();
  line.forEach(function(p){var q=projectScaled(p,r);if(q.z<-.04){started=false;return;}if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);});
  ctx.stroke();
});
ctx.restore();
}

function drawSaturnParticles(r){
if(!saturnParticles.length)createFallbackSaturnParticles();
var projected=saturnParticles.map(function(p){var q=projectScaled(p,r);q.size=p.size;q.alpha=p.alpha;q.r=p.r;q.g=p.g;q.b=p.b;return q;}).filter(function(p){return p.z>-0.12;});
projected.sort(function(a,b){return a.z-b.z;});
var step=performanceMode?2:1;
projected.forEach(function(p,i){
  if(i%step)return;
  var front=clamp((p.z+0.12)/1.12,0,1);
  ctx.globalAlpha=p.alpha*(0.18+front*0.84);
  ctx.fillStyle='rgb('+Math.round(p.r)+','+Math.round(p.g)+','+Math.round(p.b)+')';
  ctx.beginPath();ctx.arc(p.x,p.y,p.size*(0.42+front*0.58),0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=1;
}

function drawSaturnRings(r,front){
var steps=performanceMode?112:190;
var rings=performanceMode?4:7;
ctx.save();
for(var ring=0;ring<rings;ring++){
  var a=1.42+ring*0.085,b=0.36+ring*0.028,color=getSaturnRingColor(ring/(rings-1||1));
  ctx.strokeStyle='rgb('+color.r+','+color.g+','+color.b+')';
  ctx.lineWidth=front?1.15:0.85;
  ctx.globalAlpha=(front?0.58:0.22)*(1-ring*0.06)*color.a;
  var started=false;ctx.beginPath();
  for(var i=0;i<=steps;i++){
    var t=i/steps*Math.PI*2,p=saturnRingPoint(t,a,b),q=projectScaled(p,r);
    if((q.z>=0)!==front){started=false;continue;}
    if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);
  }
  ctx.stroke();
}
ctx.restore();
ctx.globalAlpha=1;
}

function getSaturnRingColor(t){
if(!saturnRingColors.length)saturnRingColors=createFallbackSaturnRingColors();
var i=Math.max(0,Math.min(saturnRingColors.length-1,Math.round(t*(saturnRingColors.length-1))));
return saturnRingColors[i];
}

function saturnRingPoint(t,a,b){
var tilt=0.48,sn=Math.sin(t);
return{x:Math.cos(t)*a,y:sn*b*Math.sin(tilt),z:sn*b*Math.cos(tilt)};
}

function drawMainMoon(){
var r=earthRadius*0.86;
drawBodyAtmosphere(r,bodyPalette('moon'));
drawBodyGrid(r,0.1,bodyPalette('moon'));
drawMainMoonParticles(r);
drawMoonCraters(r);
}

function drawMainMoonParticles(r){
ctx.save();
moonParticles.forEach(function(p,i){
  if(performanceMode&&i%2)return;
  var q=projectScaled(p,r);
  if(q.z<-.08)return;
  var front=clamp((q.z+0.08)/1.08,0,1);
  ctx.globalAlpha=p.alpha*(0.28+front*0.75);
  ctx.fillStyle='rgb('+Math.round(p.r)+','+Math.round(p.g)+','+Math.round(p.b)+')';
  ctx.beginPath();ctx.arc(q.x,q.y,p.size*(0.45+front*0.55),0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=0.22;
ctx.strokeStyle=moonTextureReady?'rgba(210,220,230,.85)':'rgba(210,220,230,.55)';
ctx.beginPath();ctx.arc(center.x,center.y,r*1.02,0,Math.PI*2);ctx.stroke();
ctx.restore();
ctx.globalAlpha=1;
}

function drawMoonCraters(r){
var craters=[{lat:18,lon:-42,r:.1},{lat:-8,lon:18,r:.13},{lat:32,lon:42,r:.07},{lat:-28,lon:-10,r:.085},{lat:4,lon:70,r:.055}];
ctx.save();
ctx.strokeStyle=bodyPalette('moon').line;ctx.lineWidth=0.8;
craters.forEach(function(c){
  var q=projectScaled(spherePoint(c.lat,c.lon),r);
  if(q.z<-.05)return;
  var front=clamp((q.z+0.05)/1.05,0,1),rr=r*c.r*(0.65+front*0.35);
  ctx.globalAlpha=0.16+front*0.26;
  ctx.beginPath();ctx.ellipse(q.x,q.y,rr,rr*0.48,0.25,0,Math.PI*2);ctx.stroke();
});
ctx.restore();
ctx.globalAlpha=1;
}

function moonDepth(){return Math.sin(moonAngle);}
function drawMoon(behindEarth){
var orbitX=Math.cos(moonAngle)*earthRadius*1.62;
var orbitZ=moonDepth();
var orbitY=-earthRadius*0.54+Math.sin(moonAngle)*earthRadius*0.22;
var mx=center.x+orbitX,my=center.y+orbitY;
var r=earthRadius*(0.075+0.012*(orbitZ+1));
ctx.save();
ctx.globalAlpha=0.08;
ctx.strokeStyle=palette.line;ctx.lineWidth=0.8;
ctx.beginPath();ctx.ellipse(center.x,center.y-earthRadius*0.54,earthRadius*1.62,earthRadius*0.22,0,0,Math.PI*2);ctx.stroke();
ctx.globalAlpha=orbitZ<-.35?0.36:0.88;
if(behindEarth){
  ctx.beginPath();
  ctx.rect(0,0,width,height);
  ctx.arc(center.x,center.y,earthRadius*1.02,0,Math.PI*2,true);
  ctx.clip('evenodd');
}
    drawMoonParticles(mx,my,r,moonAngle*0.25);
ctx.restore();
}

function drawMoonParticles(mx,my,r,spin){
var c=Math.cos(spin),s=Math.sin(spin);
moonParticles.forEach(function(p){
  var x=p.x*c+p.z*s,z=-p.x*s+p.z*c,y=p.y;
  if(z<-.08)return;
  var front=clamp((z+0.08)/1.08,0,1);
  ctx.globalAlpha=p.alpha*(0.28+front*0.75);
  ctx.fillStyle='rgb('+Math.round(p.r)+','+Math.round(p.g)+','+Math.round(p.b)+')';
  ctx.beginPath();ctx.arc(mx+x*r,my+y*r,p.size*(0.45+front*0.55),0,Math.PI*2);ctx.fill();
});
ctx.globalAlpha=0.18;
ctx.strokeStyle=moonTextureReady?'rgba(210,220,230,.85)':'rgba(210,220,230,.55)';
ctx.beginPath();ctx.arc(mx,my,r*1.02,0,Math.PI*2);ctx.stroke();
}

function project(p){
return projectScaled(p,earthRadius);
}
function projectScaled(p,r){
var q=rotatePoint(p,orientation);
var depth=2.8/(2.8-q.z*0.42);
return{x:center.x+q.x*r*depth,y:center.y+q.y*r*depth,z:q.z};
}

function onPointerMove(e){
if(!dragging||!lastPointer)return;
e.preventDefault();
var dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y,dt=Math.max(16,e.timeStamp-lastPointer.t);
applyScreenRotation(dx*0.0048,-dy*0.0032);
velocity.x=dx/dt*4.2;velocity.y=-dy/dt*2.8;
lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
render();
}
function onPointerDown(e){
if(!active||e.button!==0||!canStartDrag(e.target))return;
e.preventDefault();
dragging=true;velocity.x=0;velocity.y=0;lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
container.classList.add('dragging');document.body.classList.add('earth-dragging');
start();
}
function onPointerUp(){endDrag();}
function endDrag(){if(!dragging)return;dragging=false;lastPointer=null;if(container)container.classList.remove('dragging');document.body.classList.remove('earth-dragging');start();}
function canStartDrag(target){return !(target&&target.closest&&(target.closest(interactiveSelector)||target.closest('.main-container,.settings-panel,.modal,.side-panel,#ad-sidebar')));}
function getParticleCount(){var mobile=window.innerWidth<700,cores=navigator.hardwareConcurrency||4;if(performanceMode)return mobile?(cores>=6?1200:900):(cores>=8?2600:2000);return mobile?(cores>=6?2600:2000):(cores>=8?7200:5600);}
function getMoonParticleCount(){var mobile=window.innerWidth<700,cores=navigator.hardwareConcurrency||4;if(performanceMode)return mobile?(cores>=6?720:560):(cores>=8?1400:1100);return mobile?(cores>=6?2200:1700):(cores>=8?5600:4200);}
function getSaturnParticleCount(){var mobile=window.innerWidth<700,cores=navigator.hardwareConcurrency||4;if(performanceMode)return mobile?(cores>=6?1200:900):(cores>=8?3000:2300);return mobile?(cores>=6?2600:2100):(cores>=8?7600:5800);}
function rebuildGeometry(){createGeometry();if(moonImage)sampleMoonTexture(moonImage);else createFallbackMoonParticles();if(saturnDiffuseImage)sampleSaturnTexture(saturnDiffuseImage);else createFallbackSaturnParticles();if(saturnRingsImage)sampleSaturnRings(saturnRingsImage);else saturnRingColors=createFallbackSaturnRingColors();}
function shouldAnimate(){return active&&!document.hidden&&(dynamic||dragging||Math.abs(velocity.x)>0.0008||Math.abs(velocity.y)>0.0008);}
function resetOrientation(){orientation=quatFromEuler(initialRotation.x,initialRotation.y,initialRotation.z);velocity.x=0;velocity.y=0;}
function applyScreenRotation(yaw,pitch){
if(!yaw&&!pitch)return;
var q=orientation;
if(yaw)q=quatMul(axisQuat(0,1,0,yaw),q);
if(pitch)q=quatMul(axisQuat(1,0,0,pitch),q);
orientation=quatNormalize(q);
}
function quatFromEuler(x,y,z){
var qy=axisQuat(0,1,0,y),qx=axisQuat(1,0,0,x),qz=axisQuat(0,0,1,z);
return quatNormalize(quatMul(qz,quatMul(qx,qy)));
}
function axisQuat(x,y,z,a){var h=a*0.5,s=Math.sin(h);return{x:x*s,y:y*s,z:z*s,w:Math.cos(h)};}
function quatMul(a,b){
return{
  x:a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y,
  y:a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x,
  z:a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w,
  w:a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z
};
}
function quatNormalize(q){var l=Math.hypot(q.x,q.y,q.z,q.w)||1;return{x:q.x/l,y:q.y/l,z:q.z/l,w:q.w/l};}
function rotatePoint(p,q){
var x=p.x,y=p.y,z=p.z,qx=q.x,qy=q.y,qz=q.z,qw=q.w;
var tx=2*(qy*z-qz*y),ty=2*(qz*x-qx*z),tz=2*(qx*y-qy*x);
return{x:x+qw*tx+(qy*tz-qz*ty),y:y+qw*ty+(qz*tx-qx*tz),z:z+qw*tz+(qx*ty-qy*tx)};
}
function fract(n){return n-Math.floor(n);}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function wrapAngle(v){var t=Math.PI*2;return ((v+Math.PI)%t+t)%t-Math.PI;}
function wrapLon(lon){return ((lon+540)%360)-180;}
function mixColor(a,b,t){var ca=hex(a),cb=hex(b),r=Math.round(ca[0]+(cb[0]-ca[0])*t),g=Math.round(ca[1]+(cb[1]-ca[1])*t),bl=Math.round(ca[2]+(cb[2]-ca[2])*t);return'rgb('+r+','+g+','+bl+')';}
function hex(s){s=s.replace('#','');return[parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)];}
function bodyPalette(mode){
var dark=document.documentElement.getAttribute('data-theme')!=='light';
if(mode==='saturn')return dark?{
  line:'rgba(238,204,146,.28)',rim:'rgba(250,222,168,.58)',shadow:'rgba(235,176,92,.11)'
}:{
  line:'rgba(145,102,53,.22)',rim:'rgba(182,128,66,.42)',shadow:'rgba(208,151,72,.08)'
};
if(mode==='moon')return dark?{
  line:'rgba(224,229,235,.24)',rim:'rgba(240,244,248,.58)',shadow:'rgba(215,222,232,.09)',dot:'rgb(235,238,242)'
}:{
  line:'rgba(112,122,136,.18)',rim:'rgba(148,156,168,.38)',shadow:'rgba(150,160,172,.07)',dot:'rgb(126,135,146)'
};
return{line:palette.line,rim:palette.line,shadow:palette.shadow||'rgba(70,230,255,.08)',dot:palette.moon||'rgb(232,238,245)'};
}
})();

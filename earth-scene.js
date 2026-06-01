(function(){
'use strict';

var container=null,canvas=null,ctx=null,active=false,dynamic=true,raf=0,lastTime=0;
var points=[],stars=[],latLines=[],lonLines=[],moonAngle=0,rotation={x:-0.12,y:0.4,z:-0.18};
var velocity={x:0,y:0},dragging=false,lastPointer=null,glow={x:0.5,y:0.42,tx:0.5,ty:0.42},idleGlowTimer=0;
var palette={},pixelRatio=1,width=1,height=1,earthRadius=1,center={x:0,y:0},scale=1;
var interactiveSelector='a,button,input,textarea,select,canvas,.top-bar,.settings-overlay,.settings-panel,.modal-overlay,#freeContextMenu,.free-context-menu,.free-layout-item,.free-folder-panel,.link-card,.add-link-card,.widget,.search-box,.engine-dropdown,.suggest-dropdown,.theme-card,.radio-option,.btn,.toggle-switch,.pomodoro-time,.pomodoro-chip,.pomodoro-btn,.todo-item,.todo-input,.game-carousel,.game-stage';

window.VeraEarthScene={setActive:setActive,refreshTheme:refreshTheme};
document.dispatchEvent(new CustomEvent('vera:earth-ready'));

function setActive(opts){
opts=opts||{};
active=!!opts.active;
dynamic=opts.dynamic!==false;
ensure();
if(!container)return;
container.style.display=active?'':'none';
container.classList.toggle('on',active);
document.body.classList.toggle('earth-bg',active);
if(active){
  refreshTheme();
  resize();
  start();
}else{
  stop();
}
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
createGeometry();
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('pointermove',onPointerMove,{passive:true});
document.addEventListener('pointerdown',onPointerDown);
document.addEventListener('pointerup',onPointerUp,{passive:true});
document.addEventListener('pointercancel',onPointerUp,{passive:true});
document.addEventListener('mouseleave',function(){glow.tx=0.5;glow.ty=0.42;});
document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(active)start();});
}

function createGeometry(){
var count=getParticleCount();
points=[];
for(var i=0;i<count;i++){
  var u=(i+0.5)/count;
  var v=fract(Math.sin(i*12.9898)*43758.5453);
  var theta=Math.acos(1-2*u);
  var phi=2*Math.PI*v;
  var coast=0.72+0.28*Math.sin(phi*3.1+Math.cos(theta*5.2))*Math.sin(theta*2.4);
  points.push({
    x:Math.sin(theta)*Math.cos(phi),
    y:Math.cos(theta),
    z:Math.sin(theta)*Math.sin(phi),
    size:0.75+fract(Math.sin(i*91.7)*845.2)*1.65,
    mix:coast
  });
}
latLines=[-60,-35,-15,15,35,60].map(function(deg){var a=deg*Math.PI/180,arr=[];for(var j=0;j<=150;j++){var p=j/150*Math.PI*2;arr.push({x:Math.cos(a)*Math.cos(p),y:Math.sin(a),z:Math.cos(a)*Math.sin(p)});}return arr;});
lonLines=[];for(var l=0;l<8;l++){var arr=[];var off=l*Math.PI/8;for(var k=0;k<=150;k++){var t=k/150*Math.PI*2;arr.push({x:Math.sin(t)*Math.cos(off),y:Math.cos(t),z:Math.sin(t)*Math.sin(off)});}lonLines.push(arr);}
stars=[];var sc=window.innerWidth<700?120:210;for(var s=0;s<sc;s++){stars.push({x:Math.random(),y:Math.random(),r:Math.random()*1.4+0.25,a:Math.random()*0.38+0.14});}
}

function refreshTheme(){
var dark=document.documentElement.getAttribute('data-theme')!=='light';
palette=dark?{
  bg1:'#020714',bg2:'#081a2f',glow:'#46e6ff',point:'#b9fbff',pointAlt:'#42dff4',line:'rgba(137,245,255,.22)',moon:'#e8eef5',star:'rgba(223,252,255,.44)',shadow:'rgba(40,210,245,.18)'
}:{
  bg1:'#eef8ff',bg2:'#d8edf8',glow:'#8ed8ff',point:'#2c789f',pointAlt:'#7bc5e7',line:'rgba(63,131,168,.2)',moon:'#ffffff',star:'rgba(63,131,168,.28)',shadow:'rgba(70,140,175,.14)'
};
if(container){
  container.style.setProperty('--earth-bg-1',palette.bg1);
  container.style.setProperty('--earth-bg-2',palette.bg2);
  container.style.setProperty('--earth-glow-color',palette.glow);
}
render();
}

function start(){if(raf||document.hidden)return;lastTime=performance.now();raf=requestAnimationFrame(tick);}
function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function tick(now){
raf=0;
if(!active||document.hidden)return;
var dt=Math.min(0.05,(now-lastTime)/1000||0.016);
lastTime=now;
glow.x+=(glow.tx-glow.x)*0.08;glow.y+=(glow.ty-glow.y)*0.08;
container.style.setProperty('--earth-glow-x',(glow.x*100).toFixed(2)+'%');
container.style.setProperty('--earth-glow-y',(glow.y*100).toFixed(2)+'%');
if(dynamic&&!dragging){rotation.y+=dt*0.11;moonAngle+=dt*0.32;}
if(!dragging){
  rotation.y+=velocity.x*dt;
  rotation.x+=velocity.y*dt;
  velocity.x*=Math.pow(0.08,dt);
  velocity.y*=Math.pow(0.08,dt);
}
rotation.x=clamp(rotation.x,-0.95,0.95);
render();
raf=requestAnimationFrame(tick);
}

function resize(){
if(!ctx||!container)return;
width=window.innerWidth||1;height=window.innerHeight||1;
pixelRatio=Math.min(window.devicePixelRatio||1,width<700?1.5:2);
canvas.width=Math.max(1,Math.floor(width*pixelRatio));
canvas.height=Math.max(1,Math.floor(height*pixelRatio));
canvas.style.width=width+'px';canvas.style.height=height+'px';
ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
scale=Math.min(width,height)*(width<700?0.32:0.28);
earthRadius=scale;
center.x=width*0.5;
center.y=height*(width<700?0.54:0.52);
render();
}

function render(){
if(!ctx||!active)return;
ctx.clearRect(0,0,width,height);
drawStars();
drawAtmosphere();
drawGrid(latLines,0.56);
drawGrid(lonLines,0.44);
drawPoints();
drawMoon();
}

function drawStars(){
ctx.save();
ctx.fillStyle=palette.star||'rgba(255,255,255,.3)';
stars.forEach(function(star){
  ctx.globalAlpha=star.a*(0.72+0.28*Math.sin(Date.now()/1400+star.x*9));
  ctx.beginPath();ctx.arc(star.x*width,star.y*height,star.r,0,Math.PI*2);ctx.fill();
});
ctx.restore();
}

function drawAtmosphere(){
var g=ctx.createRadialGradient(center.x,center.y,earthRadius*0.35,center.x,center.y,earthRadius*1.45);
g.addColorStop(0,'rgba(255,255,255,0)');
g.addColorStop(0.58,palette.shadow||'rgba(70,230,255,.16)');
g.addColorStop(1,'rgba(255,255,255,0)');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(center.x,center.y,earthRadius*1.45,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=palette.line;ctx.lineWidth=1.1;
ctx.beginPath();ctx.arc(center.x,center.y,earthRadius*1.02,0,Math.PI*2);ctx.stroke();
}

function drawGrid(lines,alpha){
ctx.save();
ctx.strokeStyle=palette.line;ctx.lineWidth=1;
ctx.globalAlpha=alpha;
lines.forEach(function(line){
  var started=false;
  ctx.beginPath();
  line.forEach(function(p){
    var q=project(p);
    if(q.z<-.12){started=false;return;}
    if(!started){ctx.moveTo(q.x,q.y);started=true;}else{ctx.lineTo(q.x,q.y);}
  });
  ctx.stroke();
});
ctx.restore();
}

function drawPoints(){
var projected=points.map(function(p){var q=project(p);q.size=p.size;q.mix=p.mix;return q;}).filter(function(p){return p.z>-0.18;});
projected.sort(function(a,b){return a.z-b.z;});
projected.forEach(function(p){
  var front=clamp((p.z+0.18)/1.18,0,1);
  var alpha=0.12+front*0.86;
  ctx.globalAlpha=alpha;
  ctx.fillStyle=mixColor(palette.pointAlt,palette.point,p.mix*front);
  ctx.beginPath();
  ctx.arc(p.x,p.y,p.size*(0.58+front*0.55),0,Math.PI*2);
  ctx.fill();
});
ctx.globalAlpha=1;
}

function drawMoon(){
var orbitX=Math.cos(moonAngle)*earthRadius*1.62;
var orbitZ=Math.sin(moonAngle);
var orbitY=Math.sin(moonAngle*0.72)*earthRadius*0.18-earthRadius*0.08;
var mx=center.x+orbitX;
var my=center.y+orbitY+orbitZ*earthRadius*0.08;
var r=earthRadius*(0.072+0.018*(orbitZ+1));
ctx.save();
ctx.globalAlpha=0.3;
ctx.strokeStyle=palette.line;
ctx.lineWidth=1;
ctx.beginPath();
ctx.ellipse(center.x,center.y-earthRadius*0.08,earthRadius*1.62,earthRadius*0.34,0,0,Math.PI*2);
ctx.stroke();
ctx.globalAlpha=orbitZ<-.15?0.62:0.95;
var g=ctx.createRadialGradient(mx-r*0.35,my-r*0.45,r*0.1,mx,my,r);
g.addColorStop(0,'#ffffff');g.addColorStop(0.55,palette.moon);g.addColorStop(1,'rgba(140,160,180,.78)');
ctx.fillStyle=g;
ctx.beginPath();ctx.arc(mx,my,r,0,Math.PI*2);ctx.fill();
ctx.restore();
}

function project(p){
var cx=Math.cos(rotation.x),sx=Math.sin(rotation.x),cy=Math.cos(rotation.y),sy=Math.sin(rotation.y),cz=Math.cos(rotation.z),sz=Math.sin(rotation.z);
var x=p.x,y=p.y,z=p.z;
var x1=x*cy+z*sy,z1=-x*sy+z*cy;
var y2=y*cx-z1*sx,z2=y*sx+z1*cx;
var x3=x1*cz-y2*sz,y3=x1*sz+y2*cz;
var depth=2.8/(2.8-z2*0.42);
return{x:center.x+x3*earthRadius*depth,y:center.y+y3*earthRadius*depth,z:z2};
}

function onPointerMove(e){
if(active){
  glow.tx=clamp(e.clientX/window.innerWidth,0,1);
  glow.ty=clamp(e.clientY/window.innerHeight,0,1);
  clearTimeout(idleGlowTimer);
  idleGlowTimer=setTimeout(function(){glow.tx=0.5;glow.ty=0.42;},2800);
}
if(!dragging||!lastPointer)return;
var dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y,dt=Math.max(16,e.timeStamp-lastPointer.t);
rotation.y+=dx*0.006;rotation.x+=dy*0.004;rotation.x=clamp(rotation.x,-0.95,0.95);
velocity.x=dx/dt*8;velocity.y=dy/dt*5;
lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
render();
}
function onPointerDown(e){
if(!active||e.button!==0||!canStartDrag(e.target))return;
dragging=true;velocity.x=0;velocity.y=0;lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
container.classList.add('dragging');
}
function onPointerUp(){if(!dragging)return;dragging=false;lastPointer=null;if(container)container.classList.remove('dragging');}
function canStartDrag(target){return !(target&&target.closest&&(target.closest(interactiveSelector)||target.closest('.main-container,.settings-panel,.modal,.side-panel,#ad-sidebar')));}
function getParticleCount(){var mobile=window.innerWidth<700,cores=navigator.hardwareConcurrency||4;return mobile?(cores>=6?1200:850):(cores>=8?3000:2200);}
function fract(n){return n-Math.floor(n);}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function mixColor(a,b,t){
var ca=hex(a),cb=hex(b),r=Math.round(ca[0]+(cb[0]-ca[0])*t),g=Math.round(ca[1]+(cb[1]-ca[1])*t),bl=Math.round(ca[2]+(cb[2]-ca[2])*t);
return'rgb('+r+','+g+','+bl+')';
}
function hex(s){s=s.replace('#','');return[parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)];}
})();

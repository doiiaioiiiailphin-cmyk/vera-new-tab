import * as THREE from './assets/vendor/three.module.min.js';

(function(){
'use strict';

var api={setActive:setActive,refreshTheme:refreshTheme};
var container=null,renderer=null,scene=null,camera=null,root=null,earth=null,moonOrbit=null,moon=null,stars=null;
var earthPoints=null,atmosphere=null,latLines=[],lonLines=[];
var active=false,dynamic=true,raf=0,lastTime=0,dragging=false,lastPointer=null,velocity={x:0,y:0};
var glow={x:0.5,y:0.42,tx:0.5,ty:0.42};
var idleGlowTimer=0;
var earthPalette={};
var interactiveSelector='a,button,input,textarea,select,canvas,.top-bar,.settings-overlay,.settings-panel,.modal-overlay,#freeContextMenu,.free-context-menu,.free-layout-item,.free-folder-panel,.link-card,.add-link-card,.widget,.search-box,.engine-dropdown,.suggest-dropdown,.theme-card,.radio-option,.btn,.toggle-switch,.pomodoro-time,.pomodoro-chip,.pomodoro-btn,.todo-item,.todo-input,.game-carousel,.game-stage';

window.VeraEarthScene=api;
document.dispatchEvent(new CustomEvent('vera:earth-ready'));

function setActive(opts){
opts=opts||{};
active=!!opts.active;
dynamic=opts.dynamic!==false;
ensureContainer();
if(!container)return;
container.style.display=active?'':'none';
container.classList.toggle('on',active);
document.body.classList.toggle('earth-bg',active);
if(active){
  initScene();
  if(!renderer)return;
  refreshTheme();
  resize();
  start();
}else{
  stop();
}
}

function ensureContainer(){
if(container)return;
container=document.getElementById('earthScene');
if(!container)return;
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('pointermove',onPointerMove,{passive:true});
document.addEventListener('pointerdown',onPointerDown);
document.addEventListener('pointerup',onPointerUp,{passive:true});
document.addEventListener('pointercancel',onPointerUp,{passive:true});
document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else if(active)start();});
document.addEventListener('mouseleave',function(){glow.tx=0.5;glow.ty=0.42;});
}

function initScene(){
if(renderer)return;
try{
renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
}catch(err){
  console.warn('Particle Earth WebGL unavailable',err);
  return;
}
renderer.setClearColor(0x000000,0);
renderer.domElement.className='earth-canvas';
renderer.domElement.setAttribute('aria-hidden','true');
container.appendChild(renderer.domElement);
scene=new THREE.Scene();
camera=new THREE.PerspectiveCamera(42,1,0.1,100);
camera.position.set(0,0,7.2);
root=new THREE.Group();
scene.add(root);
scene.add(new THREE.AmbientLight(0xffffff,0.62));
var light=new THREE.DirectionalLight(0xffffff,1.25);
light.position.set(4,3,6);
scene.add(light);
earth=new THREE.Group();
earth.rotation.z=-0.22;
root.add(earth);
createEarth();
createMoon();
createStars();
}

function createEarth(){
var particleCount=getParticleCount();
var positions=new Float32Array(particleCount*3);
var colors=new Float32Array(particleCount*3);
var radius=1.72;
for(var i=0;i<particleCount;i++){
  var u=(i+0.5)/particleCount;
  var v=fract(Math.sin(i*12.9898)*43758.5453);
  var theta=Math.acos(1-2*u);
  var phi=2*Math.PI*v;
  var jitter=1+(fract(Math.sin(i*78.233)*24634.6345)-0.5)*0.035;
  var idx=i*3;
  positions[idx]=Math.sin(theta)*Math.cos(phi)*radius*jitter;
  positions[idx+1]=Math.cos(theta)*radius*jitter;
  positions[idx+2]=Math.sin(theta)*Math.sin(phi)*radius*jitter;
  colors[idx]=1;colors[idx+1]=1;colors[idx+2]=1;
}
var geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
earthPoints=new THREE.Points(geometry,new THREE.PointsMaterial({size:0.024,transparent:true,opacity:0.9,vertexColors:true,depthWrite:false,blending:THREE.AdditiveBlending}));
earth.add(earthPoints);
latLines=createLatLines(radius);
lonLines=createLonLines(radius);
var glowGeo=new THREE.SphereGeometry(radius*1.045,48,24);
atmosphere=new THREE.Mesh(glowGeo,new THREE.MeshBasicMaterial({color:0x68efff,transparent:true,opacity:0.09,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));
earth.add(atmosphere);
}

function createLatLines(radius){
var lines=[];
[-60,-35,-15,15,35,60].forEach(function(deg){
  var y=Math.sin(deg*Math.PI/180)*radius;
  var r=Math.cos(deg*Math.PI/180)*radius;
  var curve=new THREE.EllipseCurve(0,0,r,r,0,Math.PI*2,false,0);
  var pts=curve.getPoints(128).map(function(p){return new THREE.Vector3(p.x,y,p.y);});
  var line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({transparent:true,opacity:0.16,depthWrite:false}));
  earth.add(line);lines.push(line);
});
return lines;
}

function createLonLines(radius){
var lines=[];
for(var i=0;i<8;i++){
  var pts=[];
  for(var j=0;j<=128;j++){
    var t=j/128*Math.PI*2;
    pts.push(new THREE.Vector3(Math.sin(t)*radius,Math.cos(t)*radius,0));
  }
  var line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({transparent:true,opacity:0.11,depthWrite:false}));
  line.rotation.y=i*Math.PI/8;
  earth.add(line);lines.push(line);
}
return lines;
}

function createMoon(){
moonOrbit=new THREE.Group();
root.add(moonOrbit);
var moonGeo=new THREE.SphereGeometry(0.18,24,16);
moon=new THREE.Mesh(moonGeo,new THREE.MeshStandardMaterial({color:0xe8eef5,roughness:0.82,metalness:0.02,transparent:true,opacity:0.92}));
moon.position.set(2.75,0.28,0.4);
moonOrbit.add(moon);
var orbitGeo=new THREE.BufferGeometry();
var pts=[];
for(var i=0;i<180;i++){var a=i/180*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*2.75,0.28,Math.sin(a)*0.72));}
orbitGeo.setFromPoints(pts);
moonOrbit.add(new THREE.LineLoop(orbitGeo,new THREE.LineBasicMaterial({color:0x9be8ff,transparent:true,opacity:0.12,depthWrite:false})));
}

function createStars(){
var count=window.innerWidth<700?110:190;
var positions=new Float32Array(count*3);
for(var i=0;i<count;i++){
  var idx=i*3;
  positions[idx]=(Math.random()-0.5)*12;
  positions[idx+1]=(Math.random()-0.5)*7;
  positions[idx+2]=-2-Math.random()*5;
}
var geometry=new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
stars=new THREE.Points(geometry,new THREE.PointsMaterial({size:0.018,color:0xdefbff,transparent:true,opacity:0.42,depthWrite:false,blending:THREE.AdditiveBlending}));
scene.add(stars);
}

function refreshTheme(){
if(!renderer)return;
var dark=document.documentElement.getAttribute('data-theme')!=='light';
earthPalette=dark?{
  bg1:'#020714',bg2:'#081a2f',point:new THREE.Color(0xb9fbff),pointAlt:new THREE.Color(0x42dff4),line:0x89f5ff,moon:0xe8eef5,star:0xdffcff,glow:'#46e6ff'
}:{
  bg1:'#eef8ff',bg2:'#d8edf8',point:new THREE.Color(0x2c789f),pointAlt:new THREE.Color(0x7bc5e7),line:0x3f83a8,moon:0xffffff,star:0x3f83a8,glow:'#8ed8ff'
};
container.style.setProperty('--earth-bg-1',earthPalette.bg1);
container.style.setProperty('--earth-bg-2',earthPalette.bg2);
container.style.setProperty('--earth-glow-color',earthPalette.glow);
if(earthPoints){
  var colors=earthPoints.geometry.getAttribute('color');
  var p=earthPalette.point,pa=earthPalette.pointAlt;
  for(var i=0;i<colors.count;i++){
    var mix=fract(Math.sin(i*44.131)*991.44);
    colors.setXYZ(i,p.r*(1-mix)+pa.r*mix,p.g*(1-mix)+pa.g*mix,p.b*(1-mix)+pa.b*mix);
  }
  colors.needsUpdate=true;
}
latLines.concat(lonLines).forEach(function(line){line.material.color.setHex(earthPalette.line);});
if(atmosphere)atmosphere.material.color.set(earthPalette.glow);
if(moon)moon.material.color.setHex(earthPalette.moon);
if(stars)stars.material.color.setHex(earthPalette.star);
renderOnce();
}

function start(){
if(raf||document.hidden)return;
lastTime=performance.now();
raf=requestAnimationFrame(tick);
}
function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}}
function tick(now){
raf=0;
if(!active||document.hidden)return;
var dt=Math.min(0.05,(now-lastTime)/1000||0.016);
lastTime=now;
glow.x+=((glow.tx||0.5)-glow.x)*0.08;
glow.y+=((glow.ty||0.42)-glow.y)*0.08;
container.style.setProperty('--earth-glow-x',(glow.x*100).toFixed(2)+'%');
container.style.setProperty('--earth-glow-y',(glow.y*100).toFixed(2)+'%');
if(dynamic&&!dragging){
  earth.rotation.y+=dt*0.1;
  if(moonOrbit)moonOrbit.rotation.y+=dt*0.28;
  if(stars)stars.rotation.z+=dt*0.006;
}
if(!dragging){
  earth.rotation.y+=velocity.x*dt;
  earth.rotation.x+=velocity.y*dt;
  velocity.x*=Math.pow(0.08,dt);
  velocity.y*=Math.pow(0.08,dt);
}
earth.rotation.x=clamp(earth.rotation.x,-0.9,0.9);
renderOnce();
raf=requestAnimationFrame(tick);
}

function renderOnce(){if(renderer&&scene&&camera)renderer.render(scene,camera);}

function resize(){
if(!active||!renderer||!container)return;
var w=window.innerWidth||container.clientWidth||1;
var h=window.innerHeight||container.clientHeight||1;
var dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<700?1.5:2);
renderer.setPixelRatio(dpr);
renderer.setSize(w,h,false);
camera.aspect=w/h;
camera.position.z=w<700?8.6:7.2;
camera.updateProjectionMatrix();
root.position.x=0;
root.position.y=w<700?-0.1:0;
renderOnce();
}

function onPointerMove(e){
if(active){
  glow.tx=clamp(e.clientX/window.innerWidth,0,1);
  glow.ty=clamp(e.clientY/window.innerHeight,0,1);
  clearTimeout(idleGlowTimer);
  idleGlowTimer=setTimeout(function(){glow.tx=0.5;glow.ty=0.42;},2800);
}
if(!dragging||!lastPointer)return;
var dx=e.clientX-lastPointer.x;
var dy=e.clientY-lastPointer.y;
var dt=Math.max(16,e.timeStamp-lastPointer.t);
earth.rotation.y+=dx*0.006;
earth.rotation.x+=dy*0.004;
earth.rotation.x=clamp(earth.rotation.x,-0.9,0.9);
velocity.x=dx/dt*8;
velocity.y=dy/dt*5;
lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
}

function onPointerDown(e){
if(!active||e.button!==0||!canStartDrag(e.target))return;
dragging=true;
velocity.x=0;velocity.y=0;
lastPointer={x:e.clientX,y:e.clientY,t:e.timeStamp};
container.classList.add('dragging');
}

function onPointerUp(){
if(!dragging)return;
dragging=false;
lastPointer=null;
if(container)container.classList.remove('dragging');
}

function canStartDrag(target){
if(!target||target.closest&&target.closest(interactiveSelector))return false;
if(target.closest&&target.closest('.main-container,.settings-panel,.modal,.side-panel,#ad-sidebar'))return false;
return true;
}

function getParticleCount(){
var mobile=window.innerWidth<700;
var cores=navigator.hardwareConcurrency||4;
if(mobile)return cores>=6?1500:1050;
return cores>=8?3600:2600;
}

function fract(n){return n-Math.floor(n);}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
})();

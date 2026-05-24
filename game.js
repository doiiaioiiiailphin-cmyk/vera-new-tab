// game.js — Mini-game widget with carousel (disabled by default)
// Set settings.showGame=true to enable

var gameRunning=false,gameScore=0;
var gameSnake=[],gameDir={x:1,y:0},nextDir=null,gameFood={x:0,y:0};
var GW=20,GH=13,CS=15,SCALE=2;
var gameIdx=0,GAME_LIST=[{id:'snake',label:'Snake'},{id:'cube',label:'Cube 3D'}];

var tickInterval=150;
var lastTick=0,tickAccumulator=0,rafId=null;
var prevSnake=null;

var foodScale=1,foodScaleTarget=1,foodEaten=false;
var screenState='start';
var fadingOut=false;

var gameType=function(){return GAME_LIST[gameIdx].id;};
var cubeCubies=[],cubeRotX=-0.55,cubeRotY=0.7,cubeAutoRot=0;
var cubeMX=0,cubeMY=0,cubeDragging=false,cubeFaceDrag=null,cubeDragDX=0,cubeDragDY=0;

function lerp(a,b,t){return a+(b-a)*t;}
function easeOutCubic(t){return 1-Math.pow(1-t,3);}

function initGame(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var prev=document.getElementById('gamePrev');if(prev)prev.addEventListener('click',function(e){e.stopPropagation();cycleGame(-1);});
var next=document.getElementById('gameNext');if(next)next.addEventListener('click',function(e){e.stopPropagation();cycleGame(1);});
updateGameLabel();
cv.width=GW*CS*SCALE;cv.height=GH*CS*SCALE;
cv.style.cssText='width:100%;max-width:600px;cursor:pointer;display:block;margin:0 auto;border-radius:12px;position:relative;z-index:1;pointer-events:auto;';
cv.addEventListener('click',function(e){
e.stopPropagation();e.preventDefault();
if(!gameRunning&&!fadingOut)fadeOutToGame();
});
cv.addEventListener('mousedown',function(e){
if(gameType()!=='cube'||!gameRunning)return;
cubeMX=e.clientX;cubeMY=e.clientY;cubeAutoRot=0;
var hit=hitTestFaces(e.offsetX,e.offsetY,cv);
if(hit){cubeFaceDrag=hit;cubeDragDX=0;cubeDragDY=0;}
else{cubeFaceDrag=null;cubeDragging=true;}
});
window.addEventListener('mousemove',function(e){
if(!cubeDragging&&!cubeFaceDrag)return;
var dx=e.clientX-cubeMX,dy=e.clientY-cubeMY;
if(cubeFaceDrag){cubeDragDX+=dx;cubeDragDY+=dy;}
else{cubeRotY-=dx*0.005;cubeRotX+=dy*0.005;
cubeRotX=Math.max(-Math.PI/3,Math.min(Math.PI/3,cubeRotX));}
cubeMX=e.clientX;cubeMY=e.clientY;
});
window.addEventListener('mouseup',function(){
if(cubeFaceDrag){
var adx=Math.abs(cubeDragDX),ady=Math.abs(cubeDragDY);
if(Math.max(adx,ady)>15){
var f=cubeFaceDrag;
var dir=adx>ady?(cubeDragDX>0?1:-1):(cubeDragDY>0?1:-1);
rotateLayer(f.axis,f.val,dir);
}
cubeFaceDrag=null;
}
cubeDragging=false;
});
cv.addEventListener('wheel',function(e){
if(gameType()!=='cube'||!gameRunning)return;
e.preventDefault();cubeRotY-=e.deltaX*0.003||0;cubeRotX+=e.deltaY*0.003;
cubeRotX=Math.max(-Math.PI/3,Math.min(Math.PI/3,cubeRotX));
},{passive:false});
document.addEventListener('keydown',handleKey);
gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
spawnFood();
buildCube();
drawStartScreen();
}

function drawStartScreen(){
screenState='start';
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
startAlpha=0;startTime=performance.now();
rafId=requestAnimationFrame(renderStartScreen);
}

var startAlpha=0,startTime=0;
function renderStartScreen(now){
var elapsed=now-startTime;
var t=Math.min(elapsed/400,1);
startAlpha=easeOutCubic(t);

var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
ctx.clearRect(0,0,cv.width,cv.height);

drawScene(ctx,cv,0);
ctx.fillStyle='rgba(10,18,40,'+startAlpha+')';ctx.fillRect(0,0,cv.width,cv.height);
ctx.strokeStyle='rgba(255,255,255,'+(0.1*startAlpha)+')';ctx.lineWidth=2;
ctx.strokeRect(1,1,cv.width-2,cv.height-2);
ctx.shadowBlur=20*startAlpha;ctx.shadowColor='rgba(138,170,204,'+(0.5*startAlpha)+')';
ctx.fillStyle='rgba(138,170,204,'+startAlpha+')';ctx.font='bold 24px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Click to start',cv.width/2,cv.height/2+8);
ctx.shadowBlur=0;

if(t<1){rafId=requestAnimationFrame(renderStartScreen);}
else{rafId=null;
var sc=document.getElementById('gameScore');if(sc)sc.style.display='';}
}

function handleKey(e){
if(!gameRunning)return;
if(gameType()==='cube'){handleCubeKey(e);return;}
var nd;
if(e.key==='ArrowUp')nd={x:0,y:-1};
else if(e.key==='ArrowDown')nd={x:0,y:1};
else if(e.key==='ArrowLeft')nd={x:-1,y:0};
else if(e.key==='ArrowRight')nd={x:1,y:0};
else return;
e.preventDefault();
if(nd.x===-gameDir.x&&nd.y===-gameDir.y)return;
if(nd.x===gameDir.x&&nd.y===gameDir.y)return;
nextDir=nd;
}

function startGame(){
resetGame();
gameRunning=true;
var sc=document.getElementById('gameScore');if(sc)sc.style.display=gameType()==='cube'?'':'none';
lastTick=performance.now();tickAccumulator=0;
rafId=requestAnimationFrame(renderLoop);
}

function spawnFood(){
var free=[];
for(var x=0;x<GW;x++)for(var y=0;y<GH;y++){
if(!gameSnake.some(function(s){return s.x===x&&s.y===y;}))free.push({x:x,y:y});
}
if(free.length)gameFood=free[Math.floor(Math.random()*free.length)];
}

function tick(){
if(!gameRunning)return;
if(nextDir){
if(!(nextDir.x===-gameDir.x&&nextDir.y===-gameDir.y))gameDir=nextDir;
nextDir=null;
}
prevSnake=gameSnake.map(function(s){return{x:s.x,y:s.y};});
var head={x:gameSnake[0].x+gameDir.x,y:gameSnake[0].y+gameDir.y};
if(head.x<0)head.x=GW-1;else if(head.x>=GW)head.x=0;
if(head.y<0)head.y=GH-1;else if(head.y>=GH)head.y=0;
if(gameSnake.some(function(s){return s.x===head.x&&s.y===head.y;})){gameOver();return;}
gameSnake.unshift(head);
if(head.x===gameFood.x&&head.y===gameFood.y){
gameScore++;foodEaten=true;foodScaleTarget=0;
}else{gameSnake.pop();}
}

function renderLoop(now){
if(!gameRunning){rafId=null;return;}
rafId=requestAnimationFrame(renderLoop);
if(gameType()==='cube'){
draw(0);return;
}
var dt=Math.min(now-lastTick,1000);lastTick=now;tickAccumulator+=dt;
while(tickAccumulator>=tickInterval){tick();tickAccumulator-=tickInterval;}
if(gameRunning)draw(tickAccumulator/tickInterval);
}

function drawScene(ctx,cv,progress){
ctx.fillStyle='rgba(10,18,40,0.75)';ctx.fillRect(0,0,cv.width,cv.height);
ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=2;
ctx.strokeRect(1,1,cv.width-2,cv.height-2);

if(gameType()==='cube'){renderCube(ctx,cv);return;}

ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='12px Lexend,sans-serif';ctx.textAlign='left';
ctx.fillText('SCORE '+gameScore,15,25);

if(foodScale>0.005){
var fx=gameFood.x*CS*SCALE+SCALE;
var fy=gameFood.y*CS*SCALE+SCALE;
var fw=(CS*SCALE-SCALE*2)*foodScale;
var fh=(CS*SCALE-SCALE*2)*foodScale;
var fcx=fx+(CS*SCALE-SCALE*2)/2;
var fcy=fy+(CS*SCALE-SCALE*2)/2;
var fsx=fcx-fw/2;var fsy=fcy-fh/2;
var foodGrad=ctx.createLinearGradient(fsx,fsy,fsx+fw,fsy+fh);
foodGrad.addColorStop(0,'rgba(255,154,158,0.95)');
foodGrad.addColorStop(0.4,'#ff6b6b');
foodGrad.addColorStop(1,'rgba(255,107,107,0.7)');
ctx.shadowBlur=18*foodScale;ctx.shadowColor='#ff6b6b';
ctx.fillStyle=foodGrad;
ctx.beginPath();
if(ctx.roundRect){ctx.roundRect(fsx,fsy,fw,fh,6);}
else{ctx.rect(fsx,fsy,fw,fh);}
ctx.fill();
}

ctx.shadowBlur=10;ctx.shadowColor='rgba(94,234,212,0.6)';
var snakeGrad=ctx.createLinearGradient(0,0,cv.width,cv.height);
snakeGrad.addColorStop(0,'#5eead4');
snakeGrad.addColorStop(0.7,'#34d399');
ctx.fillStyle=snakeGrad;

var t=progress||0;
var cellSize=CS*SCALE-SCALE*2;
for(var i=0;i<gameSnake.length;i++){
var s=gameSnake[i];
var px=s.x,py=s.y;
if(prevSnake&&prevSnake[i]){px=prevSnake[i].x;py=prevSnake[i].y;}
var cx=lerp(px,s.x,t),cy=lerp(py,s.y,t);
var sx=cx*CS*SCALE+SCALE,sy=cy*CS*SCALE+SCALE;
ctx.beginPath();
if(ctx.roundRect){ctx.roundRect(sx,sy,cellSize,cellSize,8);}
else{ctx.rect(sx,sy,cellSize,cellSize);}
ctx.fill();
}
ctx.shadowBlur=0;
}

function draw(progress){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
ctx.clearRect(0,0,cv.width,cv.height);

if(gameType()==='cube'){drawScene(ctx,cv,0);return;}

foodScale=lerp(foodScale,foodScaleTarget,0.15);
if(foodEaten&&foodScale<0.03){
foodScale=0;foodScaleTarget=1;foodEaten=false;
spawnFood();
}

drawScene(ctx,cv,progress);
}

var gameOverAlpha=0,goStartTime=0;
function gameOver(){
screenState='gameover';
gameRunning=false;
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
gameOverAlpha=0;goStartTime=performance.now();
rafId=requestAnimationFrame(renderGameOver);
}

function renderGameOver(now){
var elapsed=now-goStartTime;
var t=Math.min(elapsed/500,1);
gameOverAlpha=easeOutCubic(t);

var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
ctx.clearRect(0,0,cv.width,cv.height);

drawScene(ctx,cv,0);
ctx.fillStyle='rgba(10,18,40,'+gameOverAlpha+')';ctx.fillRect(0,0,cv.width,cv.height);
ctx.strokeStyle='rgba(255,255,255,'+(0.1*gameOverAlpha)+')';ctx.lineWidth=2;
ctx.strokeRect(1,1,cv.width-2,cv.height-2);
ctx.shadowBlur=24*gameOverAlpha;
ctx.shadowColor='rgba(255,107,107,'+(0.5*gameOverAlpha)+')';
ctx.fillStyle='rgba(228,240,251,'+gameOverAlpha+')';ctx.font='bold 28px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Game Over',cv.width/2,cv.height/2+8);
ctx.shadowBlur=0;

if(t<1){rafId=requestAnimationFrame(renderGameOver);}
else{rafId=null;
var sc=document.getElementById('gameScore');if(sc)sc.style.display='';}
}

var foStart=0,foDuration=300;
function fadeOutToGame(){
fadingOut=true;
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
if(gameType()==='cube'){buildCube();}
else{gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
gameDir={x:1,y:0};nextDir=null;gameScore=0;prevSnake=null;
foodScale=1;foodScaleTarget=1;foodEaten=false;
spawnFood();}
foStart=performance.now();
rafId=requestAnimationFrame(renderFadeOut);
}

function renderFadeOut(now){
var elapsed=now-foStart;
var t=Math.min(elapsed/foDuration,1);
var alpha=1-easeOutCubic(t);

var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
ctx.clearRect(0,0,cv.width,cv.height);

drawScene(ctx,cv,0);
ctx.fillStyle='rgba(10,18,40,'+alpha+')';ctx.fillRect(0,0,cv.width,cv.height);

ctx.strokeStyle='rgba(255,255,255,'+(0.1*alpha)+')';ctx.lineWidth=2;
ctx.strokeRect(1,1,cv.width-2,cv.height-2);

var isGO=screenState==='gameover';
ctx.shadowBlur=(isGO?24:20)*alpha;
ctx.shadowColor='rgba('+(isGO?'255,107,107':'138,170,204')+','+(0.5*alpha)+')';
ctx.fillStyle='rgba('+(isGO?'228,240,251':'138,170,204')+','+alpha+')';
ctx.font='bold '+(isGO?28:24)+'px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText(isGO?'Game Over':'Click to start',cv.width/2,cv.height/2+8);
ctx.shadowBlur=0;

if(t<1){rafId=requestAnimationFrame(renderFadeOut);}
else{rafId=null;fadingOut=false;startGame();}
}

function resetGame(){
gameRunning=false;
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
tickAccumulator=0;prevSnake=null;
foodScale=1;foodScaleTarget=1;foodEaten=false;
}
function updateGameLabel(){var lb=document.getElementById('gameName');if(lb)lb.textContent=GAME_LIST[gameIdx].label;}
function cycleGame(dir){gameIdx=(gameIdx+dir+GAME_LIST.length)%GAME_LIST.length;updateGameLabel();resetGame();drawStartScreen();}

function handleCubeKey(e){
var k=e.key.toLowerCase(),shift=e.shiftKey?1:-1;
if(k==='r'){rotateLayer('x',1,shift);}
else if(k==='l'){rotateLayer('x',-1,shift);}
else if(k==='u'){rotateLayer('y',1,shift);}
else if(k==='d'){rotateLayer('y',-1,shift);}
else if(k==='f'){rotateLayer('z',1,shift);}
else if(k==='b'){rotateLayer('z',-1,shift);}
else if(e.key==='ArrowLeft'){cubeRotY-=0.15;}
else if(e.key==='ArrowRight'){cubeRotY+=0.15;}
else if(e.key==='ArrowUp'){cubeRotX+=0.15;}
else if(e.key==='ArrowDown'){cubeRotX-=0.15;}
else return;
e.preventDefault();
cubeRotX=Math.max(-Math.PI/3,Math.min(Math.PI/3,cubeRotX));
}

var CB=0.45,CUBE_FOV=10,CUBE_CELL=28;
var CUBE_FACES={
'+x':{c:[[CB,CB,CB],[CB,-CB,CB],[CB,-CB,-CB],[CB,CB,-CB]]},
'-x':{c:[[-CB,CB,CB],[-CB,CB,-CB],[-CB,-CB,-CB],[-CB,-CB,CB]]},
'+y':{c:[[-CB,CB,CB],[CB,CB,CB],[CB,CB,-CB],[-CB,CB,-CB]]},
'-y':{c:[[-CB,-CB,-CB],[CB,-CB,-CB],[CB,-CB,CB],[-CB,-CB,CB]]},
'+z':{c:[[CB,CB,CB],[-CB,CB,CB],[-CB,-CB,CB],[CB,-CB,CB]]},
'-z':{c:[[CB,-CB,-CB],[-CB,-CB,-CB],[-CB,CB,-CB],[CB,CB,-CB]]}
};
var CUBE_COLORS={'+x':'#ff4444','-x':'#ff8800','+y':'#fafafa','-y':'#ffdd00','+z':'#00cc44','-z':'#4488ff'};

function buildCube(){
cubeCubies=[];
for(var x=-1;x<=1;x++)for(var y=-1;y<=1;y++)for(var z=-1;z<=1;z++){
if(x===0&&y===0&&z===0)continue;
var colors={};
if(x===1)colors['+x']=CUBE_COLORS['+x'];
if(x===-1)colors['-x']=CUBE_COLORS['-x'];
if(y===1)colors['+y']=CUBE_COLORS['+y'];
if(y===-1)colors['-y']=CUBE_COLORS['-y'];
if(z===1)colors['+z']=CUBE_COLORS['+z'];
if(z===-1)colors['-z']=CUBE_COLORS['-z'];
cubeCubies.push({x:x,y:y,z:z,c:colors});
}
}

function cubeProject(gx,gy,gz){
var cosX=Math.cos(cubeRotX),sinX=Math.sin(cubeRotX);
var cosY=Math.cos(cubeRotY),sinY=Math.sin(cubeRotY);
var x1=gx*cosY-gz*sinY;
var z1=gx*sinY+gz*cosY;
var y1=gy*cosX-z1*sinX;
var z2=gy*sinX+z1*cosX;
var s=CUBE_FOV/(CUBE_FOV-z2+0.5);
return{x:x1*s*CUBE_CELL,y:y1*s*CUBE_CELL,z:z2};
}

function renderCube(ctx,cv){
var cx=cv.width/2,cy=cv.height/2;
var list=cubeCubies.map(function(c){
var p=cubeProject(c.x,c.y,c.z);
return{c:c,px:p.x,py:p.y,pz:p.z};
});
list.sort(function(a,b){return a.pz-b.pz;});

list.forEach(function(item){
var c=item.c,offX=item.px,offY=item.py;
for(var f in CUBE_FACES){
if(!c.c[f])continue;
var fc=CUBE_FACES[f].c;
var pts=[];
for(var k=0;k<4;k++){
var p=cubeProject(c.x+fc[k][0],c.y+fc[k][1],c.z+fc[k][2]);
pts.push({x:cx+p.x,y:cy-p.y});
}
var area=(pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[1].y-pts[0].y)*(pts[2].x-pts[0].x);
if(area>=0)continue;

ctx.shadowBlur=8;ctx.shadowColor='rgba(0,0,0,0.3)';
ctx.fillStyle=c.c[f];
ctx.beginPath();
ctx.moveTo(pts[0].x,pts[0].y);
for(k=1;k<4;k++)ctx.lineTo(pts[k].x,pts[k].y);
ctx.closePath();
ctx.fill();

ctx.shadowBlur=0;
ctx.strokeStyle='rgba(0,0,0,0.18)';ctx.lineWidth=0.6;
ctx.stroke();
}
});
ctx.shadowBlur=0;
}

function pointInPoly(px,py,poly){
var inside=false;
for(var i=0,j=poly.length-1;i<poly.length;j=i++){
var xi=poly[i].x,yi=poly[i].y,xj=poly[j].x,yj=poly[j].y;
if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)inside=!inside;
}
return inside;
}

function hitTestFaces(mx,my,cv){
var cx=cv.width/2,cy=cv.height/2;
var best=null,bestZ=-Infinity;
for(var i=0;i<cubeCubies.length;i++){
var c=cubeCubies[i];
for(var f in CUBE_FACES){
if(!c.c[f])continue;
var fc=CUBE_FACES[f].c;
var pts=[];
for(var k=0;k<4;k++){
var p=cubeProject(c.x+fc[k][0],c.y+fc[k][1],c.z+fc[k][2]);
pts.push({x:cx+p.x,y:cy-p.y});
}
var area=(pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[1].y-pts[0].y)*(pts[2].x-pts[0].x);
if(area>=0)continue;
if(!pointInPoly(mx,my,pts))continue;
var cp=cubeProject(c.x,c.y,c.z);
if(cp.z>bestZ){bestZ=cp.z;best={axis:f[1],val:c[f[1]],cubie:c};}
}
}
return best;
}

function rotateLayer(axis,val,dir){
var perm={};
if(axis==='x'){
if(dir===1)perm={'+y':'+z','+z':'-y','-y':'-z','-z':'+y'};
else perm={'+y':'-z','-z':'-y','-y':'+z','+z':'+y'};
}else if(axis==='y'){
if(dir===1)perm={'+x':'+z','+z':'-x','-x':'-z','-z':'+x'};
else perm={'+x':'-z','-z':'-x','-x':'+z','+z':'+x'};
}else{
if(dir===1)perm={'+x':'+y','+y':'-x','-x':'-y','-y':'+x'};
else perm={'+x':'-y','-y':'-x','-x':'+y','+y':'+x'};
}
for(var i=0;i<cubeCubies.length;i++){
var c=cubeCubies[i];
if(c[axis]!==val)continue;
var ox=c.x,oy=c.y,oz=c.z;
if(axis==='x'){c.y=-dir*oz;c.z=dir*oy;}
else if(axis==='y'){c.x=dir*oz;c.z=-dir*ox;}
else{c.x=dir*oy;c.y=-dir*ox;}
var nc={};
for(var k in c.c){var tk=perm[k]||k;nc[tk]=c.c[k];}
c.c=nc;
}
}
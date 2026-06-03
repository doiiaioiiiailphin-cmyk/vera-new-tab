// Mini-game widget. settings.showGame enables it from script.js.

var gameRunning=false,gameScore=0;
var gameSnake=[],gameDir={x:1,y:0},nextDir=null,gameFood={x:0,y:0};
var GW=20,GH=13,CS=15,SCALE=2;
var gameIdx=0,GAME_LIST=[
{id:'snake',labelKey:'snake',cover:'assets/game-cover-snake.webp'},
{id:'cube',labelKey:'cube',cover:'assets/game-cover-cube.webp'}
];

var tickInterval=150;
var lastTick=0,tickAccumulator=0,rafId=null;
var prevSnake=null;

var foodScale=1,foodScaleTarget=1,foodEaten=false;
var screenState='start';
var fadingOut=false;
var gameEverStarted=false,idleCarouselTimer=null;
var gameCoverImages={};
var gameCurrentLang=null;
var GAME_I18N={
zh:{snake:'贪吃蛇',cube:'魔方',prevGame:'上一个游戏',nextGame:'下一个游戏',scramble:'打乱',restore:'复原',startSnake:'点击开始',startCube:'点击转动',gameOver:'游戏结束',snakeReady:'点击开始贪吃蛇',cubeReady:'点击开始魔方',snakeRun:'方向键控制移动',cubeRun:'拖动色块跟手转层；拖动空白旋转视角并带惯性；R L U D F B，Shift 反向',score:'得分'},
en:{snake:'Snake',cube:'Cube',prevGame:'Previous game',nextGame:'Next game',scramble:'Scramble',restore:'Restore',startSnake:'Click to start',startCube:'Click to rotate',gameOver:'Game Over',snakeReady:'Click to start Snake',cubeReady:'Click to start Cube',snakeRun:'Use arrow keys to move',cubeRun:'Drag stickers to turn layers; drag empty space to rotate with inertia; R L U D F B, Shift reverses',score:'Score'},
ja:{snake:'スネーク',cube:'キューブ',prevGame:'前のゲーム',nextGame:'次のゲーム',scramble:'シャッフル',restore:'復元',startSnake:'クリックで開始',startCube:'クリックで回転',gameOver:'ゲームオーバー',snakeReady:'スネークを開始',cubeReady:'キューブを開始',snakeRun:'矢印キーで移動',cubeRun:'ステッカーをドラッグして層を回転、空白をドラッグして慣性付きで視点回転；R L U D F B、Shiftで逆方向',score:'スコア'}
};

var gameType=function(){return GAME_LIST[gameIdx].id;};

var CUBE_STORAGE_KEY='vera_cube_state_v1';
var CUBE_DEFAULT_ROT_X=0.52,CUBE_DEFAULT_ROT_Y=0.68;
var cubeCubies=[];
var cubeRotX=CUBE_DEFAULT_ROT_X,cubeRotY=CUBE_DEFAULT_ROT_Y,cubeAutoRot=0;
var cubeMX=0,cubeMY=0,cubeDragging=false,cubeFaceDrag=null,cubeDragDX=0,cubeDragDY=0;
var cubeTurn=null,cubeTurnQueue=[];
var cubeHover=null;
var cubeRotVelX=0,cubeRotVelY=0,cubeLastFrame=0,cubeLastPointerTime=0;
var cubeHistory=[],cubeRestoring=false,cubeSaveTimer=null;
var CUBE_ROT_MIN=-1.5,CUBE_ROT_MAX=1.32;

function lerp(a,b,t){return a+(b-a)*t;}
function easeOutCubic(t){return 1-Math.pow(1-t,3);}
function easeInOutCubic(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

function gameLang(){
if(GAME_I18N[gameCurrentLang])return gameCurrentLang;
var docLang=document.documentElement&&document.documentElement.getAttribute('lang');
if(GAME_I18N[docLang])return docLang;
try{
var raw=JSON.parse(localStorage.getItem('newtab_settings_v3')||'{}');
return GAME_I18N[raw.language]?raw.language:'zh';
}catch(e){return 'zh';}
}
function gameText(key){
var lang=gameLang();
return (GAME_I18N[lang]&&GAME_I18N[lang][key])||(GAME_I18N.zh&&GAME_I18N.zh[key])||key;
}
function gameName(){
var g=GAME_LIST[gameIdx]||GAME_LIST[0];
return gameText(g.labelKey||g.id);
}
function updateGameLocale(){
var prev=document.getElementById('gamePrev');if(prev)prev.setAttribute('aria-label',gameText('prevGame'));
var next=document.getElementById('gameNext');if(next)next.setAttribute('aria-label',gameText('nextGame'));
var scramble=document.getElementById('cubeScramble');if(scramble)scramble.textContent=gameText('scramble');
var reset=document.getElementById('cubeReset');if(reset)reset.textContent=gameText('restore');
updateGameLabel();
if(screenState==='start'&&!gameRunning&&!fadingOut)drawStartScreen();
}
document.addEventListener('vera:localechange',function(e){
var lang=e&&e.detail&&e.detail.language;
if(GAME_I18N[lang])gameCurrentLang=lang;
updateGameLocale();
});

function initGame(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
injectGameStyles();
polishGameUi();
preloadGameCovers();
var prev=document.getElementById('gamePrev');if(prev)prev.addEventListener('click',function(e){e.stopPropagation();resetIdleCarousel();cycleGame(-1,false,-1);});
var next=document.getElementById('gameNext');if(next)next.addEventListener('click',function(e){e.stopPropagation();resetIdleCarousel();cycleGame(1,false,1);});
updateGameLabel();
cv.width=GW*CS*SCALE;cv.height=GH*CS*SCALE;
cv.style.cssText='width:100%;max-width:540px;aspect-ratio:20/13;cursor:pointer;display:block;margin:0 auto;border-radius:22px;position:relative;z-index:1;pointer-events:auto;background:#07101f;';
cv.addEventListener('click',function(e){
e.stopPropagation();e.preventDefault();
if(!gameRunning&&!fadingOut)fadeOutToGame();
});
cv.addEventListener('mousedown',handleCubePointerDown);
cv.addEventListener('touchstart',handleCubeTouchStart,{passive:false});
window.addEventListener('mousemove',handleCubePointerMove);
window.addEventListener('touchmove',handleCubeTouchMove,{passive:false});
window.addEventListener('mouseup',handleCubePointerUp);
window.addEventListener('touchend',handleCubePointerUp);
cv.addEventListener('mouseleave',function(){cubeHover=null;});
cv.addEventListener('mousemove',function(e){
if(gameType()!=='cube'||!gameRunning||cubeDragging||cubeFaceDrag||cubeTurn)return;
var p=canvasPoint(e,cv);
cubeHover=hitTestFaces(p.x,p.y,cv);
});
cv.addEventListener('wheel',function(e){
if(gameType()!=='cube'||!gameRunning)return;
e.preventDefault();
cubeRotY-=((e.deltaX||0)+(e.shiftKey?e.deltaY:0))*0.003;
cubeRotX+=(!e.shiftKey?e.deltaY:0)*0.003;
cubeRotX=clamp(cubeRotX,CUBE_ROT_MIN,CUBE_ROT_MAX);
saveCubeState(false);
},{passive:false});
document.addEventListener('keydown',handleKey);
gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
spawnFood();
initCubeState();
drawStartScreen();
startIdleCarousel();
}

function injectGameStyles(){
if(document.getElementById('game-polish-style'))return;
var st=document.createElement('style');
st.id='game-polish-style';
st.textContent=[
'.game-widget{overflow:visible!important;padding:18px!important;}',
'.game-widget .game-badge{display:none!important;}',
'#gameCanvas{box-shadow:0 18px 46px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.08);border:1px solid rgba(180,220,255,.16);}',
'.game-stage{position:relative;width:min(100%,540px);margin:0 auto;}',
'.game-stage #gameCanvas{width:100%!important;max-width:none!important;}',
'.game-stage.game-switch-left{animation:gameSwitchLeft .42s cubic-bezier(.2,.8,.2,1);}',
'.game-stage.game-switch-from-left{animation:gameSwitchFromLeft .42s cubic-bezier(.2,.8,.2,1);}',
'@keyframes gameSwitchLeft{0%{opacity:.38;transform:translateX(30px) scale(.985);}55%{opacity:1;transform:translateX(-7px) scale(1);}100%{opacity:1;transform:translateX(0) scale(1);}}',
'@keyframes gameSwitchFromLeft{0%{opacity:.38;transform:translateX(-30px) scale(.985);}55%{opacity:1;transform:translateX(7px) scale(1);}100%{opacity:1;transform:translateX(0) scale(1);}}',
'.game-carousel{gap:12px!important;}',
'.game-carousel.game-carousel-outside{grid-column:1/-1;width:min(100%,540px);margin:-8px auto 0!important;padding:0 0 2px;}',
'.game-widget[style*="display: none"] + .game-carousel-outside{display:none!important;}',
'.game-carousel-btn{width:30px!important;height:30px!important;border-radius:50%!important;font-size:18px!important;line-height:1!important;background:rgba(255,255,255,.045)!important;}',
'.game-carousel-label{font-size:12px!important;min-width:64px!important;color:var(--text-dim)!important;font-weight:600!important;}',
'.game-hint{width:min(100%,540px);margin:9px auto 0;text-align:center;font-size:11px;line-height:1.55;color:var(--text-subtle);letter-spacing:0;background:rgba(255,255,255,.035);border:1px solid rgba(180,220,255,.10);border-radius:999px;padding:6px 12px;user-select:none;}',
'.game-cube-actions{position:absolute;right:13px;bottom:13px;z-index:3;display:none;align-items:center;justify-content:center;gap:7px;}',
'.game-cube-action{height:27px;padding:0 12px;border-radius:999px;border:1px solid rgba(180,220,255,.18);background:rgba(6,14,30,.58);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);color:rgba(228,240,251,.78);font:600 11px var(--font-body);cursor:pointer;transition:all var(--transition-fast);box-shadow:0 8px 20px rgba(0,0,0,.18);}',
'.game-cube-action:hover{border-color:var(--accent);color:var(--text);background:rgba(12,28,52,.72);}',
'#gameScore{display:none!important;}'
].join('');
document.head.appendChild(st);
}

function polishGameUi(){
var badge=document.querySelector('#gameWidget .game-badge');if(badge)badge.remove();
var prev=document.getElementById('gamePrev');if(prev){prev.textContent='‹';prev.setAttribute('aria-label',gameText('prevGame'));}
var next=document.getElementById('gameNext');if(next){next.textContent='›';next.setAttribute('aria-label',gameText('nextGame'));}
var widget=document.getElementById('gameWidget');
var carousel=document.querySelector('.game-carousel');
if(widget&&carousel&&carousel.parentNode===widget){carousel.classList.add('game-carousel-outside');widget.insertAdjacentElement('afterend',carousel);}
var cv=document.getElementById('gameCanvas');
var stage=document.getElementById('gameStage');
if(cv&&!stage){
stage=document.createElement('div');
stage.id='gameStage';
stage.className='game-stage';
cv.parentNode.insertBefore(stage,cv);
stage.appendChild(cv);
}
if(cv&&!document.getElementById('gameHint')){
var hint=document.createElement('div');
hint.id='gameHint';
hint.className='game-hint';
(stage||cv).insertAdjacentElement('afterend',hint);
}
if(cv&&!document.getElementById('cubeActions')){
var actions=document.createElement('div');
actions.id='cubeActions';
actions.className='game-cube-actions';
actions.innerHTML='<button class="game-cube-action" id="cubeScramble" type="button"></button><button class="game-cube-action" id="cubeReset" type="button"></button>';
(stage||cv).appendChild(actions);
var scramble=document.getElementById('cubeScramble');
var reset=document.getElementById('cubeReset');
if(scramble)scramble.addEventListener('click',function(e){e.stopPropagation();scrambleCube();});
if(reset)reset.addEventListener('click',function(e){e.stopPropagation();resetCube();});
}
updateGameLocale();
}

function updateGameHint(){
var hint=document.getElementById('gameHint');if(!hint)return;
if(gameType()==='cube'){
hint.textContent=gameRunning?gameText('cubeRun'):gameText('cubeReady');
}else{
hint.textContent=gameRunning?gameText('snakeRun'):gameText('snakeReady');
}
var actions=document.getElementById('cubeActions');
if(actions)actions.style.display=gameType()==='cube'?'flex':'none';
syncGameChrome();
}

function syncGameChrome(){
var gm=document.getElementById('gameWidget');
var carousel=document.querySelector('.game-carousel');
if(carousel)carousel.style.display=gm&&gm.style.display==='none'?'none':'flex';
}

function preloadGameCovers(){
for(var i=0;i<GAME_LIST.length;i++){
var g=GAME_LIST[i];
if(!g.cover||gameCoverImages[g.id])continue;
var img=new Image();
img.onload=function(){if(screenState==='start')drawStartScreen();};
img.src=g.cover;
gameCoverImages[g.id]=img;
}
}

function startIdleCarousel(){
if(gameEverStarted||idleCarouselTimer)return;
idleCarouselTimer=setInterval(function(){
var gm=document.getElementById('gameWidget');
if(gameEverStarted||gameRunning||fadingOut||screenState!=='start'||(gm&&gm.style.display==='none'))return;
cycleGame(1,true,1);
},5000);
}

function stopIdleCarousel(){
gameEverStarted=true;
if(idleCarouselTimer){clearInterval(idleCarouselTimer);idleCarouselTimer=null;}
}

function resetIdleCarousel(){
if(gameEverStarted)return;
if(idleCarouselTimer){clearInterval(idleCarouselTimer);idleCarouselTimer=null;}
startIdleCarousel();
}

function playGameSwitchAnimation(dir){
var stage=document.getElementById('gameStage');
if(!stage)return;
stage.classList.remove('game-switch-left','game-switch-from-left');
void stage.offsetWidth;
stage.classList.add(dir<0?'game-switch-from-left':'game-switch-left');
setTimeout(function(){stage.classList.remove('game-switch-left','game-switch-from-left');},460);
}

function drawStartScreen(){
screenState='start';
gameRunning=false;
updateGameHint();
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

drawGameCover(ctx,cv,now);
drawOverlay(ctx,cv,startAlpha,gameType()==='cube'?gameText('startCube'):gameText('startSnake'),false);

if(t<1){rafId=requestAnimationFrame(renderStartScreen);}
else{rafId=null;}
}

function drawGameCover(ctx,cv,now){
var img=gameCoverImages[gameType()];
if(!img||!img.complete||!img.naturalWidth){drawScene(ctx,cv,0,now);return;}
drawBoardBackground(ctx,cv);
ctx.save();
roundedPanel(ctx,cv);ctx.clip();
var scale=Math.max(cv.width/img.naturalWidth,cv.height/img.naturalHeight);
var w=img.naturalWidth*scale,h=img.naturalHeight*scale;
var x=(cv.width-w)/2,y=(cv.height-h)/2;
ctx.drawImage(img,x,y,w,h);
var shade=ctx.createLinearGradient(0,0,0,cv.height);
shade.addColorStop(0,'rgba(3,8,18,0.04)');
shade.addColorStop(0.56,'rgba(3,8,18,0.16)');
shade.addColorStop(1,'rgba(3,8,18,0.38)');
ctx.fillStyle=shade;ctx.fillRect(0,0,cv.width,cv.height);
ctx.restore();
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
updateGameHint();
var sc=document.getElementById('gameScore');if(sc)sc.style.display='none';
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
draw(0,now);return;
}
var dt=Math.min(now-lastTick,1000);lastTick=now;tickAccumulator+=dt;
while(tickAccumulator>=tickInterval){tick();tickAccumulator-=tickInterval;}
if(gameRunning)draw(tickAccumulator/tickInterval,now);
}

function roundedPanel(ctx,cv){
ctx.beginPath();
if(ctx.roundRect){ctx.roundRect(1,1,cv.width-2,cv.height-2,22);}
else{ctx.rect(1,1,cv.width-2,cv.height-2);}
}

function drawBoardBackground(ctx,cv){
var g=ctx.createLinearGradient(0,0,cv.width,cv.height);
g.addColorStop(0,'rgba(16,28,54,0.98)');
g.addColorStop(0.45,'rgba(8,17,36,0.98)');
g.addColorStop(1,'rgba(4,11,24,0.98)');
ctx.save();
roundedPanel(ctx,cv);ctx.clip();
ctx.fillStyle=g;ctx.fillRect(0,0,cv.width,cv.height);
var glow=ctx.createRadialGradient(cv.width*0.25,cv.height*0.12,10,cv.width*0.25,cv.height*0.12,cv.width*0.75);
glow.addColorStop(0,'rgba(94,234,212,0.16)');
glow.addColorStop(0.48,'rgba(125,211,252,0.06)');
glow.addColorStop(1,'rgba(125,211,252,0)');
ctx.fillStyle=glow;ctx.fillRect(0,0,cv.width,cv.height);
ctx.restore();
ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=2;
roundedPanel(ctx,cv);ctx.stroke();
}

function drawScene(ctx,cv,progress,now){
drawBoardBackground(ctx,cv);
if(gameType()==='cube'){renderCube(ctx,cv,now||performance.now());return;}

ctx.save();
roundedPanel(ctx,cv);ctx.clip();
ctx.shadowBlur=0;
ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='12px Lexend,Noto Sans SC,sans-serif';ctx.textAlign='left';
ctx.fillText(gameText('score').toUpperCase()+' '+gameScore,15,25);

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
if(ctx.roundRect){ctx.roundRect(fsx,fsy,fw,fh,8);}
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
ctx.restore();
ctx.shadowBlur=0;
}

function draw(progress,now){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');if(!ctx)return;
ctx.clearRect(0,0,cv.width,cv.height);

if(gameType()==='cube'){drawScene(ctx,cv,0,now);return;}

foodScale=lerp(foodScale,foodScaleTarget,0.15);
if(foodEaten&&foodScale<0.03){
foodScale=0;foodScaleTarget=1;foodEaten=false;
spawnFood();
}
drawScene(ctx,cv,progress,now);
}

var gameOverAlpha=0,goStartTime=0;
function gameOver(){
screenState='gameover';
gameRunning=false;
updateGameHint();
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

drawScene(ctx,cv,0,now);
drawOverlay(ctx,cv,gameOverAlpha,gameText('gameOver'),true);

if(t<1){rafId=requestAnimationFrame(renderGameOver);}
else{rafId=null;}
}

function drawOverlay(ctx,cv,alpha,text,isDanger){
ctx.save();
roundedPanel(ctx,cv);ctx.clip();
ctx.fillStyle='rgba(5,11,24,'+(0.70*alpha)+')';ctx.fillRect(0,0,cv.width,cv.height);
ctx.shadowBlur=(isDanger?24:20)*alpha;
ctx.shadowColor=isDanger?'rgba(255,107,107,'+(0.5*alpha)+')':'rgba(94,234,212,'+(0.45*alpha)+')';
ctx.fillStyle=isDanger?'rgba(228,240,251,'+alpha+')':'rgba(204,247,239,'+alpha+')';
ctx.font='700 '+(isDanger?28:24)+'px Lexend,Noto Sans SC,sans-serif';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.fillText(text,cv.width/2,cv.height/2);
ctx.restore();
ctx.shadowBlur=0;
}

var foStart=0,foDuration=300;
function fadeOutToGame(){
stopIdleCarousel();
fadingOut=true;
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
if(gameType()==='cube'){initCubeState();cubeTurn=null;cubeTurnQueue=[];cubeHover=null;}
else{
gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
gameDir={x:1,y:0};nextDir=null;gameScore=0;prevSnake=null;
foodScale=1;foodScaleTarget=1;foodEaten=false;
spawnFood();
}
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

drawScene(ctx,cv,0,now);
drawOverlay(ctx,cv,alpha,screenState==='gameover'?gameText('gameOver'):(gameType()==='cube'?gameText('startCube'):gameText('startSnake')),screenState==='gameover');

if(t<1){rafId=requestAnimationFrame(renderFadeOut);}
else{rafId=null;fadingOut=false;startGame();}
}

function resetGame(){
gameRunning=false;
if(rafId){cancelAnimationFrame(rafId);rafId=null;}
tickAccumulator=0;prevSnake=null;
foodScale=1;foodScaleTarget=1;foodEaten=false;
cubeDragging=false;cubeFaceDrag=null;cubeHover=null;
cubeRotVelX=0;cubeRotVelY=0;cubeLastFrame=0;
}
function updateGameLabel(){var lb=document.getElementById('gameName');if(lb)lb.textContent=gameName();updateGameHint();}
function cycleGame(dir,isAuto,animDir){
if(isAuto&&gameEverStarted)return;
gameIdx=(gameIdx+dir+GAME_LIST.length)%GAME_LIST.length;
updateGameLabel();resetGame();drawStartScreen();
playGameSwitchAnimation(animDir||dir||1);
if(!gameEverStarted)startIdleCarousel();
}

function handleCubeKey(e){
var k=e.key.toLowerCase(),dir=e.shiftKey?-1:1;
if(k==='r'){rotateLayer('x',1,dir);}
else if(k==='l'){rotateLayer('x',-1,-dir);}
else if(k==='u'){rotateLayer('y',1,dir);}
else if(k==='d'){rotateLayer('y',-1,-dir);}
else if(k==='f'){rotateLayer('z',1,dir);}
else if(k==='b'){rotateLayer('z',-1,-dir);}
else if(e.key==='ArrowLeft'){cubeRotY-=0.15;}
else if(e.key==='ArrowRight'){cubeRotY+=0.15;}
else if(e.key==='ArrowUp'){cubeRotX+=0.15;}
else if(e.key==='ArrowDown'){cubeRotX-=0.15;}
else return;
e.preventDefault();
cubeRotX=clamp(cubeRotX,CUBE_ROT_MIN,CUBE_ROT_MAX);
if(e.key.indexOf('Arrow')===0)saveCubeState(true);
}

function handleCubePointerDown(e){
var cv=document.getElementById('gameCanvas');if(!cv||gameType()!=='cube'||!gameRunning)return;
if(e.preventDefault)e.preventDefault();
var p=canvasPoint(e,cv);
cubeMX=e.clientX;cubeMY=e.clientY;cubeAutoRot=0;
cubeLastPointerTime=performance.now();
cubeRotVelX=0;cubeRotVelY=0;
if(cubeTurn)return;
var hit=hitTestFaces(p.x,p.y,cv);
if(hit){cubeFaceDrag={hit:hit,startX:p.x,startY:p.y,move:null,lastAngle:0,lastAngleTime:cubeLastPointerTime};cubeDragDX=0;cubeDragDY=0;cubeHover=hit;}
else{cubeFaceDrag=null;cubeDragging=true;}
}

function handleCubeTouchStart(e){
if(!e.touches||!e.touches.length)return;
handleCubePointerDown(e.touches[0]);
e.preventDefault();
}

function handleCubePointerMove(e){
if(gameType()!=='cube'||!gameRunning)return;
if(!cubeDragging&&!cubeFaceDrag)return;
var dx=e.clientX-cubeMX,dy=e.clientY-cubeMY;
var now=performance.now();
var dt=Math.max(12,now-cubeLastPointerTime);
if(cubeFaceDrag){
cubeDragDX+=dx;cubeDragDY+=dy;
updateCubeFaceDrag(now);
}else{
var ry=-dx*0.006,rx=dy*0.006;
cubeRotY+=ry;
cubeRotX+=rx;
cubeRotX=clamp(cubeRotX,CUBE_ROT_MIN,CUBE_ROT_MAX);
cubeRotVelY=ry/(dt/1000);
cubeRotVelX=rx/(dt/1000);
saveCubeState(false);
}
cubeMX=e.clientX;cubeMY=e.clientY;cubeLastPointerTime=now;
}

function handleCubeTouchMove(e){
if(!e.touches||!e.touches.length)return;
if(cubeDragging||cubeFaceDrag)e.preventDefault();
handleCubePointerMove(e.touches[0]);
}

function handleCubePointerUp(){
if(cubeFaceDrag){
finishCubeFaceDrag();
cubeFaceDrag=null;
}
cubeDragging=false;
if(gameType()==='cube')saveCubeState(true);
}

function canvasPoint(e,cv){
var r=cv.getBoundingClientRect();
return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height};
}

var CB=0.42,CUBE_FOV=7.2,CUBE_CELL=55;
var CUBE_SCRAMBLE_LAYERS=[-1,1];
var CUBE_FACES={
'+x':{n:{x:1,y:0,z:0},c:[[CB,CB,CB],[CB,-CB,CB],[CB,-CB,-CB],[CB,CB,-CB]]},
'-x':{n:{x:-1,y:0,z:0},c:[[-CB,CB,CB],[-CB,CB,-CB],[-CB,-CB,-CB],[-CB,-CB,CB]]},
'+y':{n:{x:0,y:1,z:0},c:[[-CB,CB,CB],[CB,CB,CB],[CB,CB,-CB],[-CB,CB,-CB]]},
'-y':{n:{x:0,y:-1,z:0},c:[[-CB,-CB,-CB],[CB,-CB,-CB],[CB,-CB,CB],[-CB,-CB,CB]]},
'+z':{n:{x:0,y:0,z:1},c:[[CB,CB,CB],[-CB,CB,CB],[-CB,-CB,CB],[CB,-CB,CB]]},
'-z':{n:{x:0,y:0,z:-1},c:[[CB,-CB,-CB],[-CB,-CB,-CB],[-CB,CB,-CB],[CB,CB,-CB]]}
};
var CUBE_COLORS={'+x':'#ef4444','-x':'#f97316','+y':'#f8fafc','-y':'#facc15','+z':'#22c55e','-z':'#3b82f6'};

function initCubeState(){
if(loadCubeState())return;
buildCube();
}

function cubeStateCubies(){
return cubeCubies.map(function(c){
var colors={};
for(var k in c.c)colors[k]=c.c[k];
return{x:c.x,y:c.y,z:c.z,c:colors};
});
}

function saveCubeState(immediate){
if(!cubeCubies.length)return;
if(cubeSaveTimer){clearTimeout(cubeSaveTimer);cubeSaveTimer=null;}
if(immediate){writeCubeState();return;}
cubeSaveTimer=setTimeout(function(){cubeSaveTimer=null;writeCubeState();},120);
}

function writeCubeState(){
try{
localStorage.setItem(CUBE_STORAGE_KEY,JSON.stringify({
v:1,
rotX:Math.round(cubeRotX*10000)/10000,
rotY:Math.round(cubeRotY*10000)/10000,
cubies:cubeStateCubies(),
history:cubeHistory.slice(-240)
}));
}catch(e){}
}

function loadCubeState(){
var state=null;
try{state=JSON.parse(localStorage.getItem(CUBE_STORAGE_KEY));}catch(e){state=null;}
if(!state||!Array.isArray(state.cubies)||state.cubies.length!==26)return false;
var seen={},next=[];
for(var i=0;i<state.cubies.length;i++){
var c=state.cubies[i];
if(!c||!isCubeCoord(c.x)||!isCubeCoord(c.y)||!isCubeCoord(c.z)||(c.x===0&&c.y===0&&c.z===0)||!c.c)return false;
var pos=c.x+','+c.y+','+c.z;
if(seen[pos])return false;
seen[pos]=true;
var colors={};
for(var k in c.c){
if(!CUBE_FACES[k]||typeof c.c[k]!=='string')return false;
colors[k]=c.c[k];
}
next.push({x:c.x,y:c.y,z:c.z,c:colors});
}
cubeCubies=next;
cubeRotX=clamp(typeof state.rotX==='number'?state.rotX:CUBE_DEFAULT_ROT_X,CUBE_ROT_MIN,CUBE_ROT_MAX);
cubeRotY=typeof state.rotY==='number'?state.rotY:CUBE_DEFAULT_ROT_Y;
cubeHistory=Array.isArray(state.history)?state.history.filter(validCubeHistoryTurn).slice(-240):[];
cubeRestoring=false;
return true;
}

function isCubeCoord(v){return v===-1||v===0||v===1;}
function validCubeHistoryTurn(t){
return t&&(t.axis==='x'||t.axis==='y'||t.axis==='z')&&isCubeCoord(t.val)&&(t.dir===1||t.dir===-1);
}

function buildCube(){
cubeCubies=[];
cubeHistory=[];
cubeRestoring=false;
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
cubeRotX=clamp(cubeRotX,CUBE_ROT_MIN,CUBE_ROT_MAX);
saveCubeState(true);
}

function resetCubeDefaults(){
if(cubeSaveTimer){clearTimeout(cubeSaveTimer);cubeSaveTimer=null;}
try{localStorage.removeItem(CUBE_STORAGE_KEY);}catch(e){}
cubeRotX=CUBE_DEFAULT_ROT_X;cubeRotY=CUBE_DEFAULT_ROT_Y;
cubeRotVelX=0;cubeRotVelY=0;cubeLastFrame=0;
cubeDragging=false;cubeFaceDrag=null;cubeHover=null;
cubeTurn=null;cubeTurnQueue=[];cubeRestoring=false;
buildCube();
if(gameType&&gameType()==='cube'){
if(!gameRunning&&!fadingOut)drawStartScreen();
}
}

function keyToVec(k){return CUBE_FACES[k].n;}
function vecToKey(v){
if(v.x===1)return '+x';if(v.x===-1)return '-x';
if(v.y===1)return '+y';if(v.y===-1)return '-y';
if(v.z===1)return '+z';return '-z';
}
function rotateVec(v,axis,dir){
var x=v.x,y=v.y,z=v.z;
if(axis==='x')return{x:x,y:Math.round(-dir*z),z:Math.round(dir*y)};
if(axis==='y')return{x:Math.round(dir*z),y:y,z:Math.round(-dir*x)};
return{x:Math.round(-dir*y),y:Math.round(dir*x),z:z};
}
function rotatePoint(p,axis,angle){
var x=p.x,y=p.y,z=p.z,c=Math.cos(angle),s=Math.sin(angle);
if(axis==='x')return{x:x,y:y*c-z*s,z:y*s+z*c};
if(axis==='y')return{x:x*c+z*s,y:y,z:-x*s+z*c};
return{x:x*c-y*s,y:x*s+y*c,z:z};
}
function viewPoint(p){
var cosX=Math.cos(cubeRotX),sinX=Math.sin(cubeRotX);
var cosY=Math.cos(cubeRotY),sinY=Math.sin(cubeRotY);
var x1=p.x*cosY-p.z*sinY;
var z1=p.x*sinY+p.z*cosY;
var y1=p.y*cosX-z1*sinX;
var z2=p.y*sinX+z1*cosX;
return{x:x1,y:y1,z:z2};
}
function cubeProjectPoint(p,cx,cy){
var q=viewPoint(p);
var s=CUBE_FOV/(CUBE_FOV-q.z+0.35);
return{x:cx+q.x*s*CUBE_CELL,y:cy-q.y*s*CUBE_CELL,z:q.z,scale:s};
}
function projectedDisplacement(p0,p1,cv){
var cx=cv.width/2,cy=cv.height/2+2;
var a=cubeProjectPoint(p0,cx,cy);
var b=cubeProjectPoint(p1,cx,cy);
return{x:b.x-a.x,y:b.y-a.y};
}

function updateCubeTurn(now){
if(!cubeTurn&&cubeTurnQueue.length)startCubeTurn(cubeTurnQueue.shift(),now);
if(!cubeTurn)return;
if(cubeTurn.mode==='drag')return;
var t=clamp((now-cubeTurn.start)/cubeTurn.duration,0,1);
cubeTurn.progress=easeInOutCubic(t);
cubeTurn.angle=lerp(cubeTurn.fromAngle||0,cubeTurn.targetAngle,cubeTurn.progress);
if(t>=1){
cubeTurn.angle=cubeTurn.targetAngle;
var shouldCommit=Math.abs(cubeTurn.targetAngle)>0.01;
var finished=cubeTurn;
if(shouldCommit)commitTurn({axis:finished.axis,val:finished.val,dir:finished.targetAngle>0?1:-1});
cubeTurn=null;
if(cubeTurnQueue.length)startCubeTurn(cubeTurnQueue.shift(),now);
else if(cubeRestoring){cubeRestoring=false;cubeHistory=[];saveCubeState(true);}
}
}

function updateCubeMotion(now){
if(!cubeLastFrame){cubeLastFrame=now;return;}
var dt=Math.min((now-cubeLastFrame)/1000,0.05);
cubeLastFrame=now;
if(cubeDragging||cubeFaceDrag)return;
if(Math.abs(cubeRotVelX)<0.001&&Math.abs(cubeRotVelY)<0.001){
if(cubeRotVelX||cubeRotVelY)saveCubeState(true);
cubeRotVelX=0;cubeRotVelY=0;return;
}
cubeRotX=clamp(cubeRotX+cubeRotVelX*dt,CUBE_ROT_MIN,CUBE_ROT_MAX);
cubeRotY+=cubeRotVelY*dt;
var drag=Math.pow(0.90,dt*60);
cubeRotVelX*=drag;
cubeRotVelY*=drag;
saveCubeState(false);
}

function startAnimatedTurn(req,now,fromAngle,targetAngle,duration){
cubeTurn={axis:req.axis,val:req.val,dir:req.dir||1,mode:'animate',start:now||performance.now(),duration:duration||req.duration||260,progress:0,angle:fromAngle||0,fromAngle:fromAngle||0,targetAngle:targetAngle};
}

function snapCubeTurn(targetAngle){
if(!cubeTurn)return;
var current=cubeTurn.angle||0;
var req={axis:cubeTurn.axis,val:cubeTurn.val,dir:targetAngle>=0?1:-1};
var dist=Math.abs(targetAngle-current);
startAnimatedTurn(req,performance.now(),current,targetAngle,clamp(120+dist*110,120,260));
}

function startCubeTurn(req,now){
startAnimatedTurn(req,now||performance.now(),0,req.dir*(Math.PI/2),req.duration||260);
}

function rotateLayer(axis,val,dir){
val=Math.round(val);dir=dir>=0?1:-1;
var req={axis:axis,val:val,dir:dir};
if(cubeTurn){if(cubeTurn.mode!=='drag'&&cubeTurnQueue.length<2)cubeTurnQueue.push(req);return;}
startCubeTurn(req,performance.now());
}

function queueCubeTurn(axis,val,dir,duration){
var req={axis:axis,val:val,dir:dir>=0?1:-1,duration:duration||260};
if(cubeTurn||cubeTurnQueue.length)cubeTurnQueue.push(req);
else startCubeTurn(req,performance.now());
}

function scrambleCube(){
if(gameType()!=='cube')return;
if(!gameRunning&&!fadingOut){fadeOutToGame();setTimeout(scrambleCube,360);return;}
if(cubeTurn&&cubeTurn.mode==='drag')return;
cubeTurnQueue=[];
var axes=['x','y','z'],lastAxis='';
for(var i=0;i<18;i++){
var axis=axes[Math.floor(Math.random()*axes.length)];
if(axis===lastAxis)axis=axes[(axes.indexOf(axis)+1+Math.floor(Math.random()*2))%3];
lastAxis=axis;
queueCubeTurn(axis,CUBE_SCRAMBLE_LAYERS[Math.floor(Math.random()*CUBE_SCRAMBLE_LAYERS.length)],Math.random()<0.5?-1:1);
}
}

function resetCube(){
if(gameType()!=='cube')return;
if(cubeTurn&&cubeTurn.mode==='drag')return;
cubeRotVelX=0;cubeRotVelY=0;
cubeHover=null;cubeFaceDrag=null;cubeDragging=false;
if(!gameRunning||!cubeHistory.length){buildCube();cubeTurn=null;cubeTurnQueue=[];if(!gameRunning&&!fadingOut)drawStartScreen();return;}
var restore=cubeHistory.slice().reverse();
cubeHistory=[];
cubeRestoring=true;
cubeTurn=null;cubeTurnQueue=[];
for(var i=0;i<restore.length;i++)queueCubeTurn(restore[i].axis,restore[i].val,-restore[i].dir,90);
}

function commitTurn(turn){
if(!cubeRestoring)cubeHistory.push({axis:turn.axis,val:turn.val,dir:turn.dir});
for(var i=0;i<cubeCubies.length;i++){
var c=cubeCubies[i];
if(c[turn.axis]!==turn.val)continue;
var rp=rotateVec({x:c.x,y:c.y,z:c.z},turn.axis,turn.dir);
c.x=rp.x;c.y=rp.y;c.z=rp.z;
var nc={};
for(var k in c.c){
var nk=vecToKey(rotateVec(keyToVec(k),turn.axis,turn.dir));
nc[nk]=c.c[k];
}
c.c=nc;
}
saveCubeState(true);
}

function renderCube(ctx,cv,now){
updateCubeMotion(now);
updateCubeTurn(now);
ctx.save();
roundedPanel(ctx,cv);ctx.clip();
drawCubeFloor(ctx,cv);
var cx=cv.width/2,cy=cv.height/2+2;
var faces=[],faceKeys=Object.keys(CUBE_FACES);
for(var i=0;i<cubeCubies.length;i++){
var c=cubeCubies[i];
var active=cubeTurn&&c[cubeTurn.axis]===cubeTurn.val;
for(var fi=0;fi<faceKeys.length;fi++){
var f=faceKeys[fi];
var fc=CUBE_FACES[f].c;
var pts=[],depth=0;
for(var k=0;k<4;k++){
var wp={x:c.x+fc[k][0],y:c.y+fc[k][1],z:c.z+fc[k][2]};
if(active)wp=rotatePoint(wp,cubeTurn.axis,cubeTurn.angle);
var sp=cubeProjectPoint(wp,cx,cy);
pts.push(sp);depth+=sp.z;
}
var area=(pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[1].y-pts[0].y)*(pts[2].x-pts[0].x);
if(area>=0)continue;
var item={pts:pts,depth:depth/4,cubie:c,face:f,active:active};
faces.push({type:'body',item:item,depth:item.depth,order:0});
if(c.c[f])faces.push({type:'sticker',item:{pts:pts,depth:item.depth,color:c.c[f],cubie:c,face:f,active:active},depth:item.depth,order:1});
}
}
faces.sort(function(a,b){return a.depth-b.depth||a.order-b.order;});
for(i=0;i<faces.length;i++){
var faceItem=faces[i].item;
if(faces[i].type==='body')drawCubieBodyFace(ctx,faceItem);
else drawSticker(ctx,faceItem,cubeHover&&cubeHover.cubie===faceItem.cubie&&cubeHover.face===faceItem.face);
}
ctx.restore();
}

function drawCubeFloor(ctx,cv){
var floor=ctx.createRadialGradient(cv.width/2,cv.height*0.68,10,cv.width/2,cv.height*0.68,190);
floor.addColorStop(0,'rgba(0,0,0,0.26)');
floor.addColorStop(0.55,'rgba(0,0,0,0.10)');
floor.addColorStop(1,'rgba(0,0,0,0)');
ctx.fillStyle=floor;
ctx.beginPath();
ctx.ellipse(cv.width/2,cv.height*0.69,150,34,0,0,Math.PI*2);
ctx.fill();
}

function drawCubieBodyFace(ctx,item){
var pts=item.pts.map(function(p){return{x:p.x,y:p.y};});
var top=item.face==='+y',side=item.face==='+x'||item.face==='-x';
ctx.save();
ctx.shadowBlur=item.active?12:5;
ctx.shadowColor=item.active?'rgba(94,234,212,0.14)':'rgba(0,0,0,0.34)';
var grad=ctx.createLinearGradient(pts[0].x,pts[0].y,pts[2].x,pts[2].y);
if(top){
grad.addColorStop(0,'rgba(22,34,50,0.99)');
grad.addColorStop(1,'rgba(7,13,24,0.99)');
}else if(side){
grad.addColorStop(0,'rgba(13,23,38,0.99)');
grad.addColorStop(1,'rgba(4,9,18,0.99)');
}else{
grad.addColorStop(0,'rgba(10,18,31,0.99)');
grad.addColorStop(1,'rgba(3,8,16,0.99)');
}
ctx.fillStyle=grad;
roundedPoly(ctx,pts,6);
ctx.fill();
ctx.shadowBlur=0;
ctx.strokeStyle='rgba(96,142,181,0.16)';
ctx.lineWidth=0.8;
ctx.stroke();
ctx.restore();
}

function drawSticker(ctx,item,isHover){
var pts=item.pts.map(function(p){return{x:p.x,y:p.y};});
ctx.save();
ctx.shadowBlur=item.active?18:10;
ctx.shadowColor=item.active?'rgba(94,234,212,0.30)':'rgba(0,0,0,0.34)';
ctx.fillStyle='rgba(7,12,22,0.96)';
roundedPoly(ctx,pts,7);
ctx.fill();
ctx.shadowBlur=0;
var inner=insetPoly(pts,3.1);
var grad=ctx.createLinearGradient(inner[0].x,inner[0].y,inner[2].x,inner[2].y);
grad.addColorStop(0,lighten(item.color,0.16));
grad.addColorStop(0.58,item.color);
grad.addColorStop(1,darken(item.color,0.16));
ctx.fillStyle=grad;
roundedPoly(ctx,inner,Math.min(edgeMin(inner)*0.18,8));
ctx.fill();
ctx.strokeStyle=isHover?'rgba(255,255,255,0.62)':'rgba(255,255,255,0.20)';
ctx.lineWidth=isHover?1.4:0.8;
roundedPoly(ctx,inner,Math.min(edgeMin(inner)*0.18,8));
ctx.stroke();
ctx.restore();
}

function roundedPoly(ctx,pts,r){
if(!pts.length)return;
ctx.beginPath();
for(var i=0;i<pts.length;i++){
var p=pts[i],prev=pts[(i-1+pts.length)%pts.length],next=pts[(i+1)%pts.length];
var v1=norm({x:prev.x-p.x,y:prev.y-p.y});
var v2=norm({x:next.x-p.x,y:next.y-p.y});
var d1=dist(p,prev),d2=dist(p,next);
var rr=Math.min(r,d1*0.38,d2*0.38);
var a={x:p.x+v1.x*rr,y:p.y+v1.y*rr};
var b={x:p.x+v2.x*rr,y:p.y+v2.y*rr};
if(i===0)ctx.moveTo(a.x,a.y);else ctx.lineTo(a.x,a.y);
ctx.quadraticCurveTo(p.x,p.y,b.x,b.y);
}
ctx.closePath();
}
function insetPoly(pts,amount){
var cx=0,cy=0;
for(var i=0;i<pts.length;i++){cx+=pts[i].x;cy+=pts[i].y;}
cx/=pts.length;cy/=pts.length;
return pts.map(function(p){
var vx=cx-p.x,vy=cy-p.y,l=Math.sqrt(vx*vx+vy*vy)||1;
return{x:p.x+vx/l*amount,y:p.y+vy/l*amount};
});
}
function edgeMin(pts){
var m=Infinity;
for(var i=0;i<pts.length;i++)m=Math.min(m,dist(pts[i],pts[(i+1)%pts.length]));
return m;
}
function dist(a,b){var x=a.x-b.x,y=a.y-b.y;return Math.sqrt(x*x+y*y);}
function norm(v){var l=Math.sqrt(v.x*v.x+v.y*v.y)||1;return{x:v.x/l,y:v.y/l};}

function lighten(hex,amt){return shade(hex,amt);}
function darken(hex,amt){return shade(hex,-amt);}
function shade(hex,amt){
var h=hex.replace('#','');
var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
if(amt>=0){r=r+(255-r)*amt;g=g+(255-g)*amt;b=b+(255-b)*amt;}
else{r=r*(1+amt);g=g*(1+amt);b=b*(1+amt);}
return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')';
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
if(cubeTurn)return null;
var cx=cv.width/2,cy=cv.height/2+2;
var best=null,bestZ=-Infinity;
for(var i=0;i<cubeCubies.length;i++){
var c=cubeCubies[i];
for(var f in c.c){
var fc=CUBE_FACES[f].c;
var pts=[],z=0;
for(var k=0;k<4;k++){
var p=cubeProjectPoint({x:c.x+fc[k][0],y:c.y+fc[k][1],z:c.z+fc[k][2]},cx,cy);
pts.push({x:p.x,y:p.y});z+=p.z;
}
var area=(pts[1].x-pts[0].x)*(pts[2].y-pts[0].y)-(pts[1].y-pts[0].y)*(pts[2].x-pts[0].x);
if(area>=0)continue;
if(!pointInPoly(mx,my,pts))continue;
z/=4;
if(z>bestZ){bestZ=z;best={face:f,cubie:c,pts:pts};}
}
}
return best;
}

function facePlaneAxes(face){
var axis=face.charAt(1);
if(axis==='x')return['y','z'];
if(axis==='y')return['x','z'];
return['x','y'];
}

function dragAxesForFacelet(hit){
return facePlaneAxes(hit.face);
}

function unitVec(axis,sign){
var v={x:0,y:0,z:0};
v[axis]=sign||1;
return v;
}

function projectLocalGuide(hit,axis){
var cv=document.getElementById('gameCanvas');if(!cv)return null;
var cx=cv.width/2,cy=cv.height/2+2;
var p0=stickerCenterPoint(hit);
var p1={x:p0.x,y:p0.y,z:p0.z};
p1[axis]+=0.55;
var a=cubeProjectPoint(p0,cx,cy);
var b=cubeProjectPoint(p1,cx,cy);
return{x:b.x-a.x,y:b.y-a.y};
}

function stickerCenterPoint(hit){
var n=keyToVec(hit.face);
return{x:hit.cubie.x+n.x*CB,y:hit.cubie.y+n.y*CB,z:hit.cubie.z+n.z*CB};
}

function makeDragMove(hit,axis,dragAxis){
var cv=document.getElementById('gameCanvas');if(!cv)return null;
var p0=stickerCenterPoint(hit);
var angleStep=0.08;
var p1=rotatePoint(p0,axis,angleStep);
var d=projectedDisplacement(p0,p1,cv);
var len2=d.x*d.x+d.y*d.y;
if(len2<0.01)return null;
var guide=projectLocalGuide(hit,dragAxis);
var guideLen2=guide?guide.x*guide.x+guide.y*guide.y:0;
if(guideLen2<0.01){guide=d;guideLen2=len2;}
return{axis:axis,val:hit.cubie[axis],vec:d,len2:len2,angleStep:angleStep,guideVec:guide,guideLen2:guideLen2};
}

function moveAngleFromDrag(move,dx,dy){
var raw=((dx*move.vec.x+dy*move.vec.y)/move.len2)*(move.angleStep||0.08);
return clamp(raw,-Math.PI*0.62,Math.PI*0.62);
}

function updateCubeFaceDrag(now){
if(!cubeFaceDrag)return;
var dragLen=Math.sqrt(cubeDragDX*cubeDragDX+cubeDragDY*cubeDragDY);
if(!cubeFaceDrag.move){
var axes=dragAxesForFacelet(cubeFaceDrag.hit);
if(axes.length===1||dragLen>6){
var move=chooseDragMove(cubeFaceDrag.hit,cubeDragDX,cubeDragDY);
if(move){
cubeFaceDrag.move=move;
cubeTurn={axis:move.axis,val:move.val,dir:1,mode:'drag',angle:0,progress:0};
}
}
}
if(!cubeFaceDrag.move||!cubeTurn||cubeTurn.mode!=='drag')return;
var nextAngle=moveAngleFromDrag(cubeFaceDrag.move,cubeDragDX,cubeDragDY);
var dt=Math.max(12,now-cubeFaceDrag.lastAngleTime)/1000;
cubeTurn.velocity=(nextAngle-cubeFaceDrag.lastAngle)/dt;
cubeFaceDrag.lastAngle=nextAngle;
cubeFaceDrag.lastAngleTime=now;
cubeTurn.angle=nextAngle;
}

function finishCubeFaceDrag(){
if(!cubeTurn||cubeTurn.mode!=='drag'){return;}
var angle=cubeTurn.angle||0;
var velocity=cubeTurn.velocity||0;
var sign=Math.abs(velocity)>1.5?(velocity>0?1:-1):(angle>=0?1:-1);
var target=(Math.abs(angle)>Math.PI*0.23||Math.abs(velocity)>1.9)?sign*(Math.PI/2):0;
snapCubeTurn(target);
}

function chooseDragMove(hit,dx,dy){
var dragLen=Math.sqrt(dx*dx+dy*dy);
if(!hit||dragLen<1)return null;
var axes=dragAxesForFacelet(hit);
var best=null,bestScore=-Infinity;
for(var i=0;i<axes.length;i++){
var axis=axes[i],dragAxis=axes[(i+1)%axes.length];
var move=makeDragMove(hit,axis,dragAxis);
if(!move)continue;
var score=Math.abs(dx*move.guideVec.x+dy*move.guideVec.y)/(Math.sqrt(move.guideLen2)*dragLen);
if(score>bestScore){
bestScore=score;
best=move;
}
}
return best;
}

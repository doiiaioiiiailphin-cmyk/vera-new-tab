// game.js — Mini-game widget with carousel (disabled by default)
// Set settings.showGame=true to enable

var gameRunning=false,gameScore=0,gameTimer=null;
var gameSnake=[],gameDir={x:1,y:0},gameFood={x:0,y:0};
var GW=20,GH=13,CS=15,SCALE=2;

function initGame(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var prev=document.getElementById('gamePrev');if(prev)prev.addEventListener('click',function(e){e.stopPropagation();cycleGame(-1);});
var next=document.getElementById('gameNext');if(next)next.addEventListener('click',function(e){e.stopPropagation();cycleGame(1);});
updateGameLabel();
cv.width=GW*CS*SCALE;cv.height=GH*CS*SCALE;
cv.style.cssText='width:100%;cursor:pointer;display:block;position:relative;z-index:1;transform:translateZ(0);';
cv.addEventListener('click',function(e){
e.stopPropagation();
startGame();
});
document.addEventListener('keydown',handleKey);
drawStartScreen();
}

function drawStartScreen(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
ctx.fillStyle='#0a1228';ctx.fillRect(0,0,cv.width,cv.height);
ctx.fillStyle='#8aaccc';ctx.font='bold 20px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Click to start',cv.width/2,cv.height/2+8);
var sc=document.getElementById('gameScore');if(sc)sc.textContent='';
}

function handleKey(e){
if(!gameRunning)return;
if(e.key==='ArrowUp'&&gameDir.y===0){gameDir={x:0,y:-1};e.preventDefault();}
if(e.key==='ArrowDown'&&gameDir.y===0){gameDir={x:0,y:1};e.preventDefault();}
if(e.key==='ArrowLeft'&&gameDir.x===0){gameDir={x:-1,y:0};e.preventDefault();}
if(e.key==='ArrowRight'&&gameDir.x===0){gameDir={x:1,y:0};e.preventDefault();}
}

function startGame(){
resetGame();
gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
gameDir={x:1,y:0};gameScore=0;
spawnFood();gameRunning=true;
var sc=document.getElementById('gameScore');if(sc)sc.textContent='Score: 0';
draw();
gameTimer=setTimeout(tick,150);
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
var head={x:gameSnake[0].x+gameDir.x,y:gameSnake[0].y+gameDir.y};
if(head.x<0||head.x>=GW||head.y<0||head.y>=GH||gameSnake.some(function(s){return s.x===head.x&&s.y===head.y;})){gameOver();return;}
gameSnake.unshift(head);
if(head.x===gameFood.x&&head.y===gameFood.y){gameScore++;var sc=document.getElementById('gameScore');if(sc)sc.textContent='Score: '+gameScore;spawnFood();}
else{gameSnake.pop();}
draw();
gameTimer=setTimeout(tick,150);
}

function draw(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
ctx.fillStyle='#0a1228';ctx.fillRect(0,0,cv.width,cv.height);
ctx.fillStyle='#5eead4';
gameSnake.forEach(function(s){ctx.fillRect(s.x*CS*SCALE+SCALE,s.y*CS*SCALE+SCALE,CS*SCALE-2*SCALE,CS*SCALE-2*SCALE);});
ctx.fillStyle='#ff6b6b';ctx.fillRect(gameFood.x*CS*SCALE+SCALE,gameFood.y*CS*SCALE+SCALE,CS*SCALE-2*SCALE,CS*SCALE-2*SCALE);
}

function gameOver(){
gameRunning=false;clearTimeout(gameTimer);
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,cv.width,cv.height);
ctx.fillStyle='#e4f0fb';ctx.font='bold 20px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Game Over',cv.width/2,cv.height/2+8);
}

function resetGame(){gameRunning=false;clearTimeout(gameTimer);}

function updateGameLabel(){var lb=document.getElementById('gameName');if(lb)lb.textContent='Snake';}
function cycleGame(dir){gameIdx=(gameIdx+dir+GAME_LIST.length)%GAME_LIST.length;updateGameLabel();resetGame();drawStartScreen();}

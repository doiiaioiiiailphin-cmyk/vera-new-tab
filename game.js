// game.js — Mini-game widget with carousel (disabled by default)
// Set settings.showGame=true to enable

var GAME_LIST=[
{id:'snake',nameKey:'gameSnake'}
];
var gameIdx=0,gameRunning=false,gameScore=0,gameTimer=null;
var gameSnake=[],gameDir={x:1,y:0},gameFood={x:0,y:0};
var GW=20,GH=13,CS=15;

function initGame(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var prev=document.getElementById('gamePrev');if(prev)prev.addEventListener('click',function(e){e.stopPropagation();cycleGame(-1);});
var next=document.getElementById('gameNext');if(next)next.addEventListener('click',function(e){e.stopPropagation();cycleGame(1);});
updateGameLabel();
cv.width=GW*CS;cv.height=GH*CS;
cv.style.cursor='pointer';
cv.addEventListener('click',function(){
if(!gameRunning){startGame();}else{resetGame();}
});
document.addEventListener('keydown',handleKey);
drawStartScreen();
}
function drawStartScreen(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
var bg=getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim()||'#060d1a';
ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim()||'#8aaccc';
ctx.font='14px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Click to start',cv.width/2,cv.height/2+5);
var sc=document.getElementById('gameScore');if(sc)sc.textContent='';
}
function cycleGame(dir){gameIdx=(gameIdx+dir+GAME_LIST.length)%GAME_LIST.length;updateGameLabel();resetGame();drawStartScreen();}
function updateGameLabel(){var lb=document.getElementById('gameName');if(lb)lb.textContent='Snake';}
function handleKey(e){
if(!gameRunning)return;
if(e.key==='ArrowUp'&&gameDir.y===0){gameDir={x:0,y:-1};e.preventDefault();}
if(e.key==='ArrowDown'&&gameDir.y===0){gameDir={x:0,y:1};e.preventDefault();}
if(e.key==='ArrowLeft'&&gameDir.x===0){gameDir={x:-1,y:0};e.preventDefault();}
if(e.key==='ArrowRight'&&gameDir.x===0){gameDir={x:1,y:0};e.preventDefault();}
}

function startGame(){
gameSnake=[{x:10,y:6},{x:9,y:6},{x:8,y:6}];
gameDir={x:1,y:0};gameScore=0;
spawnFood();gameRunning=true;
var sc=document.getElementById('gameScore');if(sc)sc.textContent='Score: 0';
tick();
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
gameTimer=setTimeout(tick,120);
}
function draw(){
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
var bg=getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim()||'#060d1a';
ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
var accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#5eead4';
ctx.fillStyle=accent;
gameSnake.forEach(function(s){ctx.fillRect(s.x*CS+1,s.y*CS+1,CS-2,CS-2);});
ctx.fillStyle='#ff6b6b';ctx.fillRect(gameFood.x*CS+1,gameFood.y*CS+1,CS-2,CS-2);
}
function gameOver(){
gameRunning=false;clearTimeout(gameTimer);
var cv=document.getElementById('gameCanvas');if(!cv)return;
var ctx=cv.getContext('2d');
ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,cv.width,cv.height);
ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#e4f0fb';
ctx.font='14px Lexend,sans-serif';ctx.textAlign='center';
ctx.fillText('Game Over',cv.width/2,cv.height/2+5);
}
function resetGame(){gameRunning=false;clearTimeout(gameTimer);}

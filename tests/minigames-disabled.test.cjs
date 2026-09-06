const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {createApp}=require('./harness.cjs');

test('old enabled game settings cannot load games or occupy either desktop layout',async t=>{
  const game={type:'widget',id:'game',x:500,y:500,w:5,h:4};
  const app=await createApp({settings:{showGame:true,showWeather:false,showQuote:false,showTodo:false,showPomodoro:false,freeLayout:{enabled:false,initialized:true,layoutVersion:6,items:{'widget:game':game},folders:{}}}});
  t.after(()=>app.close());
  app.w.localStorage.setItem('vera_cube_state_v1','preserved-game-save');
  assert.equal(app.document.getElementById('widgetsGrid').style.display,'none');
  for(const enabled of [true,false,true]){
    app.settings().freeLayout.enabled=enabled;app.api.applyAll();
    await app.visibility(true);await app.visibility(false);
    assert.equal(app.w.VeraGame,undefined);
    assert.equal(app.w.initGame,undefined);
    assert.equal(app.document.querySelector('#gameWidget,#toggleGame,#gameCanvas,[data-widget-id="game"]'),null);
    assert.equal(app.document.querySelector('script[src*="game.js"]'),null);
    assert.ok(!app.images.some(url=>url.includes('game-cover')));
    assert.equal(app.settings().showGame,true,'keep dormant preference');
    assert.deepEqual(JSON.parse(JSON.stringify(app.settings().freeLayout.items['widget:game'])),game);
    if(enabled)assert.ok(parseFloat(app.document.getElementById('freeLayoutSurface').style.width)<10000,'dormant coordinates must not enlarge canvas');
  }
  app.api.saveSettings();
  assert.equal(app.w.localStorage.getItem('vera_cube_state_v1'),'preserved-game-save');
  assert.deepEqual(app.errors,[]);
});

test('extracted game implementation and covers retain their original hashes',()=>{
  const dir=path.resolve(__dirname,'../modules/minigames');
  const archive=JSON.parse(fs.readFileSync(path.join(dir,'archive.json'),'utf8'));
  assert.equal(archive.enabled,false);
  for(const [file,hash] of Object.entries(archive.originalSha256)){
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex'),hash);
  }
});

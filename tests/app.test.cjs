const test=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('./harness.cjs');
const snapshot=value=>JSON.parse(JSON.stringify(value));

test('default desktop boots without starting games or loading celestial assets',async t=>{
  const app=await createApp();t.after(()=>app.close());
  assert.deepEqual(app.errors,[]);
  assert.equal(app.w.gameInitialized,undefined);
  assert.equal(app.document.querySelector('#earthScene canvas'),null);
  assert.equal(app.canvasCalls(),0);
  assert.ok(app.document.body.classList.contains('daylight-theme'));
  assert.ok(!app.requests.some(r=>r.url.includes('assets/')));
  assert.ok(!app.images.some(url=>/moon|saturn|game-cover/.test(url)));
  assert.equal(app.document.querySelectorAll('main').length,1);
});

test('legacy customizations, content and free desktop coordinates survive loading',async t=>{
  const settings={theme:'dark',language:'ja',accent:'#dabbee',bgImage:'https://example.test/wallpaper.jpg',showBgImage:true,showWeather:false,links:[{id:'a',name:'Saved',url:'https://example.test'}],todos:[{text:'Keep me',done:true}],freeLayout:{enabled:false,initialized:true,layoutVersion:6,items:{'link:a':{type:'link',id:'a',x:-3,y:9,w:1,h:1}},folders:{}},pomodoro:{mode:'focus',focus:40,short:7,long:20,remaining:2100,running:false,rounds:3}};
  const app=await createApp({settings});t.after(()=>app.close());
  for(const key of ['theme','language','accent','bgImage','todos','links'])assert.deepEqual(snapshot(app.settings()[key]),settings[key]);
  assert.deepEqual(snapshot(app.settings().freeLayout.items),settings.freeLayout.items);
  assert.equal(app.settings().pomodoro.focus,40);
  assert.equal(app.settings().pomodoro.rounds,3);
  assert.equal(app.document.documentElement.lang,'ja');
});

test('all widget visibility combinations survive appearance updates',async t=>{
  const app=await createApp();t.after(()=>app.close());
  const keys=['showWeather','showTodo','showQuote','showPomodoro'];
  const ids=['weatherWidget','todoWidget','quoteWidget','pomodoroWidget'];
  for(let mask=0;mask<16;mask++){
    keys.forEach((key,i)=>app.settings()[key]=!!(mask&(1<<i)));
    app.settings().showLinks=false;app.api.applyAll();
    assert.equal(app.document.getElementById('linksContainer').style.display,'none');
    assert.equal(app.document.getElementById('widgetsGrid').style.display,mask?'':'none');
    keys.forEach((key,i)=>assert.equal(app.document.getElementById(ids[i]).style.display,app.settings()[key]?'':'none'));
  }
  app.settings().accent='#335544';app.api.applyAll();
  assert.equal(app.document.getElementById('linksContainer').style.display,'none');
  assert.deepEqual(app.errors,[]);
});

test('fine tuning preserves a focused draft and existing todo DOM',async t=>{
  const app=await createApp({settings:{todos:[{text:'One task',done:false}]}});t.after(()=>app.close());
  app.click('settingsBtn');await app.settle();
  const original=app.document.querySelector('.todo-item');
  const input=app.document.getElementById('todoInput');input.value='Unfinished thought';
  app.input('setGlassOpacity','12');await app.runTimers(80);
  assert.equal(app.document.querySelector('.todo-item'),original);
  assert.equal(input.value,'Unfinished thought');
  assert.equal(app.document.activeElement.id,'setGlassOpacity');
});

test('search ignores stale responses, supports selection, and cancels when cleared',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.input('searchInput','older');await app.runTimers(250);
  const old=app.requests.find(r=>r.url.includes('q=older'));
  app.input('searchInput','newer');await app.runTimers(250);
  const latest=app.requests.find(r=>r.url.includes('q=newer'));
  assert.equal(old.init.signal.aborted,true);
  latest.resolve(['newer',['newer result','second result']]);await app.settle();
  old.resolve(['older',['stale result']]);await app.settle();
  assert.match(app.document.getElementById('suggestDropdown').textContent,/newer result/);
  assert.doesNotMatch(app.document.getElementById('suggestDropdown').textContent,/stale/);
  app.key('searchInput','ArrowDown');
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-activedescendant'),'suggest-option-0');
  app.key('searchInput','ArrowDown');app.key('searchInput','Enter');
  assert.equal(app.document.getElementById('searchInput').value,'second result');
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-expanded'),'false');
  app.input('searchInput','future');await app.runTimers(250);
  const future=app.requests.find(r=>r.url.includes('q=future'));
  app.input('searchInput','');future.resolve(['future',['must not show']]);await app.settle();
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-expanded'),'false');
});

test('search handles engine switches, failure, Escape and input composition',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.input('searchInput','pending');await app.runTimers(250);
  const old=app.requests.find(r=>r.url.includes('q=pending'));
  app.document.querySelector('[data-engine="bing"]').click();
  old.resolve(['pending',['wrong engine']]);await app.settle();
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-expanded'),'false');
  app.input('searchInput','offline');await app.runTimers(250);
  app.requests.find(r=>r.url.includes('query=offline')).reject(new Error('Offline'));await app.settle();
  assert.equal(app.document.getElementById('searchInput').value,'offline');
  app.key('searchInput','Enter',{isComposing:true});
  app.key('searchInput','Escape');
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-expanded'),'false');
  app.document.getElementById('todoInput').focus();app.key('todoInput','k',{ctrlKey:true});
  assert.equal(app.document.activeElement.id,'searchInput');
});

test('todos have operable controls and persist add, complete, reopen and delete',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.input('todoInput','Ship the desktop');app.key('todoInput','Enter');
  assert.equal(app.settings().todos[0].text,'Ship the desktop');
  app.document.querySelector('.todo-check').click();
  assert.equal(app.document.querySelector('.todo-check').getAttribute('aria-checked'),'true');
  app.document.querySelector('.todo-check').click();assert.equal(app.settings().todos[0].done,false);
  app.document.querySelector('.todo-del').click();
  assert.equal(app.settings().todos.length,0);assert.ok(app.document.querySelector('#todoList .empty-state'));
  assert.deepEqual(JSON.parse(app.w.localStorage.getItem('newtab_settings_v3')).todos,[]);
});

test('pomodoro resumes from absolute time, completes once and pauses background ticks',async t=>{
  const app=await createApp({settings:{showPomodoro:true,pomodoro:{mode:'focus',focus:25,short:5,long:15,remaining:1500,running:true,endsAt:Date.now()+90000,rounds:0}}});t.after(()=>app.close());
  assert.ok(app.settings().pomodoro.remaining<=90);
  await app.visibility(true);
  assert.ok(![...app.timers.values()].some(t=>t.fn.name==='renderPomodoro'));
  app.settings().pomodoro.endsAt=Date.now()-1000;
  await app.visibility(false);
  assert.equal(app.settings().pomodoro.rounds,1);assert.equal(app.settings().pomodoro.mode,'short');assert.equal(app.settings().pomodoro.running,false);
  await app.visibility(true);await app.visibility(false);assert.equal(app.settings().pomodoro.rounds,1);
});

test('free desktop keeps negative and distant coordinates reachable through its viewport',async t=>{
  const app=await createApp({width:390,height:844});t.after(()=>app.close());
  app.settings().freeLayout.enabled=true;app.api.applyAll();
  const first=Object.values(app.settings().freeLayout.items).find(item=>item.type==='link');
  first.x=-5;first.y=12;app.api.renderFreeLayout();
  const original=snapshot(app.settings().freeLayout.items);
  const viewport=app.document.getElementById('freeLayoutViewport');viewport.scrollLeft=240;viewport.scrollTop=300;
  app.api.renderFreeLayout();
  assert.equal(viewport.scrollLeft,240);assert.equal(viewport.scrollTop,300);
  const grid=app.api.getFreeGrid();assert.equal(grid.shiftX,5);assert.ok(grid.cols>=20);
  for(const el of app.document.querySelectorAll('.free-layout-item'))assert.ok(parseFloat(el.style.left)>=0);
  assert.deepEqual(snapshot(app.settings().freeLayout.items),original);
  app.w.innerWidth=1920;app.w.dispatchEvent(new app.w.Event('resize'));await app.settle();
  assert.deepEqual(snapshot(app.settings().freeLayout.items),original);
  app.settings().showLinks=false;app.api.applyAll();assert.equal(app.document.querySelectorAll('.free-layout-item[data-kind="link"]').length,0);
  app.settings().freeLayout.enabled=false;app.api.applyAll();
  assert.equal(app.document.getElementById('linksContainer').style.display,'none');assert.equal(viewport.hidden,true);
});

test('free folders merge and unpack without losing links',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.settings().freeLayout.enabled=true;app.api.applyAll();
  const ids=app.settings().links.map(link=>link.id);
  app.api.createFolderFromLinks(ids[0],ids[1]);
  const folderId=Object.keys(app.settings().freeLayout.folders)[0];assert.ok(folderId);
  assert.deepEqual(snapshot(app.settings().freeLayout.folders[folderId].linkIds).sort(),[ids[0],ids[1]].sort());
  app.api.unpackFolder(folderId);app.api.renderFreeLayout();
  assert.equal(Object.keys(app.settings().freeLayout.folders).length,0);
  assert.deepEqual(snapshot(app.settings().links.map(link=>link.id)),snapshot(ids));
});

test('dialogs trap keyboard focus and return it to their opener',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.document.getElementById('settingsBtn').focus();app.click('settingsBtn');await app.settle();
  assert.equal(app.document.getElementById('desktopMain').inert,true);
  assert.ok(app.document.getElementById('settingsPanel').contains(app.document.activeElement));
  app.document.getElementById('tab-appearance').focus();app.key('tab-appearance','ArrowRight');await app.settle();
  assert.equal(app.document.getElementById('tab-widgets').getAttribute('aria-selected'),'true');
  app.key('tab-widgets','Escape');await app.settle();
  assert.equal(app.document.activeElement.id,'settingsBtn');assert.equal(app.document.getElementById('settingsPanel').inert,true);
});

test('weather permission errors offer a single retry; storage failures remain visible',async t=>{
  const app=await createApp({settings:{language:'zh'}});t.after(()=>app.close());
  assert.equal(app.document.querySelectorAll('#weatherContent .retry-btn').length,1);
  app.document.querySelector('#weatherContent .retry-btn').click();await app.settle();
  assert.equal(app.document.querySelectorAll('#weatherContent .retry-btn').length,1);
  const proto=Object.getPrototypeOf(app.w.localStorage),original=proto.setItem;
  proto.setItem=function(){throw new Error('Quota exceeded');};
  assert.equal(app.api.saveSettings(),false);assert.equal(app.document.getElementById('storageNotice').hidden,false);
  proto.setItem=original;assert.equal(app.api.saveSettings(),true);assert.equal(app.document.getElementById('storageNotice').hidden,true);
});

test('all retained themes and languages can be switched without restarting the desktop',async t=>{
  const app=await createApp({reduced:true});t.after(()=>app.close());
  for(const theme of ['horizon','landscape','earth','moon','saturn','pixel']){
    for(const language of ['zh','en','ja']){
      app.settings().bgTheme=theme;app.settings().showBgImage=true;app.settings().language=language;app.api.applyAll();await app.settle();
      assert.equal(app.document.documentElement.lang,language);
      assert.ok(app.document.getElementById('searchInput').getAttribute('aria-label'));
      assert.equal(app.document.getElementById('todoInput').value,'');
    }
  }
  assert.equal(app.document.documentElement.getAttribute('data-theme'),'dark');
  app.settings().bgTheme='horizon';app.api.applyAll();
  assert.equal(app.document.getElementById('earthScene').style.display,'none');
  assert.deepEqual(app.errors,[]);
});

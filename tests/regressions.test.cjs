const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createApp,root}=require('./harness.cjs');

test('clicking or cancelling a running timer does not change its duration',async t=>{
  const app=await createApp({settings:{showPomodoro:true}});t.after(()=>app.close());
  app.click('pomodoroStart');const end=app.settings().pomodoro.endsAt;
  app.document.getElementById('pomodoroTime').focus();app.document.getElementById('searchInput').focus();
  assert.equal(app.settings().pomodoro.running,true);assert.equal(app.settings().pomodoro.endsAt,end);assert.equal(app.settings().pomodoro.focus,25);
  app.input('pomodoroTime','09:12');app.key('pomodoroTime','Escape');
  assert.equal(app.settings().pomodoro.running,true);assert.equal(app.settings().pomodoro.focus,25);
  app.input('pomodoroTime','09:12');app.key('pomodoroTime','Enter');
  assert.equal(app.settings().pomodoro.running,false);assert.equal(app.settings().pomodoro.remaining,552);
});

test('shortcut keyboard access, create, rename and delete persist',async t=>{
  const app=await createApp();t.after(()=>app.close());
  const first=app.document.querySelector('.link-card');first.focus();first.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
  assert.equal(app.w.__opened.url,app.settings().links[0].url);
  app.click('addLinkCard');await app.settle();
  app.document.getElementById('linkNameInput').value='Example';app.document.getElementById('linkUrlInput').value='https://example.test/path';app.click('linkModalSave');await app.settle();
  assert.equal(app.settings().links.at(-1).name,'Example');
  assert.ok(app.document.querySelectorAll('.link-card').length>5);
  app.click('settingsBtn');await app.settle();
  app.document.querySelector('[data-tab="links"]').click();
  app.document.querySelector('[data-edit="5"]').click();await app.settle();
  app.document.getElementById('linkNameInput').value='Renamed example';app.click('linkModalSave');await app.settle();
  assert.equal(app.settings().links.at(-1).name,'Renamed example');
  app.document.querySelectorAll('.link-delete')[0].click();
  assert.equal(app.settings().links.length,5);
  assert.equal(JSON.parse(app.w.localStorage.getItem('newtab_settings_v3')).links.at(-1).url,'https://example.test/path');
});

test('incomplete or malformed stored settings fall back without blocking boot',async t=>{
  for(const settings of [null,12,[],{pomodoro:42,todos:null,links:null}]){
    const app=await createApp({settings});t.after(()=>app.close());
    assert.deepEqual(app.errors,[]);
    assert.ok(Array.isArray(app.settings().todos));assert.ok(Array.isArray(app.settings().links));
    assert.equal(app.settings().pomodoro.mode,'focus');
  }
});

test('free desktop initially centers its clock on narrow windows without moving saved items',async t=>{
  const app=await createApp({width:390,height:844});t.after(()=>app.close());
  app.settings().freeLayout.enabled=true;app.api.applyAll();
  const viewport=app.document.getElementById('freeLayoutViewport');
  assert.ok(viewport.scrollLeft>0,'initial view should reach the central content');
  const positions=JSON.stringify(app.settings().freeLayout.items);
  app.settings().accent='#294f38';app.api.applyAll();
  assert.equal(JSON.stringify(app.settings().freeLayout.items),positions);
});

test('weather falls back to the second provider and offers retry when both fail',async t=>{
  const app=await createApp({settings:{language:'en'},location:{latitude:30,longitude:120}});t.after(()=>app.close());
  app.requests.find(r=>r.url.includes('open-meteo')).reject(new Error('Offline'));await app.settle();
  const fallback=app.requests.find(r=>r.url.includes('wttr.in'));assert.ok(fallback);
  fallback.reject(new Error('Offline'));await app.settle();
  assert.equal(app.document.getElementById('weatherContent').getAttribute('aria-busy'),'false');
  assert.equal(app.document.querySelector('#weatherContent button').textContent,'Retry');
});

test('celestial resources are requested only for the selected body and cached between switches',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.settings().bgTheme='moon';app.settings().showBgImage=true;app.api.applyAll();await app.settle();
  assert.equal(app.requests.filter(r=>r.url.includes('moon-nasa-model-samples')).length,1);
  assert.equal(app.requests.filter(r=>r.url.includes('saturn-nasa-model-samples')).length,0);
  assert.ok(!app.images.some(url=>url.includes('saturn')));
  app.settings().bgTheme='saturn';app.api.applyAll();await app.settle();
  assert.equal(app.requests.filter(r=>r.url.includes('saturn-nasa-model-samples')).length,1);
  app.settings().bgTheme='moon';app.api.applyAll();await app.settle();
  assert.equal(app.requests.filter(r=>r.url.includes('moon-nasa-model-samples')).length,1);
});

test('normal layouts at target viewport sizes never hide todo content',async t=>{
  for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844]]){
    const app=await createApp({width,height,settings:{showPomodoro:true,showGame:true,todos:[{text:'Still visible',done:false}]}});t.after(()=>app.close());
    assert.equal(app.document.getElementById('todoWidget').style.display,'');
    assert.match(app.document.getElementById('todoList').textContent,/Still visible/);
    assert.equal(app.document.getElementById('widgetsGrid').classList.contains('dashboard-layout'),false);
    assert.deepEqual(app.errors,[]);
  }
});

test('engine popup returns focus on Escape and suggestions close on blur',async t=>{
  const app=await createApp();t.after(()=>app.close());
  app.document.getElementById('searchEngineBtn').focus();app.key('searchEngineBtn','ArrowDown');
  await app.settle();assert.equal(app.document.getElementById('searchEngineBtn').getAttribute('aria-expanded'),'true');
  assert.ok(app.document.activeElement.classList.contains('engine-option'));
  app.document.activeElement.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));
  assert.equal(app.document.activeElement.id,'searchEngineBtn');
  await app.settle();assert.equal(app.document.getElementById('searchEngineBtn').getAttribute('aria-expanded'),'false');
  app.input('searchInput','ready');await app.runTimers(250);
  app.requests.find(r=>r.url.includes('q=ready')).resolve(['ready',['ready result']]);await app.settle();
  app.document.getElementById('todoInput').focus();
  assert.equal(app.document.getElementById('searchInput').getAttribute('aria-expanded'),'false');
});

test('collapsed theme groups are not focusable and onboarding leads to desktop settings',async t=>{
  const app=await createApp({onboarded:false});t.after(()=>app.close());
  assert.ok(app.document.querySelector('.theme-series.collapsed .theme-series-items-wrap[inert]'));
  app.document.querySelector('#onboardingHint button').click();await app.settle();
  assert.equal(app.document.getElementById('onboardingHint'),null);
  assert.equal(app.document.getElementById('tab-widgets').getAttribute('aria-selected'),'true');
  assert.equal(app.document.getElementById('settingsPanel').classList.contains('open'),true);
});

test('baseline light and dark text colors meet 4.5:1 contrast against their surfaces',()=>{
  function lum(hex){const c=hex.replace('#','').match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
  for(const [bg,fg] of [['#f5f2ea','#263e32'],['#f5f2ea','#56675a'],['#f5f2ea','#5f6e5b'],['#17201d','#edf0e8'],['#17201d','#bdc7ba'],['#17201d','#9eae9d']]){
    const a=lum(bg),b=lum(fg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);assert.ok(ratio>=4.5,`${bg}/${fg}: ${ratio}`);
    assert.ok(fs.readFileSync(path.join(root,'styles/daylight.css'),'utf8').includes(fg));
  }
});

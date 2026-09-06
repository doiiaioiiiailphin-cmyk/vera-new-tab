const test=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('./harness.cjs');

test('initial hidden page does not consume text animation before the first visible frame',async t=>{
  for(const free of [false,true]){
    const app=await createApp({deferFirstFrame:true,settings:{showPomodoro:true,todos:[{text:'待办也要随机浮出',done:false}],freeLayout:{enabled:free}}});
    t.after(()=>app.close());
    const style=app.document.createElement('style');
    style.textContent='.vera-booting .main-container{visibility:hidden}';app.document.head.appendChild(style);
    assert.ok(app.document.documentElement.classList.contains('vera-booting'));
    assert.equal(app.document.querySelector('.text-entrance-char'),null,'hidden boot must not mark text handled');
    app.w.VeraDebug.initTextEntranceAnimations(app.document.getElementById('quoteContent'));
    assert.equal(app.document.querySelector('.text-entrance-char'),null);
    await app.flushFrame();
    assert.ok(!app.document.documentElement.classList.contains('vera-booting'));
    const scope=free?app.document.getElementById('freeLayoutSurface'):app.document.getElementById('desktopMain');
    for(const selector of ['#clockPrimary','#clockDate','.link-name','#todoWidget .todo-text','#pomodoroWidget .widget-title','#quoteContent .quote-text']){
      assert.ok(scope.querySelector(selector+' .text-entrance-char'),`${free?'free':'normal'} ${selector} must animate on first visible frame`);
    }
    assert.deepEqual(app.errors,[]);
  }
});

test('ordinary themes animate entry without rewrapping text or replaying existing cards',async t=>{
  const app=await createApp();t.after(()=>app.close());
  const card=app.document.querySelector('.search-wrap');
  assert.ok(card.classList.contains('entrance-card'));
  assert.ok(app.document.querySelector('.quote-text .text-entrance-char'));
  const event=new app.w.Event('animationend');
  Object.defineProperty(event,'animationName',{value:'veraEntrance'});
  card.dispatchEvent(event);
  app.document.getElementById('searchInput').value='keep this draft';
  app.api.applyAll();app.w.VeraDebug.initEntranceAnimations();
  assert.ok(!card.classList.contains('entrance-card'));
  assert.equal(app.document.querySelector('.text-entrance-char .text-entrance-char'),null);
  assert.equal(app.document.getElementById('searchInput').value,'keep this draft');
  assert.deepEqual(app.errors,[]);
});

test('reduced motion skips entry and hidden pages pause animations',async t=>{
  const app=await createApp({reduced:true});t.after(()=>app.close());
  assert.equal(app.document.querySelector('.entrance-card,.pixel-entrance-card,.text-entrance-char'),null);
  await app.visibility(true);assert.ok(app.document.body.classList.contains('page-paused'));
  await app.visibility(false);assert.ok(!app.document.body.classList.contains('page-paused'));
});

test('rebuilding and resizing cards after boot cannot replay opening animations',async t=>{
  const app=await createApp();t.after(()=>app.close());
  assert.ok(app.document.querySelector('.entrance-card'));
  app.settings().freeLayout.enabled=true;app.api.applyAll();
  const assertSettled=()=>assert.equal(app.document.querySelector('.entrance-card,.pixel-entrance-card,.text-entrance-char,.pixel-text-entrance-char'),null);
  assertSettled();
  const item=app.settings().freeLayout.items['widget:clock'];
  item.x+=2;item.w+=1;
  app.api.renderFreeLayout();assertSettled();
  app.settings().freeLayout.enabled=false;app.api.applyAll();assertSettled();
  app.api.renderQuickLinks();
  app.api.showQuote();
  app.w.VeraDebug.initEntranceAnimations();
  app.w.VeraDebug.initTextEntranceAnimations();
  assertSettled();
  assert.ok(app.document.getElementById('clockPrimary').textContent.trim());
  assert.ok(app.document.querySelector('.quote-text').textContent.trim());
  assert.deepEqual(app.errors,[]);
});

test('new text uses independent random delays, repeats stay still, and finished letters cannot replay on reparent',async t=>{
  const app=await createApp();t.after(()=>app.close());
  const root=app.document.getElementById('quoteContent');
  root.innerHTML='<div class="quote-text">新的文字逐个浮出</div>';
  const originalRandom=app.w.Math.random;
  const samples=[.8,.1,.6,.3,.95,0,.5,.2];let randomIndex=0;
  app.w.Math.random=()=>samples[randomIndex++%samples.length];
  app.w.VeraDebug.initTextEntranceAnimations(root);
  app.w.Math.random=originalRandom;
  const chars=Array.from(root.querySelectorAll('.text-entrance-char'));
  assert.equal(chars.length,8);
  const delays=chars.map(el=>parseFloat(el.style.getPropertyValue('--text-entrance-delay')));
  const baseDelay=Math.min(...delays);
  assert.deepEqual(delays.map(d=>d-baseDelay),samples.map(v=>v*1000));
  assert.ok(delays[0]>delays[1]&&delays[1]<delays[2],'letters must not appear left-to-right');
  for(const el of chars){
    const end=new app.w.Event('animationend');Object.defineProperty(end,'animationName',{value:'textEntrance'});el.dispatchEvent(end);
  }
  assert.equal(root.querySelector('.text-entrance-char'),null);
  assert.equal(root.querySelectorAll('[data-text-entrance-ready]').length,8);
  app.settings().freeLayout.enabled=true;app.api.applyAll();
  app.w.VeraDebug.initTextEntranceAnimations(root);
  assert.equal(root.querySelector('.text-entrance-char'),null);
  root.innerHTML='<div class="quote-text">新的文字逐个浮出</div>';
  app.w.VeraDebug.initTextEntranceAnimations(root);
  assert.equal(root.querySelector('.text-entrance-char'),null,'same content reconstructed without animation');
  root.innerHTML='<div class="quote-text">另一句新文字</div>';
  app.w.VeraDebug.initTextEntranceAnimations(root);
  assert.ok(root.querySelector('.text-entrance-char'),'changed content animates');
});

test('unrelated layout updates preserve the running text entrance and language changes animate new text',async t=>{
  const app=await createApp();t.after(()=>app.close());
  const char=app.document.querySelector('.quote-text .text-entrance-char');
  app.settings().showPomodoro=true;app.api.applyAll();
  assert.ok(char.isConnected&&char.classList.contains('text-entrance-char'));
  app.settings().language='en';app.api.applyAll();
  assert.ok(app.document.querySelector('.quote-text .text-entrance-char'));
  assert.deepEqual(app.errors,[]);
});

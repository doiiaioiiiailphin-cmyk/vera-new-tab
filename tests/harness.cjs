const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = path.resolve(__dirname, '..');

async function createApp(options = {}) {
  const errors = [], requests = [], images = [], timers = new Map(), frames = new Map();
  let nextTimer = 1, hidden = false, reduced = !!options.reduced, canvasCalls = 0;
  const console = new VirtualConsole();
  console.on('jsdomError', error => { if (!error.message.includes('navigation (except hash changes)')) errors.push(error); });
  const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'), {
    url:'https://vera.test/', runScripts:'outside-only', pretendToBeVisual:true, virtualConsole:console
  });
  const w = dom.window;
  await new Promise(resolve => w.document.addEventListener('DOMContentLoaded', resolve, {once:true}));
  Object.defineProperty(w.document,'hidden',{get:()=>hidden});
  Object.defineProperty(w,'innerWidth',{value:options.width||1366,writable:true});
  Object.defineProperty(w,'innerHeight',{value:options.height||768,writable:true});
  Object.defineProperty(w.HTMLElement.prototype,'inert',{get(){return this.hasAttribute('inert');},set(value){this.toggleAttribute('inert',value);},configurable:true});
  w.CSS = { escape: value => String(value).replace(/[^a-zA-Z0-9_-]/g,'\\$&') };
  w.matchMedia = query => ({ matches:query.includes('reduced-motion')?reduced:!!options.dark, media:query, addEventListener(){}, removeEventListener(){} });
  w.setTimeout = (fn,delay=0) => { const id=nextTimer++;timers.set(id,{fn,delay,interval:false});return id; };
  w.clearTimeout = id => timers.delete(id);
  w.setInterval = (fn,delay=0) => { const id=nextTimer++;timers.set(id,{fn,delay,interval:true});return id; };
  w.clearInterval = id => timers.delete(id);
  w.requestAnimationFrame = fn => { const id=nextTimer++;frames.set(id,fn);return id; };
  w.cancelAnimationFrame = id => frames.delete(id);
  w.AbortController = AbortController;
  w.AbortSignal = AbortSignal;
  w.confirm = () => true;
  w.open = (url,target,features) => { w.__opened={url,target,features}; };
  const gradient = {addColorStop(){}};
  const context = new Proxy({
    measureText(text){return {width:String(text).length*8};},
    createLinearGradient(){return gradient;},createRadialGradient(){return gradient;},
    getImageData(){return {data:new Uint8ClampedArray(16),width:2,height:2};},
    createImageData(width,height){return {data:new Uint8ClampedArray(width*height*4)};}
  },{get(target,key){if(key in target)return target[key];return ()=>{};},set(target,key,value){target[key]=value;return true;}});
  w.HTMLCanvasElement.prototype.getContext = function(){canvasCalls++;return context;};
  const NativeImage = w.Image;
  w.Image = function(){const img=new NativeImage();Object.defineProperty(img,'src',{get(){return this._src||'';},set(value){this._src=value;images.push(value);}});return img;};
  w.Element.prototype.getBoundingClientRect = function(){
    let width=parseFloat(this.style?.width)||Math.min(760,w.innerWidth-40),height=parseFloat(this.style?.height)||64,left=20,top=240;
    if(this.id==='freeLayoutSurface'){left=16-(this.parentElement.scrollLeft||0);top=82-(this.parentElement.scrollTop||0);}
    return {x:left,y:top,left,top,width,height,right:left+width,bottom:top+height,toJSON(){return this;}};
  };
  w.navigator.geolocation={getCurrentPosition(success,error){if(options.location)success({coords:options.location});else error({code:1,message:'Permission denied'});}};
  w.navigator.permissions={query:()=>Promise.resolve({state:'denied',onchange:null})};
  w.fetch = (url,init={}) => {
    let resolve,reject;
    const promise = new Promise((yes,no)=>{resolve=yes;reject=no;});
    const record={url:String(url),init,resolve:data=>resolve({ok:true,json:()=>Promise.resolve(data)}),reject};
    requests.push(record);
    if(!String(url).includes('complete/search')&&!String(url).includes('osjson')&&!String(url).includes('sugrec')&&!String(url).includes('/ac/?')&&!String(url).includes('open-meteo')&&!String(url).includes('wttr.in'))record.resolve(String(url).includes('model-samples')?[]:{});
    return promise;
  };
  if(options.settings!==undefined)w.localStorage.setItem('newtab_settings_v3',JSON.stringify(options.settings));
  if(options.onboarded!==false)w.localStorage.setItem('newtab_onboarding_v3','1');
  const names=['preload.js','i18n.js','quotes.js','earth-scene.js','ui.js','script.js'];
  for(const name of names){
    let source=fs.readFileSync(path.join(root,name),'utf8');
    if(name==='script.js')source=source.replace("document.addEventListener('DOMContentLoaded',init);", `window.__veraTest={getSettings:function(){return settings;},renderQuickLinks:renderQuickLinks,showQuote:showQuote,applyAll:applyAll,saveSettings:saveSettings,renderFreeLayout:renderFreeLayout,getFreeGrid:getFreeGrid,pointToFreeCell:pointToFreeCell,applyFreeItemPosition:applyFreeItemPosition,isAreaFree:isAreaFree,createFolderFromLinks:createFolderFromLinks,unpackFolder:unpackFolder,renderPomodoro:renderPomodoro,fetchSuggest:fetchSuggest,cancelSuggestions:cancelSuggestions,fetchWeather:fetchWeather,saveLinkFromModal:saveLinkFromModal};document.addEventListener('DOMContentLoaded',init);`);
    w.eval(source+'\n//# sourceURL='+name);
  }
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  async function settle(){for(let i=0;i<8;i++)await Promise.resolve();}
  await settle();
  async function flushFrame(){for(const [id,callback] of [...frames]){frames.delete(id);callback(w.performance.now());}await settle();}
  if(!options.deferFirstFrame)await flushFrame();
  return {
    w,document:w.document,api:w.__veraTest,requests,images,timers,frames,errors,
    canvasCalls:()=>canvasCalls,
    settings:()=>w.__veraTest.getSettings(),
    click:id=>w.document.getElementById(id).click(),
    input(id,value){const el=w.document.getElementById(id);el.focus();el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));},
    key(id,key,extra={}){w.document.getElementById(id).dispatchEvent(new w.KeyboardEvent('keydown',{key,bubbles:true,cancelable:true,...extra}));},
    async runTimers(delay){for(const [id,timer] of [...timers]){if(timer.delay===delay){if(!timer.interval)timers.delete(id);timer.fn();}}await settle();},
    async visibility(value){hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'));await settle();},
    settle,flushFrame,
    close(){w.close();}
  };
}
module.exports={createApp,root};

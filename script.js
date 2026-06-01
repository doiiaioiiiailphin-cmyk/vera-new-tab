(function(){
"use strict";

var PICKER_ICONS=['web','mail','code','play','chat','x','star','heart','home','book','music','camera','phone','bulb','palette','chart','dollar','zap','fire','gamepad'];
var quickLinkSuppressClickUntil=0;

var DEFAULTS={glassOpacity:6,blur:32,radius:24,accent:'#5eead4',bgPreset:'ice',bgImage:'',bgTheme:'horizon',showBgImage:false,checkUpdate:true,
showWeather:true,showTodo:true,showQuote:true,showLinks:true,showPomodoro:false,dynamicBg:true,showGame:false,
searchEngine:'google',theme:'auto',language:'zh',vip:false,
links:[{icon:'gmail',name:'Gmail',url:'https://mail.google.com',useFavicon:false},
{icon:'code',name:'GitHub',url:'https://github.com'},
{icon:'play',name:'YouTube',url:'https://youtube.com'},
{icon:'web',name:'Bilibili',url:'https://bilibili.com'},
{icon:'chat',name:'ChatGPT',url:'https://chat.openai.com'}],
todos:[],freeLayout:{enabled:false,editMode:false,items:{},folders:{},initialized:false,layoutVersion:6},pomodoro:{mode:'focus',remaining:1500,running:false,endsAt:null,rounds:0,focus:25,short:5,long:15}};

var THEMES=[{id:'horizon',nameKey:'themeHorizon',bgDark:'assets/bg-dark.webp',bgLight:'assets/bg-light.webp',preset:'ice',accent:'#5eead4'},{id:'landscape',nameKey:'themeLandscape',bgDark:'assets/theme-landscape.svg',bgLight:'assets/theme-landscape.svg',preset:'ocean',accent:'#547a7b'},{id:'earth',nameKey:'themeEarth',bgDark:'assets/theme-earth-dark.svg',bgLight:'assets/theme-earth-light.svg',preset:'ice',accent:'#38dff2'}];

var SEARCH_ENGINES=[{id:'google',name:'Google',domain:'google.com',url:'https://www.google.com/search?q='},
{id:'bing',name:'Bing',domain:'bing.com',url:'https://www.bing.com/search?q='},
{id:'duckduckgo',name:'DuckDuckGo',domain:'duckduckgo.com',url:'https://duckduckgo.com/?q='},
{id:'baidu',name:'百度',domain:'baidu.com',url:'https://www.baidu.com/s?wd='},
{id:'github',name:'GitHub',domain:'github.com',url:'https://github.com/search?q='}];

var BG_PRESETS={ice:{blob1:'#7dd3fc',blob2:'#5eead4',blob3:'#a5b4fc',blob4:'#67e8f9'},
aurora:{blob1:'#c084fc',blob2:'#f472b6',blob3:'#818cf8',blob4:'#a78bfa'},
ocean:{blob1:'#38bdf8',blob2:'#2dd4bf',blob3:'#60a5fa',blob4:'#06b6d4'},
forest:{blob1:'#34d399',blob2:'#a3e635',blob3:'#4ade80',blob4:'#6ee7b7'},
sunset:{blob1:'#fb923c',blob2:'#fbbf24',blob3:'#f97316',blob4:'#f59e0b'}};

var WMO_ICONS={0:'w-clear',1:'w-clear',2:'cloud-sun',3:'w-cloudy',45:'w-fog',48:'w-fog',51:'w-rain',53:'w-rain',55:'w-rain',56:'w-rain',57:'w-rain',61:'w-rain',63:'w-rain',65:'w-rain',66:'w-rain',67:'w-rain',71:'w-snow',73:'w-snow',75:'w-snow',77:'w-snow',80:'w-rain',81:'w-rain',82:'w-rain',85:'w-snow',86:'w-snow',95:'w-storm',96:'w-storm',99:'w-storm'};
var WMO_DESC_ZH={0:'晴',1:'晴',2:'多云间晴',3:'阴',45:'雾',48:'霜雾',51:'毛毛雨',53:'毛毛雨',55:'毛毛雨',56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'阵雨',82:'大阵雨',85:'阵雪',86:'阵雪',95:'雷暴',96:'冰雹雷暴',99:'强雷暴'};
var WMO_DESC_EN={0:'Clear',1:'Clear',2:'Partly Cloudy',3:'Cloudy',45:'Fog',48:'Frost Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',56:'Freezing Drizzle',57:'Freezing Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',66:'Freezing Rain',67:'Freezing Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',77:'Snow Grains',80:'Showers',81:'Showers',82:'Heavy Showers',85:'Snow Showers',86:'Snow Showers',95:'Thunderstorm',96:'Hail Thunderstorm',99:'Severe Thunderstorm'};
var WMO_DESC_JA={0:'晴れ',1:'晴れ',2:'晴れ時々曇り',3:'曇り',45:'霧',48:'霜霧',51:'霧雨',53:'霧雨',55:'霧雨',56:'凍結霧雨',57:'凍結霧雨',61:'小雨',63:'雨',65:'大雨',66:'凍結雨',67:'凍結雨',71:'小雪',73:'雪',75:'大雪',77:'雪粒',80:'にわか雨',81:'にわか雨',82:'強いにわか雨',85:'にわか雪',86:'にわか雪',95:'雷雨',96:'雹雷雨',99:'激しい雷雨'};

// wttr.in codes → internal icon keys
var WW_ICON={113:'w-clear',116:'cloud-sun',119:'w-cloudy',122:'w-cloudy',143:'w-rain',176:'w-rain',179:'w-snow',182:'w-snow',185:'w-snow',200:'w-storm',227:'w-storm',230:'w-storm',248:'w-fog',260:'w-fog',263:'w-rain',266:'w-rain',293:'w-rain',296:'w-rain',299:'w-rain',302:'w-rain',305:'w-rain',308:'w-rain',311:'w-snow',314:'w-snow',317:'w-snow',320:'w-snow',323:'w-snow',326:'w-snow',329:'w-snow',332:'w-snow',335:'w-snow',338:'w-snow',350:'w-snow',353:'w-snow',356:'w-snow',359:'w-snow',362:'w-snow',365:'w-snow',368:'w-snow',371:'w-snow',374:'w-snow',377:'w-snow',386:'w-storm',389:'w-storm',392:'w-storm',395:'w-storm'};
var WW_DESC_ZH={113:'晴',116:'多云间晴',119:'多云',122:'阴',143:'雾',176:'阵雨',179:'阵雪',182:'雨夹雪',185:'冻雨',200:'雷阵雨',227:'暴风雪',230:'暴风雪',248:'雾',260:'雾',263:'毛毛雨',266:'小雨',293:'小雨',296:'小雨',299:'中雨',302:'中雨',305:'大雨',308:'大雨',311:'冻雨',314:'小雪',317:'中雪',320:'中雪',323:'小雪',326:'小雪',329:'中雪',332:'中雪',335:'大雪',338:'大雪',350:'冰雹',353:'小冰雹',356:'中冰雹',359:'大冰雹',362:'小冰雹',365:'中冰雹',368:'小冰雹',371:'中雪',374:'小冰雹',377:'中冰雹',386:'雷暴',389:'雷暴',392:'雷暴',395:'大冰雹'};
var WW_DESC_JA={113:'晴れ',116:'晴れ時々曇り',119:'曇り',122:'曇り',143:'霧',176:'にわか雨',179:'にわか雪',182:'みぞれ',185:'凍雨',200:'雷雨',227:'吹雪',230:'吹雪',248:'霧',260:'霧',263:'霧雨',266:'小雨',293:'小雨',296:'小雨',299:'雨',302:'雨',305:'大雨',308:'大雨',311:'凍雨',314:'小雪',317:'雪',320:'雪',323:'小雪',326:'小雪',329:'雪',332:'雪',335:'大雪',338:'大雪',350:'雹',353:'小雹',356:'雹',359:'大雹',362:'小雹',365:'雹',368:'小雹',371:'雪',374:'小雹',377:'雹',386:'雷雨',389:'雷雨',392:'雷雨',395:'大雹'};

// en map is empty — English weather descriptions come directly from wttr.in API response, not translated
function wwDesc(code,lang){var m={zh:WW_DESC_ZH,en:{},ja:WW_DESC_JA};return (m[lang]||{})[code]||'Unknown';}

var settings={},linkEditIdx=null,suggestTimer=null,suggestDropdown=null;
var freeLayoutNodes={},freeLayoutDrag=null,freeLayoutContextPoint=null,freeLayoutFolderPanel=null,freeLayoutLongPress=null,freeLayoutMergeTarget=null;

function iconSvg(name,size){size=size||18;
return'<span class="icon-svg" style="font-size:'+size+'px"><svg viewBox="0 0 24 24"><use href="#i-'+name+'"/></svg></span>';}

function extractDomain(url){if(!/^https?:\/\//i.test(url))url='https://'+url;
try{return new URL(url).hostname;}catch(e){return null;}}

var KNOWN_FAVICONS={'mail.google.com':'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png',
'github.com':'https://github.githubassets.com/favicons/favicon-dark.svg',
'youtube.com':'https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png',
'bilibili.com':'https://www.bilibili.com/favicon.ico',
'x.com':'https://x.com/favicon.ico',
'twitter.com':'https://abs.twimg.com/favicons/twitter.2.ico',
'bing.com':'https://www.bing.com/favicon.ico',
'duckduckgo.com':'https://duckduckgo.com/favicon.ico',
'baidu.com':'https://www.baidu.com/favicon.ico',
'google.com':'https://www.google.com/favicon.ico'};

function getFaviconUrl(url,size){var domain=extractDomain(url);if(!domain)return'';
if(domain==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(domain))return'';
var known=KNOWN_FAVICONS[domain];if(known)return known;
return'https://www.google.com/s2/favicons?domain='+domain+'&sz='+(size||64);}

function linkFaviconHtml(link){var useFav=link.useFavicon!==false;if(!useFav)return'';
var favurl=getFaviconUrl(link.url,64);
return'<img class="link-favicon" src="'+escapeAttr(favurl)+'" alt="">';}

function linkIconHtml(link){if(link.icon&&/^https?:\/\//.test(link.icon))return'<span class="link-icon-clip"><img class="link-icon-img" src="'+escapeAttr(link.icon)+'" alt=""></span>';if(link.icon==='gmail')return'<svg viewBox="40 30 110 90" style="width:22px;height:22px;display:block" fill="none"><path d="M58 108h14V74L52 59v43c0 3.315 2.685 6 6 6z" fill="#4285F4"/><path d="M120 108h14c3.315 0 6-2.685 6-6V59l-20 15v34z" fill="#34A853"/><path d="M120 48v26l20-15v-8c0-7.415-8.465-11.65-14.4-7.2L120 48z" fill="#FBBC04"/><path fill-rule="evenodd" clip-rule="evenodd" d="M72 74V48l24 18 24-18v26L96 92 72 74z" fill="#EA4335"/><path d="M52 51v8l20 15V48l-5.6-4.2C60.465 39.35 52 43.585 52 51z" fill="#C5221F"/></svg>';return iconSvg(link.icon||'web',22);}

function attachFaviconListeners(container){
container.querySelectorAll('img.link-favicon:not([data-fav-setup])').forEach(function(img){
img.dataset.favSetup='1';
img.addEventListener('load',function(){var s=img.nextElementSibling;if(s&&s.classList.contains('icon-svg'))s.style.display='none';});
img.addEventListener('error',function(){img.remove();});
});
var pickerImgs=container.querySelectorAll('.icon-picker img:not([data-fav-setup])');
pickerImgs.forEach(function(img){img.dataset.favSetup='1';img.addEventListener('error',function(){var b=img.parentElement;if(b){b.innerHTML='<span style="font-size:9px;color:var(--text-subtle);opacity:0.45;line-height:1.1;text-align:center">'+t('faviconFail')+'</span>';b.classList.add('fav-failed');b.style.pointerEvents='none';}});img.addEventListener('load',function(){var b=img.parentElement;if(b){b.classList.remove('fav-failed');b.style.pointerEvents='';}});});
}

function createFaviconImgElement(src,size){
size=size||18;var img=document.createElement('img');
img.style.cssText='width:'+size+'px;height:'+size+'px;border-radius:3px;display:block;flex-shrink:0';
img.addEventListener('error',function(){var span=document.createElement('span');span.className='icon-svg';span.style.fontSize=size+'px';span.innerHTML='<svg viewBox="0 0 24 24"><use href="#i-web"/></svg>';img.replaceWith(span);});
img.src=src;
return img;}

function makeId(prefix){return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
function ensureLinkIds(){
var seen={};
if(!Array.isArray(settings.links))settings.links=[];
settings.links.forEach(function(link,idx){
if(!link.id||seen[link.id])link.id=makeId('link');
seen[link.id]=true;
});
}
function ensureFreeLayoutState(){
var d=DEFAULTS.freeLayout;
if(!settings.freeLayout||typeof settings.freeLayout!=='object')settings.freeLayout=JSON.parse(JSON.stringify(d));
if(typeof settings.freeLayout.enabled!=='boolean')settings.freeLayout.enabled=false;
if(typeof settings.freeLayout.editMode!=='boolean')settings.freeLayout.editMode=false;
if(!settings.freeLayout.items||typeof settings.freeLayout.items!=='object')settings.freeLayout.items={};
if(!settings.freeLayout.folders||typeof settings.freeLayout.folders!=='object')settings.freeLayout.folders={};
if(typeof settings.freeLayout.initialized!=='boolean')settings.freeLayout.initialized=false;
if(typeof settings.freeLayout.layoutVersion!=='number')settings.freeLayout.layoutVersion=settings.freeLayout.initialized?1:6;
}

function t(key){var lang=settings.language||'zh';return (I18N[lang]&&I18N[lang][key])||(I18N.zh[key])||key;}

function translateDOM(){
document.documentElement.setAttribute('lang',settings.language||'zh');
document.dispatchEvent(new CustomEvent('vera:localechange',{detail:{language:settings.language||'zh'}}));
document.title=t('pageTitle');
document.querySelectorAll('[data-i18n]').forEach(function(el){
var key=el.getAttribute('data-i18n');
var translated=t(key);
if(key==='aboutText'){el.innerHTML=translated;return;}
el.textContent=translated;
});
document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
el.placeholder=t(el.getAttribute('data-i18n-placeholder'));
});
document.querySelectorAll('[data-i18n-tip]').forEach(function(el){
el.textContent=t(el.getAttribute('data-i18n-tip'));
});
document.querySelectorAll('[data-preset]').forEach(function(btn){
btn.textContent=t('preset'+btn.dataset.preset.charAt(0).toUpperCase()+btn.dataset.preset.slice(1));
});
document.querySelectorAll('.radio-option[data-theme-val]').forEach(function(btn){
btn.textContent=t('theme'+btn.dataset.themeVal.charAt(0).toUpperCase()+btn.dataset.themeVal.slice(1));
});
document.querySelectorAll('.radio-option[data-lang-val]').forEach(function(btn){
btn.textContent=t('lang'+btn.dataset.langVal.charAt(0).toUpperCase()+btn.dataset.langVal.slice(1));
});var addLabel=document.querySelector('.add-link-card .add-label');
if(addLabel)addLabel.textContent=t('add');
}

function loadSettings(){
try{var raw=JSON.parse(localStorage.getItem('newtab_settings_v3'));}catch(e){raw=null;}
settings=raw||{};
for(var k in DEFAULTS){if(!(k in settings))settings[k]=(DEFAULTS[k]&&typeof DEFAULTS[k]==='object')?JSON.parse(JSON.stringify(DEFAULTS[k])):DEFAULTS[k];}
if(settings.links===DEFAULTS.links)settings.links=JSON.parse(JSON.stringify(DEFAULTS.links));
if(settings.pomodoro===DEFAULTS.pomodoro)settings.pomodoro=JSON.parse(JSON.stringify(DEFAULTS.pomodoro));
if(settings.freeLayout===DEFAULTS.freeLayout)settings.freeLayout=JSON.parse(JSON.stringify(DEFAULTS.freeLayout));
ensureLinkIds();
ensureFreeLayoutState();
ensurePomodoroState();
if(!raw||!raw.language){var bl=(navigator.language||'').split('-')[0];settings.language={'zh':'zh','ja':'ja'}[bl]||'en';saveSettings();}
}
function saveSettings(){try{localStorage.setItem('newtab_settings_v3',JSON.stringify(settings));}catch(e){}}
// Fallback stubs — vip.js/game.js provide real implementations when bundled
var _bindVipEvents = typeof bindVipEvents !== 'undefined' ? bindVipEvents : function(){};
var _initAds = typeof initAds !== 'undefined' ? initAds : function(){};
var _toggleAds = typeof toggleAds !== 'undefined' ? toggleAds : function(){};
var _initGame = typeof initGame !== 'undefined' ? initGame : function(){};

function applyTheme(){
var theme=settings.theme;
if(theme==='auto'){
var prefersDark=window.matchMedia('(prefers-color-scheme:dark)').matches;
document.documentElement.setAttribute('data-theme',prefersDark?'dark':'light');
}else{document.documentElement.setAttribute('data-theme',theme);}
var h=document.getElementById('themeIconUse');
if(h){
var isDark=document.documentElement.getAttribute('data-theme')==='dark';
h.setAttribute('href',isDark?'#i-moon':'#i-sun');
}
updateThemeRadio();
}
function updateThemeRadio(){
document.querySelectorAll('#themeRadio .radio-option').forEach(function(btn){btn.classList.toggle('active',btn.dataset.themeVal===settings.theme);});
document.querySelectorAll('#langRadio .radio-option').forEach(function(btn){btn.classList.toggle('active',btn.dataset.langVal===settings.language);});
}
function moveRadioSlider(groupEl){if(!groupEl)return;var slider=groupEl.querySelector('.radio-slider');var active=groupEl.querySelector('.radio-option.active');if(!slider||!active)return;var r0=groupEl.getBoundingClientRect();var r1=active.getBoundingClientRect();slider.style.left=(r1.left-r0.left)+'px';slider.style.width=r1.width+'px';}

function applyAll(){
var r=document.documentElement;
var op=settings.glassOpacity/100;
r.style.setProperty('--glass-bg','rgba(210,235,255,'+op+')');
r.style.setProperty('--glass-opacity',op);
r.style.setProperty('--glass-blur',settings.blur+'px');
r.style.setProperty('--radius',settings.radius+'px');
r.style.setProperty('--radius-sm',Math.round(settings.radius*0.67)+'px');
r.style.setProperty('--radius-xs',Math.round(settings.radius*0.5)+'px');
r.style.setProperty('--accent',settings.accent);
r.style.setProperty('--accent-glow',hexToRgba(settings.accent,0.3));
var preset=BG_PRESETS[settings.bgPreset]||BG_PRESETS.ice;
r.style.setProperty('--blob-1',preset.blob1);
r.style.setProperty('--blob-2',preset.blob2);
r.style.setProperty('--blob-3',preset.blob3);
r.style.setProperty('--blob-4',preset.blob4);
document.querySelectorAll('.bg-blob').forEach(function(b){b.classList.toggle('still',!settings.dynamicBg);});
  document.querySelectorAll('.bg-blob').forEach(function(b){b.style.display=(settings.showBgImage&&!settings.bgImage)?'none':'';});
  applyTheme();
var bgBase=document.querySelector('.bg-base');
var activeTheme=THEMES.find(function(t){return t.id===settings.bgTheme})||THEMES[0];
var isLandscape=activeTheme.id==='landscape';
var isEarth=activeTheme.id==='earth';
var scene=document.getElementById('landscapeScene');
lDebugMode=false;lDebugHour=undefined;lDebugWeather=undefined;
if(scene){var showScene=isLandscape&&settings.showBgImage&&!settings.bgImage;if(showScene){scene.style.display='';if(scene._teHide){scene.removeEventListener('transitionend',scene._teHide);scene._teHide=null;}requestAnimationFrame(function(){scene.classList.add('on');applyLandscapeScene();});}else{scene.classList.remove('on');if(scene._teHide)scene.removeEventListener('transitionend',scene._teHide);scene._teHide=function(){scene.style.display='none';scene.removeEventListener('transitionend',scene._teHide);scene._teHide=null;};scene.addEventListener('transitionend',scene._teHide);}}
updateEarthScene(isEarth&&settings.showBgImage&&!settings.bgImage);
var builtinBg=settings.showBgImage&&!settings.bgImage;
if(builtinBg&&!isLandscape&&!isEarth){bgBase.classList.add('has-image');bgBase.classList.remove('custom-bg');bgBase.style.backgroundImage='';
var bgDark=document.querySelector('.bg-img-dark');if(bgDark){bgDark.src=activeTheme.bgDark;bgDark.className='bg-img bg-img-dark'+(activeTheme.id==='landscape'?' bg-img-landscape':'');}
var bgLight=document.querySelector('.bg-img-light');if(bgLight){bgLight.src=activeTheme.bgLight;bgLight.className='bg-img bg-img-light'+(activeTheme.id==='landscape'?' bg-img-landscape':'');}
}else if(builtinBg&&(isLandscape||isEarth)){bgBase.classList.remove('has-image','custom-bg');bgBase.style.backgroundImage='';
}else if(settings.showBgImage&&settings.bgImage){bgBase.classList.add('has-image','custom-bg');bgBase.style.backgroundImage='url('+settings.bgImage+')';}
else{bgBase.classList.remove('has-image','custom-bg');bgBase.style.backgroundImage='';}
updateLandscapeFilter();
applyLandscapeScene();
var builtinLight=!settings.bgImage&&settings.showBgImage&&document.documentElement.getAttribute('data-theme')==='light';
document.body.classList.toggle('builtin-bg',builtinBg);
document.body.classList.toggle('builtin-bg-light',builtinLight);
_toggleAds();
updateEngineDisplay();
renderTodoList();
updateWidgetVisibility();
updateSettingsUI();
translateDOM();
renderPomodoro();
renderFreeLayout();
hideMainForFreeLayout();
if(typeof updateGameLocale==='function')updateGameLocale();
}

function hexToRgba(hex,a){var h=hex.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
var r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);
return'rgba('+r+','+g+','+b+','+a+')';}

function updateClock(){var n=new Date();var h=n.getHours(),m=n.getMinutes();
var ct=document.getElementById('clockTime');if(!ct)return;ct.textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
var days=settings.language==='en'?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']:
settings.language==='ja'?['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日']:
['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
var dateStr;
if(settings.language==='ja'){
dateStr=n.getFullYear()+'年'+(n.getMonth()+1)+'月'+n.getDate()+'日 '+days[n.getDay()];
}else if(settings.language==='en'){
dateStr=days[n.getDay()]+', '+(n.getMonth()+1)+'/'+n.getDate()+'/'+n.getFullYear();
}else{
dateStr=n.getFullYear()+'年'+(n.getMonth()+1)+'月'+n.getDate()+'日 '+days[n.getDay()];
}
var cd=document.getElementById('clockDate');if(cd)cd.textContent=dateStr;}
function scheduleClock(){var s=60-new Date().getSeconds();setTimeout(function(){updateClock();updateLandscapeFilter();applyLandscapeScene();setInterval(function(){updateClock();updateLandscapeFilter();applyLandscapeScene();},60000);},s*1000);}

function updateEngineDisplay(){
var eng=SEARCH_ENGINES.find(function(e){return e.id===settings.searchEngine})||SEARCH_ENGINES[0];
var favurl=getFaviconUrl('https://'+eng.domain,64);
var engIcon=document.getElementById('engineIconSvg');if(!engIcon)return;
engIcon.innerHTML='';
engIcon.appendChild(createFaviconImgElement(favurl,18));
var engName=document.getElementById('engineName');if(engName)engName.textContent=engineDisplayName(eng);
renderEngineDropdown();
}

function engineDisplayName(eng){var key='engine'+eng.id.charAt(0).toUpperCase()+eng.id.slice(1);return t(key)||eng.name;}


function renderEngineDropdown(){
var dd=document.getElementById('engineDropdown');if(!dd)return;
dd.innerHTML=SEARCH_ENGINES.map(function(e){var active=e.id===settings.searchEngine?' active':'';
return'<div class="engine-option'+active+'" data-engine="'+e.id+'"><span class="eng-favicon-box"></span> '+engineDisplayName(e)+'</div>';}).join('');
dd.querySelectorAll('.engine-option').forEach(function(el){
var eng=SEARCH_ENGINES.find(function(e){return e.id===el.dataset.engine});
if(eng){
var favurl=getFaviconUrl('https://'+eng.domain,64);
var box=el.querySelector('.eng-favicon-box');
if(box)box.appendChild(createFaviconImgElement(favurl,16));
}
el.addEventListener('click',function(e){
e.stopPropagation();settings.searchEngine=el.dataset.engine;saveSettings();updateEngineDisplay();dd.classList.remove('open');
var seb=document.getElementById('searchEngineBtn');if(seb)seb.classList.remove('open');
});
});
}

function doSearch(){var q=document.getElementById('searchInput');if(!q)return;q=q.value.trim();if(!q)return;
var eng=SEARCH_ENGINES.find(function(e){return e.id===settings.searchEngine})||SEARCH_ENGINES[0];
window.location.href=eng.url+encodeURIComponent(q);}

function updateWidgetVisibility(){
var w=document.getElementById('weatherWidget');if(w)w.style.display=settings.showWeather?'':'none';
var q=document.getElementById('quoteWidget');if(q)q.style.display=settings.showQuote?'':'none';
var t=document.getElementById('todoWidget');if(t)t.style.display=settings.showTodo?'':'none';
var p=document.getElementById('pomodoroWidget');if(p)p.style.display=settings.showPomodoro?'':'none';
var gm=document.getElementById('gameWidget');if(gm){var wasHidden=gm.style.display==='none';gm.style.display=settings.showGame?'':'none';if(settings.showGame&&wasHidden)drawStartScreen();}
var l=document.getElementById('linksContainer');if(l)l.style.display=settings.showLinks?'':'none';
var g=document.getElementById('widgetsGrid');if(g){
var anyVis=settings.showWeather||settings.showTodo||settings.showQuote||settings.showPomodoro||settings.showGame;
g.style.display=anyVis?'':'none';
var visibleWidgets=[];
if(settings.showWeather)visibleWidgets.push(1);
if(settings.showQuote)visibleWidgets.push(1);
if(settings.showPomodoro)visibleWidgets.push(1);
if(settings.showGame)visibleWidgets.push(1);
if(visibleWidgets.length===1)g.classList.add('single-col');
else g.classList.remove('single-col');
}
}

function quickLinkSortItems(container){
return Array.prototype.slice.call(container.querySelectorAll('.link-card,.add-link-card,.quick-link-placeholder'));
}
function captureQuickLinkRects(container){
var rects=new Map();
quickLinkSortItems(container).forEach(function(item){
if(item.classList.contains('dragging'))return;
rects.set(item,item.getBoundingClientRect());
});
return rects;
}
function animateQuickLinkLayout(container,firstRects){
quickLinkSortItems(container).forEach(function(item){
if(item.classList.contains('dragging'))return;
var first=firstRects.get(item);if(!first)return;
var last=item.getBoundingClientRect();
var dx=first.left-last.left,dy=first.top-last.top;
if(Math.abs(dx)<0.5&&Math.abs(dy)<0.5)return;
item.style.transition='none';
item.style.transform='translate3d('+dx+'px,'+dy+'px,0)';
item.offsetHeight;
item.style.transition='transform .34s cubic-bezier(.2,.82,.22,1)';
item.style.transform='';
var flipId=(item._quickLinkFlipId||0)+1;
item._quickLinkFlipId=flipId;
var clear=function(){
if(item._quickLinkFlipId!==flipId)return;
item.style.transition='';
item.removeEventListener('transitionend',clear);
};
item.addEventListener('transitionend',clear);
setTimeout(clear,380);
});
}
function moveQuickLinkPlaceholder(container,placeholder,target,after){
if(!placeholder||!target||target===placeholder)return;
var first=captureQuickLinkRects(container);
if(after)target.parentNode.insertBefore(placeholder,target.nextSibling);
else target.parentNode.insertBefore(placeholder,target);
animateQuickLinkLayout(container,first);
}
function saveQuickLinkOrderFromDom(container){
var order=Array.prototype.slice.call(container.querySelectorAll('.link-card')).map(function(card){return parseInt(card.dataset.idx,10);}).filter(function(idx){return Number.isFinite(idx);});
if(order.length!==settings.links.length)return false;
settings.links=order.map(function(idx){return settings.links[idx];});
saveSettings();
return true;
}
function renderQuickLinks(){
var container=document.getElementById('linksContainer');if(!container)return;
var html='';
settings.links.forEach(function(link,idx){
html+='<div class="link-card" data-idx="'+idx+'" data-url="'+escapeAttr(link.url)+'">'+
'<button class="link-delete" data-del="'+idx+'">&times;</button>'+
'<div class="link-icon">'+(link.icon&&/^https?:\/\//.test(link.icon)?'':linkFaviconHtml(link))+linkIconHtml(link)+'</div>'+
'<div class="link-name">'+escapeHtml(link.name)+'</div></div>';
});
html+='<div class="add-link-card" id="addLinkCard"><span class="plus">+</span><span class="add-label">'+t('add')+'</span></div>';
container.innerHTML=html;
attachFaviconListeners(container);
container.querySelectorAll('.link-delete').forEach(function(btn){btn.addEventListener('click',function(e){
e.stopPropagation();e.preventDefault();
settings.links.splice(parseInt(btn.dataset.del),1);saveSettings();renderQuickLinks();renderLinkEditList();
});});
var addBtn=document.getElementById('addLinkCard');
if(addBtn)addBtn.addEventListener('click',function(e){e.stopPropagation();openLinkModal();});
var dragState=null;
container.querySelectorAll('.link-card').forEach(function(card){
card.addEventListener('click',function(e){if(Date.now()<quickLinkSuppressClickUntil)return;
var url=card.dataset.url;if(url)window.open(url,'_blank','noopener');});
card.addEventListener('pointerdown',function(e){
if(e.button!==undefined&&e.button!==0)return;
if(e.target.closest('.link-delete'))return;
dragState={card:card,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,dragging:false};
try{card.setPointerCapture(e.pointerId);}catch(err){}
});
card.addEventListener('pointermove',function(e){
if(!dragState||dragState.card!==card)return;
var dx=e.clientX-dragState.startX,dy=e.clientY-dragState.startY;
if(!dragState.dragging){
if(Math.hypot(dx,dy)<6)return;
var rect=card.getBoundingClientRect();
var placeholder=document.createElement('div');
placeholder.className='quick-link-placeholder';
placeholder.style.width=rect.width+'px';
placeholder.style.height=rect.height+'px';
card.parentNode.insertBefore(placeholder,card);
var preview=card.cloneNode(true);
preview.classList.add('dragging');
preview.removeAttribute('data-url');
preview.querySelectorAll('.link-delete').forEach(function(btn){btn.remove();});
preview.style.left=rect.left+'px';
preview.style.top=rect.top+'px';
preview.style.width=rect.width+'px';
preview.style.height=rect.height+'px';
preview.style.transform='translate3d(0,0,0) scale(.98)';
preview.style.transition='none';
document.body.appendChild(preview);
dragState.placeholder=placeholder;
dragState.preview=preview;
dragState.rect=rect;
dragState.dragging=true;
container.classList.add('drag-sorting');
card.classList.add('drag-source');
card.style.position='fixed';
card.style.left='-10000px';
card.style.top='-10000px';
card.style.width=rect.width+'px';
card.style.height=rect.height+'px';
card.style.visibility='hidden';
card.style.pointerEvents='none';
card.style.transition='none';
card.style.transform='none';
}
e.preventDefault();
if(dragState.preview)dragState.preview.style.transform='translate3d('+(e.clientX-dragState.startX)+'px,'+(e.clientY-dragState.startY)+'px,0) scale(.98)';
var hit=document.elementFromPoint(e.clientX,e.clientY);
var target=hit&&hit.closest?hit.closest('.link-card:not(.drag-source)'):null;
if(target&&container.contains(target)){
var rect=target.getBoundingClientRect();
var after=Math.abs(e.clientY-(rect.top+rect.height/2))>rect.height*.42?e.clientY>rect.top+rect.height/2:e.clientX>rect.left+rect.width/2;
moveQuickLinkPlaceholder(container,dragState.placeholder,target,after);
return;
}
var add=hit&&hit.closest?hit.closest('.add-link-card'):null;
if(add&&container.contains(add)){
moveQuickLinkPlaceholder(container,dragState.placeholder,add,false);
}
});
function endDrag(){
if(!dragState||dragState.card!==card)return;
try{card.releasePointerCapture(dragState.pointerId);}catch(err){}
if(dragState.dragging){
quickLinkSuppressClickUntil=Date.now()+260;
var placeholder=dragState.placeholder;
var preview=dragState.preview;
var startRect=dragState.rect;
var finish=function(){
if(placeholder&&placeholder.parentNode)placeholder.parentNode.insertBefore(card,placeholder);
card.classList.remove('drag-source');
card.style.position='';card.style.left='';card.style.top='';card.style.width='';card.style.height='';card.style.visibility='';card.style.pointerEvents='';card.style.transform='';card.style.transition='';
if(preview&&preview.parentNode)preview.parentNode.removeChild(preview);
if(placeholder&&placeholder.parentNode)placeholder.parentNode.removeChild(placeholder);
container.classList.remove('drag-sorting');
if(saveQuickLinkOrderFromDom(container)){renderQuickLinks();renderLinkEditList();}
};
if(placeholder&&placeholder.parentNode){
var targetRect=placeholder.getBoundingClientRect();
var settleX=targetRect.left-startRect.left;
var settleY=targetRect.top-startRect.top;
if(preview){
preview.style.transition='transform .16s cubic-bezier(.2,.82,.22,1)';
preview.style.transform='translate3d('+settleX+'px,'+settleY+'px,0) scale(1)';
}
setTimeout(finish,170);
}else finish();
}else card.style.transform='';
dragState=null;
}
card.addEventListener('pointerup',endDrag);
card.addEventListener('pointercancel',endDrag);
});
}

function freeWidgetDefs(){
return[
{id:'clock',type:'core',selector:'.clock-wrap',w:4,h:1,minW:4,minH:1,closable:false},
{id:'search',type:'core',selector:'.search-wrap',w:6,h:1,minW:4,minH:1,closable:false},
{id:'weather',type:'widget',selector:'#weatherWidget',setting:'showWeather',w:2,h:2,minW:2,minH:2,closable:true},
{id:'quote',type:'widget',selector:'#quoteWidget',setting:'showQuote',w:4,h:2,minW:2,minH:2,closable:true},
{id:'todo',type:'widget',selector:'#todoWidget',setting:'showTodo',w:6,h:2,minW:3,minH:2,closable:true},
{id:'pomodoro',type:'widget',selector:'#pomodoroWidget',setting:'showPomodoro',w:4,h:4,minW:3,minH:3,closable:true},
{id:'game',type:'widget',selector:'#gameWidget',setting:'showGame',w:5,h:4,minW:3,minH:3,closable:true}
];}
function freeItemKey(type,id){return type+':'+id;}
function freeCell(){return window.innerWidth<=700?{w:94,h:104,g:10}:{w:114,h:122,g:14};}
function ensureFreeSurface(){
var s=document.getElementById('freeLayoutSurface');
if(!s){s=document.createElement('div');s.id='freeLayoutSurface';s.className='free-layout-surface';document.body.appendChild(s);}
var menu=document.getElementById('freeContextMenu');
if(!menu){menu=document.createElement('div');menu.id='freeContextMenu';menu.className='free-context-menu';menu.innerHTML='<button data-action="new">'+t('newTile')+'</button><button data-action="edit">'+(settings.freeLayout&&settings.freeLayout.editMode?t('exitOrganize'):t('organizeDesktop'))+'</button>';document.body.appendChild(menu);
menu.addEventListener('click',function(e){var btn=e.target.closest('button');if(!btn)return;hideFreeContextMenu();if(btn.dataset.action==='new'){openLinkModal(undefined,true);}else{freeLayoutContextPoint=null;settings.freeLayout.editMode=!settings.freeLayout.editMode;saveSettings();renderFreeLayout();}});
}
return s;
}
function getFreeSurfaceRect(){var s=ensureFreeSurface();return s.getBoundingClientRect();}
function getFreeGrid(){
var rect=getFreeSurfaceRect(),cell=freeCell();
var cols=Math.max(1,Math.floor(rect.width/cell.w)),rows=Math.max(1,Math.floor(rect.height/cell.h));
return{rect:rect,cell:cell,cols:cols,rows:rows,offsetX:Math.max(0,(rect.width-cols*cell.w)/2),offsetY:0};
}
function freeBaseCols(grid){return window.innerWidth<=700?grid.cols:15;}
function freeCenterShiftX(grid){return Math.round((grid.cols-freeBaseCols(grid))/2);}
function rememberFreeNode(el){
if(!el)return;
var id=el.id||el.className;
if(!freeLayoutNodes[id])freeLayoutNodes[id]={el:el,parent:el.parentNode,next:el.nextSibling};
}
function restoreFreeLayoutNodes(){
Object.keys(freeLayoutNodes).forEach(function(k){
var r=freeLayoutNodes[k],el=r.el;if(!el||!r.parent)return;
if(el.parentNode!==r.parent){if(r.next&&r.next.parentNode===r.parent)r.parent.insertBefore(el,r.next);else r.parent.appendChild(el);}
el.classList.remove('free-embedded-node');el.style.width='';el.style.height='';
});
}
function occupiedMap(exceptKey){
var occ={},items=(settings.freeLayout&&settings.freeLayout.items)||{};
Object.keys(items).forEach(function(k){
if(k===exceptKey)return;var it=items[k];if(!it||it.hidden)return;
if(!freeItemIsActive(k,it))return;
for(var x=it.x;x<it.x+it.w;x++)for(var y=it.y;y<it.y+it.h;y++)occ[x+','+y]=k;
});
return occ;
}
function freeItemIsActive(key,it){
if(!it)return false;
if(it.type==='link')return !folderContainingLink(it.id)&&settings.links.some(function(l){return l.id===it.id;});
if(it.type==='folder')return !!(settings.freeLayout.folders&&settings.freeLayout.folders[it.id]);
if(it.type==='widget'){var d=freeWidgetDefs().find(function(w){return w.id===it.id;});return !!(d&&(!d.setting||settings[d.setting]));}
return true;
}
function isAreaFree(x,y,w,h,exceptKey){
var occ=occupiedMap(exceptKey);
if(!Number.isFinite(x)||!Number.isFinite(y)||w<1||h<1)return false;
for(var cx=x;cx<x+w;cx++)for(var cy=y;cy<y+h;cy++)if(occ[cx+','+cy])return false;
return true;
}
function nearestFreeCell(x,y,w,h,exceptKey){
var grid=getFreeGrid(),occ=occupiedMap(exceptKey),maxR=Math.max(grid.cols,grid.rows,24);
x=Math.round(x);y=Math.round(y);
Object.keys(occ).forEach(function(k){
var p=k.split(','),ox=parseInt(p[0],10),oy=parseInt(p[1],10);
if(Number.isFinite(ox)&&Number.isFinite(oy))maxR=Math.max(maxR,Math.abs(ox-x)+w+6,Math.abs(oy-y)+h+6);
});
if(isAreaFree(x,y,w,h,exceptKey))return{x:x,y:y};
for(var r=1;r<maxR+12;r++){
for(var dx=-r;dx<=r;dx++)for(var dy=-r;dy<=r;dy++){
if(Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
var nx=x+dx,ny=y+dy;
if(isAreaFree(nx,ny,w,h,exceptKey))return{x:nx,y:ny};
}}
return{x:x,y:y};
}
function appendFreeCell(w,h,exceptKey){
var grid=getFreeGrid(),items=settings.freeLayout.items||{},startY=0;
Object.keys(items).forEach(function(k){var it=items[k];if(k!==exceptKey&&it&&freeItemIsActive(k,it))startY=Math.max(startY,it.y+it.h-1);});
for(var y=Math.max(0,Math.min(grid.rows-h,startY));y<grid.rows;y++)for(var x=0;x<=grid.cols-w;x++)if(isAreaFree(x,y,w,h,exceptKey))return{x:x,y:y};
for(var yy=0;yy<Math.max(1,startY);yy++)for(var xx=0;xx<=grid.cols-w;xx++)if(isAreaFree(xx,yy,w,h,exceptKey))return{x:xx,y:yy};
return nearestFreeCell(0,grid.rows-h,w,h,exceptKey);
}
function rectToGrid(rect,w,h,exceptKey){
var grid=getFreeGrid(),x=Math.round((rect.left-grid.rect.left-grid.offsetX)/grid.cell.w)-freeCenterShiftX(grid),y=Math.round((rect.top-grid.rect.top-grid.offsetY)/grid.cell.h);
return nearestFreeCell(x,y,w,h,exceptKey);
}
function pointToFreeCell(clientX,clientY,w,h,exceptKey){
var grid=getFreeGrid(),x=Math.floor((clientX-grid.rect.left-grid.offsetX)/grid.cell.w)-freeCenterShiftX(grid),y=Math.floor((clientY-grid.rect.top-grid.offsetY)/grid.cell.h);
return nearestFreeCell(x,y,w,h,exceptKey);
}
function centeredFreeX(w){var grid=getFreeGrid();return Math.max(0,Math.round((grid.cols-w)/2));}
function defaultFreeWidgetCell(d,key,projected){
var grid=getFreeGrid(),x=projected?projected.x:0,y=(projected?projected.y:0)+1;
if(d.id==='clock')return nearestFreeCell(centeredFreeX(d.w),y,d.w,d.h,key);
if(d.id==='search')return nearestFreeCell(x+2,y,d.w,d.h,key);
if(grid.cols>=15){
var left=0,top=3;
var todoY=top+2,todoBottom=todoY+2;
if(d.id==='game')return nearestFreeCell(left+1,todoBottom-d.h,d.w,d.h,key);
if(d.id==='weather')return nearestFreeCell(left+6,top,d.w,d.h,key);
if(d.id==='quote')return nearestFreeCell(left+8,top,d.w,d.h,key);
if(d.id==='pomodoro')return nearestFreeCell(left+11,todoBottom-d.h,d.w,d.h,key);
if(d.id==='todo')return nearestFreeCell(left+6,todoY,d.w,d.h,key);
}
return nearestFreeCell(d.id==='pomodoro'?x:x+1,y,d.w,d.h,key);
}
function folderContainingLink(id){
var folders=settings.freeLayout.folders||{};
for(var fid in folders){if((folders[fid].linkIds||[]).indexOf(id)>=0)return fid;}
return null;
}
function cleanFreeLayoutState(){
ensureFreeLayoutState();ensureLinkIds();
var linkIds={};settings.links.forEach(function(l){linkIds[l.id]=true;});
var fl=settings.freeLayout;
Object.keys(fl.folders).forEach(function(fid){
var f=fl.folders[fid];f.linkIds=(f.linkIds||[]).filter(function(id){return !!linkIds[id];});
if(f.linkIds.length<=1){
var item=fl.items[freeItemKey('folder',fid)];
if(f.linkIds.length===1){var id=f.linkIds[0];fl.items[freeItemKey('link',id)]={type:'link',id:id,x:item?item.x:0,y:item?item.y:0,w:1,h:1};}
delete fl.folders[fid];delete fl.items[freeItemKey('folder',fid)];
}
});
Object.keys(fl.items).forEach(function(k){
var it=fl.items[k];if(!it)return;
if(it.type==='link'&&!linkIds[it.id])delete fl.items[k];
if(it.type==='folder'&&!fl.folders[it.id])delete fl.items[k];
});
}
function visibleFreeWidgets(){
return freeWidgetDefs().filter(function(d){return !d.setting||settings[d.setting];});
}
function initializeFreeLayoutItems(){
var fl=settings.freeLayout;if(fl.initialized)return;
var s=ensureFreeSurface();s.style.display='block';
var items=fl.items,grid=getFreeGrid(),fallbackY=0;
if(settings.showLinks){
document.querySelectorAll('#linksContainer .link-card').forEach(function(card){
var idx=parseInt(card.dataset.idx,10),link=settings.links[idx];if(!link)return;
var key=freeItemKey('link',link.id),p=rectToGrid(card.getBoundingClientRect(),1,1,key);
items[key]={type:'link',id:link.id,x:p.x,y:p.y+1,w:1,h:1};
fallbackY=Math.max(fallbackY,p.y+2);
});
}
visibleFreeWidgets().forEach(function(d){
var el=document.querySelector(d.selector);if(!el)return;
var rect=el.getBoundingClientRect(),w=d.id==='clock'?d.w:Math.max(d.minW||1,Math.round(rect.width/grid.cell.w)||d.w),h=d.id==='clock'?d.h:Math.max(d.minH||1,Math.round(rect.height/grid.cell.h)||d.h);
w=Math.max(1,w);h=Math.max(1,h);
var key=freeItemKey('widget',d.id),p=rectToGrid(rect,w,h,key);
p=defaultFreeWidgetCell(Object.assign({},d,{w:w,h:h}),key,p);
items[key]={type:'widget',id:d.id,x:p.x,y:p.y,w:w,h:h};
fallbackY=Math.max(fallbackY,p.y+h);
});
settings.links.forEach(function(link){
if(folderContainingLink(link.id))return;
var key=freeItemKey('link',link.id);if(items[key])return;
var p=nearestFreeCell(0,fallbackY,1,1,key);items[key]={type:'link',id:link.id,x:p.x,y:p.y,w:1,h:1};fallbackY=p.y+1;
});
fl.initialized=true;saveSettings();
}
function ensureFreeLayoutCompleteness(){
cleanFreeLayoutState();
var fl=settings.freeLayout;if(!fl.initialized)initializeFreeLayoutItems();
settings.links.forEach(function(link){
if(folderContainingLink(link.id))return;
var key=freeItemKey('link',link.id);if(!fl.items[key]){var p=appendFreeCell(1,1,key);fl.items[key]={type:'link',id:link.id,x:p.x,y:p.y,w:1,h:1};}
});
visibleFreeWidgets().forEach(function(d){
var key=freeItemKey('widget',d.id);if(!fl.items[key]){var p=defaultFreeWidgetCell(d,key,{x:centeredFreeX(d.w),y:3});fl.items[key]={type:'widget',id:d.id,x:p.x,y:p.y,w:d.w,h:d.h};}
});
}
function migrateFreeLayoutPositions(){
var fl=settings.freeLayout;if(!fl||fl.layoutVersion>=6)return;
fl.layoutVersion=6;saveSettings();
}
function applyFreeItemPosition(el,item){
var grid=getFreeGrid(),cell=grid.cell;
el.style.left=(grid.offsetX+((item.x||0)+freeCenterShiftX(grid))*cell.w)+'px';el.style.top=(grid.offsetY+(item.y||0)*cell.h)+'px';
el.style.width=(item.w*cell.w-cell.g)+'px';el.style.height=(item.h*cell.h-cell.g)+'px';
}
function freeDeleteButton(kind,disabled){
return'<button class="free-delete'+(disabled?' disabled':'')+'" data-free-delete="'+kind+'" aria-label="delete">&times;</button>';
}
function renderFreeTile(link,key){
return'<div class="free-layout-item free-tile" data-free-key="'+escapeAttr(key)+'" data-kind="link" data-link-id="'+escapeAttr(link.id)+'">'+freeDeleteButton('link',false)+'<div class="link-icon">'+(link.icon&&/^https?:\/\//.test(link.icon)?'':linkFaviconHtml(link))+linkIconHtml(link)+'</div><div class="link-name">'+escapeHtml(link.name)+'</div></div>';
}
function renderFreeFolder(fid,key){
var f=settings.freeLayout.folders[fid],links=(f.linkIds||[]).map(function(id){return settings.links.find(function(l){return l.id===id;});}).filter(Boolean).slice(0,9);
var item=settings.freeLayout.items[key]||{},size=Math.max(item.w||1,item.h||1);
var cells=[];
for(var i=0;i<9;i++){var l=links[i];cells.push(l?'<span>'+(l.icon&&/^https?:\/\//.test(l.icon)?'':linkFaviconHtml(l))+linkIconHtml(l)+'</span>':'<span class="empty"></span>');}
return'<div class="free-layout-item free-folder" data-free-key="'+escapeAttr(key)+'" data-kind="folder" data-folder-id="'+escapeAttr(fid)+'" data-size="'+size+'">'+freeDeleteButton('folder',false)+'<div class="free-folder-grid">'+cells.join('')+'</div><span class="free-resize-handle" data-resize-key="'+escapeAttr(key)+'"></span></div>';
}
function renderFreeWidget(d,key){
var disabled=!d.closable;
return'<div class="free-layout-item free-widget" data-free-key="'+escapeAttr(key)+'" data-kind="widget" data-widget-id="'+escapeAttr(d.id)+'">'+freeDeleteButton('widget',disabled)+'<div class="free-widget-host"></div><span class="free-resize-edge free-resize-right" data-resize-key="'+escapeAttr(key)+'"></span><span class="free-resize-edge free-resize-bottom" data-resize-key="'+escapeAttr(key)+'"></span><span class="free-resize-handle" data-resize-key="'+escapeAttr(key)+'"></span></div>';
}
function renderFreeLayout(){
ensureFreeLayoutState();
var enabled=!!settings.freeLayout.enabled,s=ensureFreeSurface(),menu=document.getElementById('freeContextMenu');
document.body.classList.toggle('free-layout-enabled',enabled);
document.body.classList.toggle('free-edit-mode',enabled&&!!settings.freeLayout.editMode);
if(!enabled){hideFreeContextMenu();closeFreeFolderPanel();restoreFreeLayoutNodes();s.style.display='none';s.innerHTML='';return;}
restoreFreeLayoutNodes();
ensureFreeLayoutCompleteness();
migrateFreeLayoutPositions();
var html='',fl=settings.freeLayout,linkById={};
settings.links.forEach(function(l){linkById[l.id]=l;});
Object.keys(fl.items).forEach(function(key){
var it=fl.items[key];if(!it||it.hidden)return;
if(it.type==='link'){var link=linkById[it.id];if(link&&!folderContainingLink(it.id))html+=renderFreeTile(link,key);}
else if(it.type==='folder'&&fl.folders[it.id])html+=renderFreeFolder(it.id,key);
else if(it.type==='widget'){var d=freeWidgetDefs().find(function(w){return w.id===it.id;});if(d&&(!d.setting||settings[d.setting]))html+=renderFreeWidget(d,key);}
});
if(fl.editMode)html+='<button class="free-edit-done" id="freeEditDone">'+t('exitOrganize')+'</button>';
s.style.display='block';s.innerHTML=html;
Object.keys(fl.items).forEach(function(key){var it=fl.items[key],el=s.querySelector('[data-free-key="'+CSS.escape(key)+'"]');if(el)applyFreeItemPosition(el,it);});
attachFaviconListeners(s);
s.querySelectorAll('.free-widget').forEach(function(w){
var d=freeWidgetDefs().find(function(def){return def.id===w.dataset.widgetId;}),node=d&&document.querySelector(d.selector),host=w.querySelector('.free-widget-host');
if(node&&host){
rememberFreeNode(node);host.appendChild(node);node.classList.add('free-embedded-node');node.style.width='100%';node.style.height='100%';
if(d.id==='game'){
var carousel=document.querySelector('.game-carousel');if(carousel){rememberFreeNode(carousel);host.appendChild(carousel);carousel.style.display='flex';}
if(typeof syncGameChrome==='function')syncGameChrome();
if(typeof drawStartScreen==='function')setTimeout(drawStartScreen,60);
}
}
});
bindFreeLayoutEvents();
var done=document.getElementById('freeEditDone');if(done)done.addEventListener('click',function(e){e.stopPropagation();settings.freeLayout.editMode=false;saveSettings();renderFreeLayout();});
}
function hideMainForFreeLayout(){
var enabled=settings.freeLayout&&settings.freeLayout.enabled;
var lc=document.getElementById('linksContainer');if(lc&&enabled)lc.style.display='none';
var wg=document.getElementById('widgetsGrid');if(wg&&enabled)wg.style.display='none';
}
function addLinkToFreeLayout(link){
ensureFreeLayoutState();if(!settings.freeLayout.enabled)return;
var key=freeItemKey('link',link.id);if(settings.freeLayout.items[key])return;
var p=freeLayoutContextPoint?nearestFreeCell(freeLayoutContextPoint.x,freeLayoutContextPoint.y,1,1,key):appendFreeCell(1,1,key);
settings.freeLayout.items[key]={type:'link',id:link.id,x:p.x,y:p.y,w:1,h:1};settings.freeLayout.initialized=true;freeLayoutContextPoint=null;
}
function unpackFolder(fid){
var fl=settings.freeLayout,f=fl.folders[fid],item=fl.items[freeItemKey('folder',fid)];if(!f)return;
var x=item?item.x:0,y=item?item.y:0;delete fl.items[freeItemKey('folder',fid)];delete fl.folders[fid];
(f.linkIds||[]).forEach(function(id,idx){var key=freeItemKey('link',id),p=nearestFreeCell(x+idx,y,1,1,key);fl.items[key]={type:'link',id:id,x:p.x,y:p.y,w:1,h:1};});
}
function deleteFreeItem(key){
var fl=settings.freeLayout,it=fl.items[key];if(!it)return;
var removedLink=it.type==='link';
if(it.type==='link'){settings.links=settings.links.filter(function(l){return l.id!==it.id;});delete fl.items[key];Object.keys(fl.folders).forEach(function(fid){fl.folders[fid].linkIds=(fl.folders[fid].linkIds||[]).filter(function(id){return id!==it.id;});});}
else if(it.type==='folder')unpackFolder(it.id);
else if(it.type==='widget'){var d=freeWidgetDefs().find(function(w){return w.id===it.id;});if(d&&d.closable&&d.setting){settings[d.setting]=false;delete fl.items[key];}}
cleanFreeLayoutState();saveSettings();renderQuickLinks();renderLinkEditList();updateSettingsUI();
if(removedLink){var el=ensureFreeSurface().querySelector('[data-free-key="'+CSS.escape(key)+'"]');if(el)el.remove();}
else{updateWidgetVisibility();renderFreeLayout();}
}
function createFolderFromLinks(sourceId,targetId){
if(sourceId===targetId)return;
var fl=settings.freeLayout,sourceKey=freeItemKey('link',sourceId),targetKey=freeItemKey('link',targetId),target=fl.items[targetKey]||fl.items[sourceKey];if(!target)return;
var fid=makeId('folder');fl.folders[fid]={id:fid,linkIds:[targetId,sourceId],page:0};
delete fl.items[sourceKey];delete fl.items[targetKey];
fl.items[freeItemKey('folder',fid)]={type:'folder',id:fid,x:target.x,y:target.y,w:1,h:1};
closeFreeFolderPanel();saveSettings();renderFreeLayout();
}
function addLinkToFolder(linkId,fid){
var fl=settings.freeLayout,f=fl.folders[fid];if(!f||f.linkIds.indexOf(linkId)>=0)return;
delete fl.items[freeItemKey('link',linkId)];f.linkIds.push(linkId);saveSettings();renderFreeLayout();
}
function openFreeFolderPanel(fid){
var s=ensureFreeSurface(),fl=settings.freeLayout,f=fl.folders[fid],item=fl.items[freeItemKey('folder',fid)];if(!f||!item)return;
closeFreeFolderPanel();
var panel=document.createElement('div');panel.className='free-folder-panel';panel.dataset.folderId=fid;
var page=Math.max(0,Math.min(f.page||0,Math.ceil((f.linkIds||[]).length/9)-1)),ids=(f.linkIds||[]).slice(page*9,page*9+9);
panel.innerHTML='<div class="free-folder-panel-grid">'+ids.map(function(id){var l=settings.links.find(function(x){return x.id===id;});if(!l)return'';return'<button class="free-folder-link" data-link-id="'+escapeAttr(id)+'"><span class="link-icon">'+(l.icon&&/^https?:\/\//.test(l.icon)?'':linkFaviconHtml(l))+linkIconHtml(l)+'</span><span>'+escapeHtml(l.name)+'</span></button>';}).join('')+'</div><div class="free-folder-panel-actions"><button data-page="-1">‹</button><span>'+(page+1)+' / '+Math.max(1,Math.ceil((f.linkIds||[]).length/9))+'</span><button data-page="1">›</button></div>';
var grid=getFreeGrid(),cell=grid.cell;panel.style.left=(grid.offsetX+(item.x+freeCenterShiftX(grid))*cell.w)+'px';panel.style.top=(grid.offsetY+(item.y+item.h)*cell.h+8)+'px';
s.appendChild(panel);attachFaviconListeners(panel);freeLayoutFolderPanel=panel;
panel.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.classList.contains('free-folder-link')){var l=settings.links.find(function(x){return x.id===b.dataset.linkId;});if(l)window.open(l.url,'_blank','noopener');return;}if(b.dataset.page){f.page=Math.max(0,Math.min(Math.ceil((f.linkIds||[]).length/9)-1,(f.page||0)+parseInt(b.dataset.page,10)));saveSettings();openFreeFolderPanel(fid);}});
bindFolderPanelDrag(panel,fid);
}
function closeFreeFolderPanel(){if(freeLayoutFolderPanel&&freeLayoutFolderPanel.parentNode)freeLayoutFolderPanel.parentNode.removeChild(freeLayoutFolderPanel);freeLayoutFolderPanel=null;}
function bindFolderPanelDrag(panel,fid){
panel.querySelectorAll('.free-folder-link').forEach(function(btn){
btn.addEventListener('pointerdown',function(e){
if(e.button!==undefined&&e.button!==0)return;
e.preventDefault();e.stopPropagation();
var linkId=btn.dataset.linkId,clone=btn.cloneNode(true),startX=e.clientX,startY=e.clientY,lastSwitch=0,edgeTimer=null;
clone.classList.add('folder-drag-clone');clone.style.left=e.clientX-41+'px';clone.style.top=e.clientY-41+'px';document.body.appendChild(clone);
function clearEdge(){if(edgeTimer){clearTimeout(edgeTimer);edgeTimer=null;}}
function pageDelta(delta){
var f=settings.freeLayout.folders[fid],max=Math.max(0,Math.ceil((f.linkIds||[]).length/9)-1),now=Date.now();
if(!f||now-lastSwitch<1000)return;
var next=Math.max(0,Math.min(max,(f.page||0)+delta));if(next===(f.page||0))return;
lastSwitch=now;f.page=next;saveSettings();openFreeFolderPanel(fid);
}
function move(ev){
clone.style.left=ev.clientX-41+'px';clone.style.top=ev.clientY-41+'px';
var active=freeLayoutFolderPanel||panel,rect=active.getBoundingClientRect(),edge=0;
if(ev.clientX>rect.right-28)edge=1;else if(ev.clientX<rect.left+28)edge=-1;
if(edge&&!edgeTimer)edgeTimer=setTimeout(function(){edgeTimer=null;pageDelta(edge);},1000);
if(!edge)clearEdge();
}
function up(ev){
document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);clearEdge();
if(clone.parentNode)clone.parentNode.removeChild(clone);
var hit=document.elementFromPoint(ev.clientX,ev.clientY),inside=hit&&hit.closest&&hit.closest('.free-folder-panel');
if(!inside){
var f=settings.freeLayout.folders[fid];if(f){f.linkIds=(f.linkIds||[]).filter(function(id){return id!==linkId;});var grid=getFreeGrid(),x=Math.round((ev.clientX-grid.rect.left-grid.offsetX)/grid.cell.w)-freeCenterShiftX(grid),y=Math.round((ev.clientY-grid.rect.top-grid.offsetY)/grid.cell.h),p=nearestFreeCell(x,y,1,1,freeItemKey('link',linkId));settings.freeLayout.items[freeItemKey('link',linkId)]={type:'link',id:linkId,x:p.x,y:p.y,w:1,h:1};cleanFreeLayoutState();saveSettings();closeFreeFolderPanel();renderFreeLayout();}
}
}
document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);
});
});
}
function bindFreeLayoutEvents(){
var s=ensureFreeSurface();
s.querySelectorAll('.free-layout-item').forEach(function(el){if(el.dataset.freeBound)return;el.dataset.freeBound='1';bindFreeItem(el);});
s.querySelectorAll('.free-delete').forEach(function(btn){btn.addEventListener('click',function(e){e.stopPropagation();if(btn.classList.contains('disabled'))return;deleteFreeItem(btn.closest('.free-layout-item').dataset.freeKey);});});
s.querySelectorAll('[data-resize-key]').forEach(function(h){h.addEventListener('pointerdown',startFreeResize);});
if(!s.dataset.freeGlobalBound){s.dataset.freeGlobalBound='1';s.addEventListener('contextmenu',onFreeContextMenu);s.addEventListener('pointerdown',onFreeSurfacePointerDown);document.addEventListener('contextmenu',onFreeContextMenu);document.addEventListener('click',function(e){if(!e.target.closest('#freeContextMenu'))hideFreeContextMenu();if(settings.freeLayout&&settings.freeLayout.enabled&&!e.target.closest('.free-folder-panel')&&!e.target.closest('.free-folder'))closeFreeFolderPanel();});window.addEventListener('resize',function(){if(settings.freeLayout&&settings.freeLayout.enabled)renderFreeLayout();});}
}
function onFreeSurfacePointerDown(e){
if(e.target!==e.currentTarget)return;
clearTimeout(freeLayoutLongPress);
if(e.pointerType==='touch')freeLayoutLongPress=setTimeout(function(){settings.freeLayout.editMode=true;saveSettings();renderFreeLayout();},520);
}
function isFreeDragInteractiveTarget(target){
return !!(target&&target.closest('button,input,textarea,select,.search-engine,.engine-dropdown,.suggest-dropdown,.engine-option,.todo-input,.todo-item,.todo-del,.quote-content,.game-carousel,.game-stage,.game-hint,.game-cube-actions,.pomodoro-time,.pomodoro-chip,.pomodoro-btn,.free-resize-handle,.free-resize-edge,canvas'));
}
function bindFreeItem(el){
var moved=false,pending=null;
el.addEventListener('click',function(e){
if(moved){moved=false;e.preventDefault();return;}
if(settings.freeLayout.editMode)return;
if(el.dataset.kind==='link'){var l=settings.links.find(function(x){return x.id===el.dataset.linkId;});if(l)window.open(l.url,'_blank','noopener');}
else if(el.dataset.kind==='folder')openFreeFolderPanel(el.dataset.folderId);
});
el.addEventListener('pointerdown',function(e){
if(e.button!==undefined&&e.button!==0)return;
if(isFreeDragInteractiveTarget(e.target))return;
if(e.pointerType==='touch'&&!settings.freeLayout.editMode)return;
pending={x:e.clientX,y:e.clientY};
el.setPointerCapture&&el.setPointerCapture(e.pointerId);
});
el.addEventListener('pointermove',function(e){
if(pending&&!freeLayoutDrag){
var threshold=settings.freeLayout.editMode?2:4;
if(Math.hypot(e.clientX-pending.x,e.clientY-pending.y)>=threshold){
startFreeDrag(el,{clientX:pending.x,clientY:pending.y},function(){moved=true;});
e.preventDefault();
}
}
if(freeLayoutDrag&&freeLayoutDrag.el===el){moveFreeDrag(e);e.preventDefault();}
});
function end(e){pending=null;if(freeLayoutDrag&&freeLayoutDrag.el===el)endFreeDrag(e);}
el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
function startFreeDrag(el,e,onMove){
var key=el.dataset.freeKey,it=settings.freeLayout.items[key];if(!it)return;
freeLayoutDrag={el:el,key:key,item:Object.assign({},it),startX:e.clientX,startY:e.clientY,onMove:onMove};
el.classList.add('dragging');el.style.zIndex=80;el.style.pointerEvents='none';
}
function clearFreeMergeTarget(){
if(freeLayoutMergeTarget){freeLayoutMergeTarget.classList.remove('free-merge-target');freeLayoutMergeTarget=null;}
}
function updateFreeMergeTarget(e){
clearFreeMergeTarget();
var d=freeLayoutDrag,it=d&&settings.freeLayout.items[d.key];if(!d||!it||it.type!=='link')return null;
var hit=document.elementFromPoint(e.clientX,e.clientY),target=hit&&hit.closest?hit.closest('.free-layout-item'):null;
if(target&&target.dataset.freeKey!==d.key&&(target.dataset.kind==='link'||target.dataset.kind==='folder')){
freeLayoutMergeTarget=target;target.classList.add('free-merge-target');return target;
}
return null;
}
function moveFreeDrag(e){
var d=freeLayoutDrag;if(!d)return;var dx=e.clientX-d.startX,dy=e.clientY-d.startY;if(d.onMove)d.onMove();
d.el.style.transform='translate3d('+dx+'px,'+dy+'px,0) scale(.98)';
updateFreeMergeTarget(e);
}
function endFreeDrag(e){
var d=freeLayoutDrag;if(!d)return;var fl=settings.freeLayout,it=fl.items[d.key],cell=freeCell();
var dx=e.clientX-d.startX,dy=e.clientY-d.startY,nx=d.item.x+Math.round(dx/cell.w),ny=d.item.y+Math.round(dy/cell.h);
var hit=document.elementFromPoint(e.clientX,e.clientY),target=hit&&hit.closest?hit.closest('.free-layout-item'):null;
d.el.style.pointerEvents='';d.el.classList.remove('dragging');d.el.style.zIndex='';d.el.style.transform='';clearFreeMergeTarget();
if(it.type==='link'&&target&&target.dataset.freeKey!==d.key){
if(target.dataset.kind==='link')createFolderFromLinks(it.id,target.dataset.linkId);
else if(target.dataset.kind==='folder')addLinkToFolder(it.id,target.dataset.folderId);
freeLayoutDrag=null;return;
}
if(it.type==='widget'&&!isAreaFree(nx,ny,it.w,it.h,d.key)){freeLayoutDrag=null;renderFreeLayout();return;}
var p=nearestFreeCell(nx,ny,it.w,it.h,d.key);it.x=p.x;it.y=p.y;saveSettings();freeLayoutDrag=null;renderFreeLayout();
}
function startFreeResize(e){
e.stopPropagation();e.preventDefault();
var key=e.target.dataset.resizeKey,it=settings.freeLayout.items[key];if(!it)return;
var start={x:e.clientX,y:e.clientY,w:it.w,h:it.h,key:key,el:e.target.closest('.free-layout-item'),validW:it.w,validH:it.h};
function resizeCandidate(ev){
var cell=freeCell(),dw=Math.round((ev.clientX-start.x)/cell.w),dh=Math.round((ev.clientY-start.y)/cell.h),nw=start.w+dw,nh=start.h+dh;
if(it.type==='folder'){nw=nh=(nw+nh>=3)?2:1;}else{var d=freeWidgetDefs().find(function(w){return w.id===it.id;});nw=Math.max(d?d.minW:1,Math.min(8,nw));nh=Math.max(d?d.minH:1,Math.min(6,nh));}
return{w:nw,h:nh};
}
function move(ev){
var cell=freeCell(),next=resizeCandidate(ev),valid=isAreaFree(it.x,it.y,next.w,next.h,key);
if(valid){start.validW=next.w;start.validH=next.h;if(start.el){start.el.classList.remove('resize-blocked');start.el.style.width=(next.w*cell.w-cell.g)+'px';start.el.style.height=(next.h*cell.h-cell.g)+'px';}}
else if(start.el)start.el.classList.add('resize-blocked');
}
function up(ev){
document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);
if(start.el)start.el.classList.remove('resize-blocked');
it.w=start.validW;it.h=start.validH;saveSettings();renderFreeLayout();
}
document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);
}
function onFreeContextMenu(e){
if(!settings.freeLayout||!settings.freeLayout.enabled)return;
if(e.target.closest('.free-layout-item,.free-folder-panel,#freeContextMenu,.top-bar,.settings-panel,.modal-overlay,#ad-sidebar,button,input,textarea,select,canvas,.engine-dropdown,.suggest-dropdown'))return;
e.preventDefault();var menu=document.getElementById('freeContextMenu');if(!menu)return;
freeLayoutContextPoint=pointToFreeCell(e.clientX,e.clientY,1,1,null);
menu.querySelector('[data-action="edit"]').textContent=settings.freeLayout.editMode?t('exitOrganize'):t('organizeDesktop');
menu.style.left=Math.min(e.clientX,window.innerWidth-190)+'px';menu.style.top=Math.min(e.clientY,window.innerHeight-110)+'px';menu.classList.add('open');
}
function hideFreeContextMenu(){var m=document.getElementById('freeContextMenu');if(m)m.classList.remove('open');}

function renderLinkEditList(){
var list=document.getElementById('linkEditList');if(!list)return;
list.innerHTML=settings.links.map(function(link,idx){
var icoHtml=link.useFavicon===false?iconSvg(link.icon||'web',20):('<span class="le-favicon-box"></span>');
return'<div class="link-edit-item" data-idx="'+idx+'"><div class="link-edit-icon">'+icoHtml+'</div>'+
'<div class="info"><div class="name">'+escapeHtml(link.name)+'</div><div class="url">'+escapeHtml(link.url)+'</div></div>'+
'<div class="actions"><button class="btn sm" data-edit="'+idx+'">'+t('editLink')+'</button>'+
'<button class="btn sm danger" data-del="'+idx+'">'+t('cancel')+'</button></div></div>';}).join('');
list.querySelectorAll('.link-edit-item').forEach(function(el){
var idx=parseInt(el.dataset.idx);
var link=settings.links[idx];
if(link&&link.useFavicon!==false){
var fvbox=el.querySelector('.le-favicon-box');
if(fvbox){var fvurl=getFaviconUrl(link.url);if(fvurl)fvbox.appendChild(createFaviconImgElement(fvurl,20));}
}
});
list.querySelectorAll('[data-edit]').forEach(function(btn){btn.addEventListener('click',function(){openLinkModal(parseInt(btn.dataset.edit));});});
list.querySelectorAll('[data-del]').forEach(function(btn){btn.addEventListener('click',function(){
settings.links.splice(parseInt(btn.dataset.del),1);saveSettings();renderQuickLinks();renderLinkEditList();});});
}

function openLinkModal(idx,fromFreeContext){if(!fromFreeContext)freeLayoutContextPoint=null;linkEditIdx=(idx!==undefined)?idx:null;
var link=linkEditIdx!==null?settings.links[linkEditIdx]:null;
translateDOM();
var lmt=document.getElementById('linkModalTitle');if(lmt)lmt.textContent=t(linkEditIdx!==null?'editLink':'addLinkTitle');
var lni=document.getElementById('linkNameInput');if(lni)lni.value=link?link.name:'';
var lui=document.getElementById('linkUrlInput');if(lui)lui.value=link?link.url:'';
renderIconPicker(link?link.icon:null,link?link.url:'',link?link.useFavicon:undefined);
var lmo=document.getElementById('linkModalOverlay');if(lmo)lmo.classList.add('open');}

function closeLinkModal(){var lmo=document.getElementById('linkModalOverlay');if(lmo)lmo.classList.remove('open');linkEditIdx=null;freeLayoutContextPoint=null;}

function renderIconPicker(selected,url,useFavicon){var picker=document.getElementById('linkIconPicker');if(!picker)return;
var curUseFav=useFavicon!==false?'favicon':(selected||'web');
var favInner=buildFavBtnInner(url);
var html='<button class="'+(curUseFav==='favicon'?'selected':'')+'" data-icon="favicon" title="'+t('faviconTitle')+'" style="width:40px;height:40px">'+favInner+'</button>';
html+=PICKER_ICONS.map(function(name){
var sel=curUseFav!=='favicon'&&name===curUseFav?'selected':'';
return'<button class="'+sel+'" data-icon="'+name+'">'+iconSvg(name,20)+'</button>';}).join('');
picker.innerHTML=html;
attachFaviconListeners(picker);
picker.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){
if(btn.classList.contains('fav-failed'))return;
picker.querySelectorAll('button').forEach(function(b){b.classList.remove('selected');});
btn.classList.add('selected');});});}

function buildFavBtnInner(url){if(!url)return'<span style="font-size:9px;color:var(--text-subtle);line-height:1.1;text-align:center">'+t('faviconText')+'</span>';
var domain=extractDomain(url);if(!domain)return'<span style="font-size:9px;color:var(--text-subtle);line-height:1.1;text-align:center">'+t('faviconText')+'</span>';
var favurl='https://www.google.com/s2/favicons?domain='+domain+'&sz=64';
return'<img src="'+escapeAttr(favurl)+'" style="width:20px;height:20px;border-radius:3px" alt="">';}

function updateFaviconBtn(url){var picker=document.getElementById('linkIconPicker');if(!picker)return;
var favBtn=picker.querySelector('[data-icon="favicon"]');if(!favBtn)return;
var isSel=favBtn.classList.contains('selected');
favBtn.innerHTML=buildFavBtnInner(url);
if(isSel)favBtn.classList.add('selected');
attachFaviconListeners(picker);
picker.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){
if(btn.classList.contains('fav-failed'))return;
picker.querySelectorAll('button').forEach(function(b){b.classList.remove('selected');});
btn.classList.add('selected');});});}

function saveLinkFromModal(){var name=document.getElementById('linkNameInput');if(!name)return;name=name.value.trim();
var url=document.getElementById('linkUrlInput');if(!url)return;url=url.value.trim();if(!name||!url)return;
var sel=document.querySelector('#linkIconPicker .selected');
var icon=sel?sel.dataset.icon||'favicon':'favicon';
var useFavicon=icon==='favicon';
if(!/^https?:\/\//i.test(url))url='https://'+url;
var linkData={icon:icon,name:name,url:url,useFavicon:useFavicon};
if(linkEditIdx!==null){linkData.id=settings.links[linkEditIdx]&&settings.links[linkEditIdx].id||makeId('link');settings.links[linkEditIdx]=linkData;}
else{linkData.id=makeId('link');settings.links.push(linkData);addLinkToFreeLayout(linkData);}
ensureLinkIds();
saveSettings();renderQuickLinks();renderLinkEditList();closeLinkModal();if(settings.freeLayout&&settings.freeLayout.enabled)renderFreeLayout();}

function renderTodoList(){var list=document.getElementById('todoList');if(!list)return;
list.innerHTML=settings.todos.map(function(todo,idx){var doneClass=todo.done?' done':'';
return'<li class="todo-item'+doneClass+'" data-idx="'+idx+'"><span class="todo-check">'+(todo.done?'&#10003;':'')+'</span>'+
'<span class="todo-text">'+escapeHtml(todo.text)+'</span><button class="todo-del" data-del="'+idx+'">&times;</button></li>';}).join('');
list.querySelectorAll('.todo-item').forEach(function(item){item.addEventListener('click',function(e){
if(e.target.classList.contains('todo-del'))return;
var idx=parseInt(item.dataset.idx);settings.todos[idx].done=!settings.todos[idx].done;saveSettings();renderTodoList();});});
list.querySelectorAll('.todo-del').forEach(function(btn){btn.addEventListener('click',function(e){
e.stopPropagation();settings.todos.splice(parseInt(btn.dataset.del),1);saveSettings();renderTodoList();});});}

function addTodo(){var input=document.getElementById('todoInput');if(!input)return;var text=input.value.trim();if(!text)return;
if(settings.todos.some(function(t){return t.text===text;})){input.value='';return;}
settings.todos.unshift({text:text,done:false});saveSettings();renderTodoList();input.value='';}

var pomodoroTimer=null,pomodoroRoundAnimateNext=false;
function ensurePomodoroState(){
var d=DEFAULTS.pomodoro;
if(!settings.pomodoro)settings.pomodoro={};
for(var k in d){if(!(k in settings.pomodoro))settings.pomodoro[k]=d[k];}
['focus','short','long'].forEach(function(k){settings.pomodoro[k]=Math.max(1,parseInt(settings.pomodoro[k]||d[k],10));});
['focus','short','long'].forEach(function(k){var sk=k+'Seconds';if(sk in settings.pomodoro)settings.pomodoro[sk]=Math.max(1,Math.min(10800,parseInt(settings.pomodoro[sk],10)||settings.pomodoro[k]*60));});
settings.pomodoro.rounds=Math.max(0,parseInt(settings.pomodoro.rounds||0,10));
if(['focus','short','long'].indexOf(settings.pomodoro.mode)<0)settings.pomodoro.mode='focus';
if(!Number.isFinite(settings.pomodoro.remaining)||settings.pomodoro.remaining<0)settings.pomodoro.remaining=pomodoroDuration(settings.pomodoro.mode);
}
function pomodoroDuration(mode){
var p=settings.pomodoro||DEFAULTS.pomodoro;
var sk=mode+'Seconds';
if(p&&Number.isFinite(p[sk]))return Math.max(1,Math.min(10800,parseInt(p[sk],10)||1));
return ((mode==='short'?p.short:mode==='long'?p.long:p.focus)||25)*60;}
function pomodoroModeLabel(mode){return t(mode==='short'?'pomodoroShort':mode==='long'?'pomodoroLong':'pomodoroFocus');}
function formatPomodoroTime(total){
var minutes=Math.floor(total/60),seconds=total%60;
return (minutes<10?'0':'')+minutes+':'+(seconds<10?'0':'')+seconds;
}
function parsePomodoroTimeValue(value,fallback){
var text=String(value||'').trim();
var total;
if(text.indexOf(':')>=0){
var parts=text.split(':');
var minutes=parseInt(parts[0],10)||0;
var seconds=parseInt(parts[1],10)||0;
total=minutes*60+Math.max(0,Math.min(59,seconds));
}else if(/^\d{3,}$/.test(text)){
var compact=text.replace(/\D/g,'');
var sec=parseInt(compact.slice(-2),10)||0;
var min=parseInt(compact.slice(0,-2),10)||0;
total=min*60+Math.max(0,Math.min(59,sec));
}else total=(parseInt(text,10)||fallback||25)*60;
return Math.max(1,Math.min(10800,total));
}
function setPomodoroRoundDisplay(value,animate){
var el=document.getElementById('pomodoroRound');if(!el)return;
value=String(value);
var current=el.querySelector('.pomodoro-round-current');
if(!current){el.innerHTML='<span class="pomodoro-round-current">'+value+'</span>';el.dataset.value=value;return;}
if(current.textContent===value){el.dataset.value=value;return;}
if(!animate||!el.dataset.value){current.textContent=value;el.dataset.value=value;return;}
var old=current;
old.className='pomodoro-round-old';
var next=document.createElement('span');
next.className='pomodoro-round-current pomodoro-round-new';
next.textContent=value;
el.appendChild(next);
el.dataset.value=value;
setTimeout(function(){old.remove();next.classList.remove('pomodoro-round-new');},430);
}
function renderPomodoro(){
ensurePomodoroState();
var p=settings.pomodoro;
if(p.running&&p.endsAt){
var left=Math.max(0,Math.ceil((p.endsAt-Date.now())/1000));
p.remaining=left;
if(left<=0){completePomodoro(false);return;}
}
var duration=pomodoroDuration(p.mode);
var remaining=Math.max(0,Math.min(p.remaining,duration));
var timeEl=document.getElementById('pomodoroTime');if(timeEl&&document.activeElement!==timeEl)timeEl.value=formatPomodoroTime(remaining);
var modeEl=document.getElementById('pomodoroMode');if(modeEl)modeEl.textContent=pomodoroModeLabel(p.mode);
setPomodoroRoundDisplay(p.rounds,pomodoroRoundAnimateNext);pomodoroRoundAnimateNext=false;
var ring=document.getElementById('pomodoroRing');if(ring){var remainingDeg=duration?(remaining/duration)*360:0;ring.style.setProperty('--pomodoro-progress',remainingDeg.toFixed(1)+'deg');ring.style.setProperty('--pomodoro-progress-start',(-remainingDeg).toFixed(1)+'deg');}
var start=document.getElementById('pomodoroStart');if(start)start.textContent=t(p.running?'pomodoroPause':'pomodoroStart');
var widget=document.getElementById('pomodoroWidget');if(widget)widget.classList.toggle('running',!!p.running);
if(widget){widget.classList.toggle('mode-focus',p.mode==='focus');widget.classList.toggle('mode-short',p.mode==='short');widget.classList.toggle('mode-long',p.mode==='long');}
var modes=document.querySelector('.pomodoro-modes');if(modes){modes.classList.toggle('mode-focus',p.mode==='focus');modes.classList.toggle('mode-short',p.mode==='short');modes.classList.toggle('mode-long',p.mode==='long');}
document.querySelectorAll('.pomodoro-chip').forEach(function(btn){btn.classList.toggle('active',btn.dataset.pomodoroMode===p.mode);});
}
function savePomodoro(){ensurePomodoroState();saveSettings();}
function startPomodoro(){
ensurePomodoroState();
var p=settings.pomodoro;
if(!p.running){p.endsAt=Date.now()+Math.max(1,p.remaining)*1000;p.running=true;}
else{p.remaining=Math.max(0,Math.ceil((p.endsAt-Date.now())/1000));p.running=false;p.endsAt=null;}
savePomodoro();renderPomodoro();schedulePomodoroTick();
}
function resetPomodoro(){
ensurePomodoroState();
var p=settings.pomodoro;p.running=false;p.endsAt=null;p.remaining=pomodoroDuration(p.mode);p.rounds=0;pomodoroRoundAnimateNext=true;
savePomodoro();renderPomodoro();schedulePomodoroTick();
}
function setPomodoroMode(mode){
ensurePomodoroState();
if(['focus','short','long'].indexOf(mode)<0)return;
var p=settings.pomodoro;p.mode=mode;p.running=false;p.endsAt=null;p.remaining=pomodoroDuration(mode);
savePomodoro();renderPomodoro();schedulePomodoroTick();
}
function commitPomodoroTimeEdit(){
ensurePomodoroState();
var input=document.getElementById('pomodoroTime');if(!input)return;
var p=settings.pomodoro,mode=p.mode;
var seconds=parsePomodoroTimeValue(input.value,pomodoroDuration(mode));
p[mode+'Seconds']=seconds;p[mode]=Math.max(1,Math.ceil(seconds/60));p.running=false;p.endsAt=null;p.remaining=pomodoroDuration(mode);
savePomodoro();renderPomodoro();schedulePomodoroTick();
}
function completePomodoro(shouldSave){
ensurePomodoroState();
var p=settings.pomodoro;
var completedMode=p.mode;
if(completedMode==='focus'){p.rounds=(p.rounds||0)+1;pomodoroRoundAnimateNext=true;}
p.mode=completedMode==='focus'?((p.rounds%4===0)?'long':'short'):'focus';
p.running=false;p.endsAt=null;p.remaining=pomodoroDuration(p.mode);
if(shouldSave!==false)savePomodoro();else saveSettings();
renderPomodoro();schedulePomodoroTick();
}
function schedulePomodoroTick(){
if(pomodoroTimer){clearInterval(pomodoroTimer);pomodoroTimer=null;}
if(settings.pomodoro&&settings.pomodoro.running){
pomodoroTimer=setInterval(renderPomodoro,250);
}
}
function bindPomodoroEvents(){
var start=document.getElementById('pomodoroStart');if(start)start.addEventListener('click',startPomodoro);
var reset=document.getElementById('pomodoroReset');if(reset)reset.addEventListener('click',resetPomodoro);
document.querySelectorAll('.pomodoro-chip').forEach(function(btn){btn.addEventListener('click',function(){setPomodoroMode(btn.dataset.pomodoroMode);});});
var timeInput=document.getElementById('pomodoroTime');if(timeInput){timeInput.addEventListener('blur',commitPomodoroTimeEdit);timeInput.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();timeInput.blur();}else if(e.key==='Escape'){e.preventDefault();renderPomodoro();timeInput.blur();}});}
renderPomodoro();schedulePomodoroTick();
}

var weatherPending=false,weatherLoaded=false,lastWeather=null;
function renderWeatherFromCache(){if(!lastWeather||!settings.showWeather||!weatherLoaded)return;
var wc=document.getElementById('weatherContent');if(!wc)return;var d=lastWeather;
var desc=d.src==='wttr'?((settings.language==='zh')?wwDesc(d.code,'zh'):(settings.language==='ja')?wwDesc(d.code,'ja'):d.descEn):(({zh:WMO_DESC_ZH,en:WMO_DESC_EN,ja:WMO_DESC_JA})[settings.language]||WMO_DESC_EN)[d.code]||d.descEn;
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg(d.icon)+'</div><div>'+
'<div class="weather-temp">'+d.temp+'&deg;</div>'+
'<div class="weather-details">'+escapeHtml(desc||'')+'</div>'+
(d.wind?'<div class="weather-loc">'+t('windSpeed')+': '+escapeHtml(''+d.wind)+' km/h</div>':'')+
'</div></div>';}
function fetchWeather(){if(!settings.showWeather||weatherPending)return;
weatherPending=true;
var wc=document.getElementById('weatherContent');if(!wc){weatherPending=false;return;}
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg('w-cloudy')+'</div><div>'+
'<div class="weather-temp">--&deg;</div><div class="weather-details">'+t('loadingWeather')+'</div></div></div>';
if(!navigator.geolocation){wc.innerHTML='<div class="weather-details">'+t('locationUnavailable')+'</div>';weatherPending=false;return;}
navigator.geolocation.getCurrentPosition(function(pos){
var lat=pos.coords.latitude.toFixed(2);var lon=pos.coords.longitude.toFixed(2);
tryWW(lat,lon,wc);
},function(err){
if(err.code===1){wc.innerHTML='<div class="weather-details">'+t('locationDenied')+'</div><div class="weather-details" style="font-size:11px;margin-top:6px">'+t('tapRetry')+'</div>';wc.style.cursor='pointer';wc.addEventListener('click',function(){navigator.permissions.query({name:'geolocation'}).then(function(s){if(s.state==='prompt'){weatherPending=false;fetchWeather();}else{wc.innerHTML='<div class="weather-details">'+t('locationDenied')+'<br><span style="font-size:11px;opacity:0.7">'+t('locationPermHint')+'</span></div>';}}).catch(function(){weatherPending=false;fetchWeather();});});}
else{wc.innerHTML='<div class="weather-details">'+t('weatherFailed')+' ('+escapeHtml(err.message)+')</div>';}
weatherPending=false;},{maximumAge:300000,enableHighAccuracy:false});}

function tryWW(lat,lon,wc){
if(!wc)return;
var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();tryOM(lat,lon,wc);},8000);
fetch('https://wttr.in/'+lat+','+lon+'?format=j1',{signal:ctrl.signal})
.then(function(r){clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
.then(function(d){
var cc=d.current_condition[0];var code=parseInt(cc.weatherCode);
var wi=WW_ICON[code]||'w-cloudy';var temp=Math.round(cc.temp_C);
var descEn=cc.weatherDesc[0].value;var wind=Math.round(cc.windspeedKmph);
lastWeather={src:'wttr',code:code,icon:wi,temp:temp,descEn:descEn,wind:wind};
var desc=(settings.language==='zh')?wwDesc(code,'zh'):(settings.language==='ja')?wwDesc(code,'ja'):descEn;
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg(wi)+'</div><div>'+
'<div class="weather-temp">'+temp+'&deg;</div>'+
'<div class="weather-details">'+escapeHtml(desc)+'</div>'+
'<div class="weather-loc">'+t('windSpeed')+': '+escapeHtml(''+wind)+' km/h</div>'+
'</div></div>';
weatherLoaded=true;weatherPending=false;
try{localStorage.setItem('weatherCache',JSON.stringify(lastWeather));}catch(e){}
updateLandscapeFilter();applyLandscapeScene();
}).catch(function(e){clearTimeout(to);if(e.name!=='AbortError')tryOM(lat,lon,wc);});
}

function tryOM(lat,lon,wc){
if(!wc)return;
var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();showWFail(wc);},10000);
fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current_weather=true',{signal:ctrl.signal})
.then(function(r){clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
.then(function(data){
var w=data.current_weather;var temp=Math.round(w.temperature);var code=w.weathercode;
var wi=WMO_ICONS[code]||'w-cloudy';
lastWeather={src:'om',code:code,icon:wi,temp:temp,descEn:WMO_DESC_EN[code]||'',wind:w.windspeed};
var descMaps={zh:WMO_DESC_ZH,en:WMO_DESC_EN,ja:WMO_DESC_JA};
var desc=descMaps[settings.language]?descMaps[settings.language][code]:WMO_DESC_EN[code]||'';
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg(wi)+'</div><div>'+
'<div class="weather-temp">'+temp+'&deg;</div>'+
'<div class="weather-details">'+desc+'</div>'+
'<div class="weather-loc">'+t('windSpeed')+': '+escapeHtml(''+w.windspeed)+' km/h</div></div></div>';
weatherLoaded=true;weatherPending=false;
try{localStorage.setItem('weatherCache',JSON.stringify(lastWeather));}catch(e){}
updateLandscapeFilter();applyLandscapeScene();
}).catch(function(e){clearTimeout(to);showWFail(wc);});
}

function showWFail(wc){weatherPending=false;if(!wc)return;try{var cached=JSON.parse(localStorage.getItem('weatherCache'));if(cached&&cached.temp!==undefined){lastWeather=cached;weatherLoaded=true;renderWeatherFromCache();return;}}catch(e){}wc.innerHTML='<div class="weather-details">'+t('weatherFailed')+'</div>';}

function wIconSvg(name){
if(name==='cloud-sun')return'<svg viewBox="0 0 24 24"><defs><mask id="cs-mask"><rect width="24" height="24" fill="white"/><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" fill="black" stroke="black" stroke-width="1.8" stroke-linejoin="round"/></mask></defs><g mask="url(#cs-mask)"><circle cx="18" cy="6" r="3.5" fill="currentColor" opacity="0.15"/><circle cx="18" cy="6" r="3.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 1V0M18 11v1M13 6h-1M23 6h1M14.5 2.5l-.7-.7M21.5 9.5l.7.7M14.5 9.5l-.7.7M21.5 2.5l.7-.7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></g><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" fill="currentColor" opacity="0.15"/><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
return'<svg viewBox="0 0 24 24"><use href="#i-'+name+'"/></svg>';}

function initDailyQuotes(){var today=new Date().toISOString().slice(0,10);var dq;try{dq=JSON.parse(localStorage.getItem('dailyQuotes'));}catch(e){dq=null;}if(!dq||dq.date!==today){dq={date:today};['zh','en','ja'].forEach(function(l){var q=QUOTES[l]||QUOTES.zh;dq[l]=q[Math.floor(Math.random()*q.length)];});localStorage.setItem('dailyQuotes',JSON.stringify(dq));}return dq;}
function showQuote(){var dq=initDailyQuotes();var q=dq[settings.language]||dq.zh||QUOTES.zh[0];var qc=document.getElementById('quoteContent');if(!qc)return;qc.innerHTML='<div class="quote-text">'+escapeHtml(q.text)+'</div><div class="quote-author">— '+escapeHtml(q.author)+'</div>';}
function refreshQuote(){var dq=initDailyQuotes();var arr=QUOTES[settings.language]||QUOTES.zh;dq[settings.language]=arr[Math.floor(Math.random()*arr.length)];localStorage.setItem('dailyQuotes',JSON.stringify(dq));var qc=document.getElementById('quoteContent');if(!qc)return;var q=dq[settings.language];qc.innerHTML='<div class="quote-text">'+escapeHtml(q.text)+'</div><div class="quote-author">— '+escapeHtml(q.author)+'</div>';qc.classList.remove('bounce');void qc.offsetWidth;qc.classList.add('bounce');}

function updateSettingsUI(){
var el=document.getElementById('setGlassOpacity');if(el)el.value=settings.glassOpacity;
el=document.getElementById('setBlur');if(el)el.value=settings.blur;
el=document.getElementById('setRadius');if(el)el.value=settings.radius;
el=document.getElementById('setAccent');if(el)el.value=settings.accent;
el=document.getElementById('setBgImage');if(el)el.value=settings.bgImage||'';
document.querySelectorAll('#bgPresetBtns .btn').forEach(function(b){b.classList.toggle('active',b.dataset.preset===settings.bgPreset);});
updateToggle('toggleWeather',settings.showWeather);
updateToggle('toggleTodo',settings.showTodo);
updateToggle('toggleQuote',settings.showQuote);
updateToggle('toggleLinks',settings.showLinks);
updateToggle('toggleFreeLayout',settings.freeLayout&&settings.freeLayout.enabled);
updateToggle('togglePomodoro',settings.showPomodoro);
updateToggle('toggleGame',settings.showGame);
updateToggle('toggleDynamicBg',settings.dynamicBg);
updateToggle('toggleCheckUpdate',settings.checkUpdate);
renderThemePicker();
var isDynamicTheme = settings.bgTheme === 'landscape';
var themeOpts = document.querySelectorAll('#themeRadio .radio-option');
themeOpts.forEach(function(btn){ btn.disabled = isDynamicTheme; btn.style.opacity = isDynamicTheme ? '0.4' : ''; btn.style.pointerEvents = isDynamicTheme ? 'none' : ''; });
updateThemeRadio();
moveRadioSlider(document.getElementById('themeRadio'));
moveRadioSlider(document.getElementById('langRadio'));
}
function updateToggle(id,val){var btn=document.getElementById(id);if(btn)btn.classList.toggle('on',val);}
function renderThemePicker(){var tp=document.getElementById('themePicker');if(!tp)return;
if(!THEMES||!THEMES.length)return;
tp.innerHTML=THEMES.map(function(th){var active=(th.id===settings.bgTheme&&settings.showBgImage)?' active':'';
return'<div class="theme-card'+active+'" data-theme="'+th.id+'"><img src="'+th.bgDark+'" alt="" class="theme-thumb-dark"><img src="'+th.bgLight+'" alt="" class="theme-thumb-light"><span>'+t(th.nameKey)+'</span></div>';}).join('');
tp.querySelectorAll('.theme-card').forEach(function(card){card.addEventListener('click',function(){
var themeId=this.dataset.theme;
if(themeId===settings.bgTheme&&settings.showBgImage){
  saveThemeAccentPreset(settings.bgTheme);
  settings.showBgImage=false;settings.bgTheme='';
  settings.accent=settings._accentNone||DEFAULTS.accent;
  settings.bgPreset=settings._presetNone||DEFAULTS.bgPreset;
  saveSettings();applyAll();renderThemePicker();return;
}
saveThemeAccentPreset(settings.bgTheme);
settings.bgTheme=themeId;settings.showBgImage=true;
settings.accent=settings['_accent_'+themeId]||THEMES.find(function(t){return t.id===themeId;}).accent||DEFAULTS.accent;
settings.bgPreset=settings['_preset_'+themeId]||THEMES.find(function(t){return t.id===themeId;}).preset||DEFAULTS.bgPreset;
saveSettings();applyAll();renderThemePicker();});});}
function saveThemeAccentPreset(themeId){
  var ak=themeId?'_accent_'+themeId:'_accentNone';
  var pk=themeId?'_preset_'+themeId:'_presetNone';
  settings[ak]=settings.accent;settings[pk]=settings.bgPreset;
}
function earthThemeActive(){return settings.bgTheme==='earth'&&settings.showBgImage&&!settings.bgImage;}
function updateEarthScene(active){
var api=window.VeraEarthScene;
if(api&&typeof api.setActive==='function')api.setActive({active:!!active,dynamic:settings.dynamicBg});
}
document.addEventListener('vera:earth-ready',function(){updateEarthScene(earthThemeActive());});

function updateLandscapeFilter(){var imgs=document.querySelectorAll('.bg-img-landscape,.bg-img[src$="theme-landscape.svg"]');
if(!imgs.length){document.querySelectorAll('.bg-img-dark,.bg-img-light').forEach(function(img){img.style.filter='';});return;}var h=new Date().getHours();var f='';
if(h>=6&&h<9)f='brightness(1.0) saturate(1.2) sepia(0.25)';else if(h>=9&&h<16)f='brightness(1.0) saturate(1.0)';else if(h>=16&&h<19)f='brightness(0.9) saturate(1.3) sepia(0.35)';else f='brightness(0.35) saturate(0.5) hue-rotate(-25deg)';
if(lastWeather){var c=lastWeather.code;if(c>=119&&c<=122||c>=2&&c<=3||c===45||c===48||c===143||c===248||c===260)f+=' saturate(0.5)';if(c>=263&&c<=311||c===176||c===182||c===185||c>=51&&c<=67||c>=80&&c<=82)f+=' brightness(0.8) saturate(0.3)';if(c>=314&&c<=395||c>=71&&c<=77||c>=85&&c<=86||c===179||c===227||c===230)f+=' brightness(1.1) saturate(0.4) hue-rotate(10deg)';}
imgs.forEach(function(img){img.style.filter=f;});}

var LSEASONS=[{skyTop:'#d9f0e6',skyMid:'#f3dfcf',skyBottom:'#eec2a7',farTop:'#a8c9b3',farBottom:'#80aa9c',side:'#6f9e90',nearTop:'#4f7770',nearBottom:'#31595a',lakeTop:'#b8d7cf',lakeMid:'#9dc8bf',lakeBottom:'#6f9997',foreTop:'#2d5850',foreBottom:'#173a38',dots:0.72,snow:0},
{skyTop:'#b8e6ea',skyMid:'#e6ecd0',skyBottom:'#f0d0a4',farTop:'#8fb8a2',farBottom:'#689d8d',side:'#5d8d80',nearTop:'#426f67',nearBottom:'#284f51',lakeTop:'#a9d7d2',lakeMid:'#83bdb7',lakeBottom:'#5f9698',foreTop:'#23534a',foreBottom:'#153c37',dots:0.25,snow:0},
{skyTop:'#f0b07f',skyMid:'#e8b37a',skyBottom:'#bf735d',farTop:'#d6a35f',farBottom:'#b67f4a',side:'#a96343',nearTop:'#795638',nearBottom:'#483a2c',lakeTop:'#cfb98c',lakeMid:'#b69d75',lakeBottom:'#887661',foreTop:'#5a3f29',foreBottom:'#2f2b23',dots:0.65,snow:0},
{skyTop:'#d4e3e9',skyMid:'#d7dce4',skyBottom:'#c5b6ba',farTop:'#bacbd0',farBottom:'#95adb5',side:'#849aa3',nearTop:'#5e727b',nearBottom:'#334951',lakeTop:'#bfd4d8',lakeMid:'#a8bec6',lakeBottom:'#829da8',foreTop:'#2b454d',foreBottom:'#182f38',dots:0,snow:0.82}];
var LTIMES=[{top:'#15203a',mid:'#293651',bottom:'#566075',sun:'#dbeaff',halo:'#8fb0d8',flow:'#cfe8ff',cloud:0.18},{top:'#c8e6ea',mid:'#f3d7c7',bottom:'#e4af95',sun:'#ffe0a0',halo:'#f1a985',flow:'#e8f5ef',cloud:0.3},{top:'#9bd5e5',mid:'#d8f0ed',bottom:'#f1dfc0',sun:'#fff1b8',halo:'#f7d894',flow:'#f4fffb',cloud:0.24},{top:'#e39b84',mid:'#c0787b',bottom:'#5a4569',sun:'#ffbd82',halo:'#e98176',flow:'#ffe7d5',cloud:0.2},{top:'#15203a',mid:'#293651',bottom:'#566075',sun:'#dbeaff',halo:'#8fb0d8',flow:'#cfe8ff',cloud:0.18}];
var LWEATHERS={clear:{dim:0,cloudBoost:0,sunScale:1,flowBoost:0},rain:{dim:0.16,cloudBoost:0.34,sunScale:0.58,flowBoost:0.2},snow:{dim:0.12,cloudBoost:0.28,sunScale:0.68,flowBoost:0.08},cloudy:{dim:0.18,cloudBoost:0.42,sunScale:0.48,flowBoost:0.02}};

function lsHexToRgb(h){var v=h.replace('#','');return[parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)];}
function lsRgbToHex(r){return'#'+r.map(function(v){var p=Math.max(0,Math.min(255,Math.round(v))).toString(16);return p.length===1?'0'+p:p;}).join('');}
function lsMix(a,b,t){var ca=lsHexToRgb(a),cb=lsHexToRgb(b);return lsRgbToHex(ca.map(function(v,i){return v+(cb[i]-v)*t;}));}
function lsPick(list,angle){var pos=(angle%360)/360*(list.length-1),idx=Math.floor(pos),next=Math.min(idx+1,list.length-1);return{a:list[idx],b:list[next],t:pos-idx};}
function lsBlendSeason(angle){var c=lsPick(LSEASONS.concat([LSEASONS[0]]),angle),r={};Object.keys(c.a).forEach(function(k){if(k==='name')return;r[k]=typeof c.a[k]==='number'?c.a[k]+(c.b[k]-c.a[k])*c.t:lsMix(c.a[k],c.b[k],c.t);});return r;}
function lsBlendTime(angle){var c=lsPick(LTIMES,angle),r={};['top','mid','bottom','sun','halo','flow'].forEach(function(k){r[k]=lsMix(c.a[k],c.b[k],c.t);});r.cloud=c.a.cloud+(c.b.cloud-c.a.cloud)*c.t;return r;}
function lsSetStop(id,color){var el=document.getElementById(id);if(el)el.setAttribute('stop-color',color);}
function lsSetSun(angle,sunScale){var rad=(angle-180)*Math.PI/180,x=960+560*Math.sin(rad),y=650-300*Math.cos(rad),day=Math.max(0,Math.cos(rad)),op=(0.16+day*0.8)*sunScale;['ls-sunCore','ls-sunHalo1','ls-sunHalo2','ls-sunHalo3','ls-sunHalo4'].forEach(function(id){var el=document.getElementById(id);if(el){el.setAttribute('cx',x.toFixed(1));el.setAttribute('cy',y.toFixed(1));}});var sc=document.getElementById('ls-sunCore');if(sc)sc.setAttribute('opacity',op.toFixed(2));var sh=document.getElementById('ls-sunHalo');if(sh)sh.setAttribute('opacity',((0.22+day*0.5)*sunScale).toFixed(2));}

function applyLandscapeScene(){
var scene=document.getElementById('landscapeScene');if(!scene||(!scene.classList.contains('on')&&!lDebugMode))return;
var h=lDebugHour!==undefined?lDebugHour:new Date().getHours(),m=new Date().getMonth();
var timeAngle=(h*60+new Date().getMinutes())/1440*360,seasonAngle=(m/12)*360;
var s=lsBlendSeason(seasonAngle),t=lsBlendTime(timeAngle);
var wKey='clear';var wc=lDebugWeather||(lastWeather?lastWeather.code:null);if(wc){if(wc>=119&&wc<=122||wc>=2&&wc<=3||wc===45||wc===48||wc===143||wc===248||wc===260)wKey='cloudy';else if(wc>=263&&wc<=311||wc===176||wc===182||wc===185||wc>=51&&wc<=67||wc>=80&&wc<=82)wKey='rain';else if(wc>=314&&wc<=395||wc>=71&&wc<=77||wc>=85&&wc<=86||wc===179||wc===227||wc===230)wKey='snow';}
var w=LWEATHERS[wKey],rad=(timeAngle-180)*Math.PI/180,day=Math.max(0,Math.cos(rad)),nightMix=Math.min(0.72,(1-day)*0.44+w.dim*0.42),skySS=0.08+day*0.14;
lsSetStop('ls-skyTop',lsMix(t.top,s.skyTop,skySS));lsSetStop('ls-skyMid',lsMix(t.mid,s.skyMid,skySS));lsSetStop('ls-skyBottom',lsMix(t.bottom,s.skyBottom,skySS));
lsSetStop('ls-farHillTop',lsMix(s.farTop,'#17263a',nightMix));lsSetStop('ls-farHillBottom',lsMix(s.farBottom,'#182d38',nightMix));
lsSetStop('ls-nearHillTop',lsMix(s.nearTop,'#111f2d',nightMix));lsSetStop('ls-nearHillBottom',lsMix(s.nearBottom,'#0d1b24',nightMix));
lsSetStop('ls-lakeTop',lsMix(s.lakeTop,t.top,0.18+nightMix*0.4));lsSetStop('ls-lakeMid',lsMix(s.lakeMid,t.mid,0.16+nightMix*0.36));lsSetStop('ls-lakeBottom',lsMix(s.lakeBottom,'#172b36',nightMix));
lsSetStop('ls-foregroundTop',lsMix(s.foreTop,'#0d1c24',nightMix));lsSetStop('ls-foregroundBottom',lsMix(s.foreBottom,'#071219',nightMix));
var sm=document.getElementById('ls-sideMountain');if(sm)sm.setAttribute('fill',lsMix(s.side,'#122633',nightMix));
var mm=document.getElementById('ls-mainMountain');if(mm)mm.setAttribute('opacity',(0.94-nightMix*0.1).toFixed(2));
var sc=document.getElementById('ls-sunCore');if(sc)sc.setAttribute('fill',t.sun);
['ls-sunHalo1','ls-sunHalo2','ls-sunHalo3','ls-sunHalo4'].forEach(function(id){var el=document.getElementById(id);if(el)el.setAttribute('fill',t.halo);});
var wf=document.getElementById('ls-waterFlow');if(wf){wf.setAttribute('stroke',t.flow);wf.setAttribute('opacity',(0.34+w.flowBoost).toFixed(2));}
var cl=document.getElementById('ls-clouds');if(cl)cl.setAttribute('opacity',Math.min(0.84,t.cloud+w.cloudBoost).toFixed(2));
var hm=document.getElementById('ls-horizonMist');if(hm)hm.setAttribute('fill',lsMix('#d7e4df',t.bottom,0.2));
var rip=document.getElementById('ls-ripples');if(rip)rip.setAttribute('opacity',(0.12+day*0.14).toFixed(2));
var wd=document.getElementById('ls-weatherDim');if(wd)wd.setAttribute('opacity',w.dim.toFixed(2));
var sn=document.getElementById('ls-snowCap');if(sn)sn.setAttribute('opacity',(Math.max(s.snow,wKey==='snow'?0.78:0)*(0.6+day*0.4)).toFixed(2));
var sd=document.getElementById('ls-seasonDots');if(sd)sd.setAttribute('opacity',(s.dots*(0.35+day*0.65)).toFixed(2));
lsSetSun(timeAngle,w.sunScale);
createWeatherEffect(wKey);
}

var lWeatherKey='';
function lsSvg(name){return document.createElementNS('http://www.w3.org/2000/svg',name);}
function lsRand(min,max){return min+Math.random()*(max-min);}
function createWeatherEffect(wKey){if(wKey===lWeatherKey)return;lWeatherKey=wKey;
var layer=document.getElementById('ls-weatherLayer');if(!layer)return;
while(layer.firstChild)layer.removeChild(layer.firstChild);
if(wKey==='rain'){
var g=lsSvg('g');g.setAttribute('stroke','#d7edf5');g.setAttribute('stroke-linecap','round');g.setAttribute('opacity','0.58');
for(var i=0;i<95;i++){var x=(i/95)*2040+lsRand(-60,60)-80,y=lsRand(-220,1060),len=lsRand(42,78);
var drop=lsSvg('line');drop.setAttribute('x1',x.toFixed(1));drop.setAttribute('y1',y.toFixed(1));
drop.setAttribute('x2',(x-len*0.28).toFixed(1));drop.setAttribute('y2',(y+len).toFixed(1));
drop.setAttribute('stroke-width',lsRand(1.4,2.7).toFixed(1));
var fall=lsSvg('animateTransform');fall.setAttribute('attributeName','transform');fall.setAttribute('type','translate');
fall.setAttribute('from','0 -160');fall.setAttribute('to','0 1180');fall.setAttribute('dur',lsRand(1.0,1.9).toFixed(2)+'s');
fall.setAttribute('begin','-'+lsRand(0,1.9).toFixed(2)+'s');fall.setAttribute('repeatCount','indefinite');
drop.appendChild(fall);g.appendChild(drop);}
layer.appendChild(g);}
if(wKey==='snow'){
var sg=lsSvg('g');sg.setAttribute('fill','#f8fcff');sg.setAttribute('opacity','0.76');
for(var j=0;j<120;j++){var fx=(j/120)*2040+lsRand(-80,80)-60,fy=lsRand(-260,1060),drift=lsRand(-90,90);
var flake=lsSvg('circle');flake.setAttribute('cx',fx.toFixed(1));flake.setAttribute('cy',fy.toFixed(1));
flake.setAttribute('r',lsRand(2.0,5.2).toFixed(1));flake.setAttribute('opacity',lsRand(0.32,0.88).toFixed(2));
var sf=lsSvg('animateTransform');sf.setAttribute('attributeName','transform');sf.setAttribute('type','translate');
sf.setAttribute('values','0 -180;'+drift.toFixed(1)+' 1120;0 -180');sf.setAttribute('dur',lsRand(8,16).toFixed(1)+'s');
sf.setAttribute('begin','-'+lsRand(0,12).toFixed(1)+'s');sf.setAttribute('repeatCount','indefinite');
flake.appendChild(sf);sg.appendChild(flake);}
layer.appendChild(sg);}
}

window.__vera={
scene:function(h,w){if(h!==undefined)lDebugHour=h;if(w!==undefined)lDebugWeather=w;lDebugMode=true;var scene=document.getElementById('landscapeScene');if(scene){scene.style.display='';scene.classList.add('on');}if(lDebugWeather){lastWeather={code:lDebugWeather};}else if(!lastWeather){lastWeather={code:113};}
applyLandscapeScene();
},
weather:function(w){lDebugMode=true;var scene=document.getElementById('landscapeScene');if(scene){scene.style.display='';scene.classList.add('on');}lastWeather={code:w};createWeatherEffect(w==71||w==314?'snow':w>=51||w>=263?'rain':w>=119||w>=2?'cloudy':'clear');applyLandscapeScene();},
time:function(h){lDebugHour=h;lDebugMode=true;var scene=document.getElementById('landscapeScene');if(scene){scene.style.display='';scene.classList.add('on');}applyLandscapeScene();},
reset:function(){lDebugHour=undefined;lDebugWeather=undefined;lDebugMode=false;var scene=document.getElementById('landscapeScene');var isLandscape=settings.bgTheme==='landscape'&&settings.showBgImage&&!settings.bgImage;if(scene){scene.style.display=isLandscape?'':'none';scene.classList.toggle('on',isLandscape);}applyLandscapeScene();},
status:function(){console.log('debugHour:',lDebugHour,'debugWeather:',lDebugWeather,'debugMode:',lDebugMode,'scene on:',document.getElementById('landscapeScene')?document.getElementById('landscapeScene').classList.contains('on'):'N/A');}
};
var lDebugHour,lDebugWeather,lDebugMode;
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function escapeAttr(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function cycleTheme(){
var themes=['auto','dark','light'];var idx=themes.indexOf(settings.theme);
settings.theme=themes[(idx+1)%themes.length];saveSettings();applyAll();
updateThemeRadio();moveRadioSlider(document.getElementById('themeRadio'));
}
function cycleLanguage(){
var langs=['zh','en','ja'];var idx=langs.indexOf(settings.language);
settings.language=langs[(idx+1)%langs.length];saveSettings();renderQuickLinks();renderLinkEditList();applyAll();updateClock();showQuote();renderWeatherFromCache();
updateThemeRadio();moveRadioSlider(document.getElementById('langRadio'));
}
function resetSettings(){
if(!confirm(t('confirmReset')))return;
if(typeof resetCubeDefaults==='function')resetCubeDefaults();
else{try{localStorage.removeItem('vera_cube_state_v1');}catch(e){}}
try{localStorage.removeItem('newtab_onboarding_v3');}catch(e){}
settings=JSON.parse(JSON.stringify(DEFAULTS));delete settings._showBgAuto;delete settings.bgThemeSaved;delete settings._savedPreset;delete settings._savedAccent;ensureLinkIds();ensureFreeLayoutState();pomodoroRoundAnimateNext=true;saveSettings();renderQuickLinks();applyAll();updateClock();
schedulePomodoroTick();
setTimeout(function(){updateSettingsUI();renderThemePicker();},100);
}

// Native fetch-based search suggestions for all engines (no JSONP)
function renderSuggest(list){if(!suggestDropdown)return;if(!list||!list.length){suggestDropdown.classList.remove('open');return;}
var sb=document.getElementById('searchBox');
var sr=sb.getBoundingClientRect();
suggestDropdown.style.top=sr.bottom+'px';
suggestDropdown.style.left=sr.left+'px';
suggestDropdown.style.width=sr.width+'px';
suggestDropdown.innerHTML=list.slice(0,6).map(function(item,n){
var text=typeof item==='string'?item:(item.phrase||item.q||item||'');
return'<div class="suggest-item" data-query="'+escapeAttr(text)+'"><span class="suggest-icon">'+iconSvg('search',14)+'</span>'+escapeHtml(text)+'</div>';}).join('');
suggestDropdown.classList.add('open');
suggestDropdown.querySelectorAll('.suggest-item').forEach(function(el){el.addEventListener('click',function(){
document.getElementById('searchInput').value=el.dataset.query;doSearch();suggestDropdown.classList.remove('open');});});}

function fetchSuggest(q){
var eng=settings.searchEngine||'google';
if(eng==='google'){
fetch('https://suggestqueries.google.com/complete/search?client=firefox&q='+encodeURIComponent(q))
.then(function(r){return r.json();}).then(function(d){renderSuggest(d[1]||[]);}).catch(function(){suggestDropdown.classList.remove('open');});
}else if(eng==='bing'){
fetch('https://api.bing.com/osjson.aspx?query='+encodeURIComponent(q))
.then(function(r){return r.json();}).then(function(d){renderSuggest(d[1]||[]);}).catch(function(){suggestDropdown.classList.remove('open');});
}else if(eng==='baidu'){
fetch('https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=wise_web&wd='+encodeURIComponent(q))
.then(function(r){return r.json();}).then(function(d){var list=d.g||[];renderSuggest(list.map(function(i){return i.q||i;}));}).catch(function(){suggestDropdown.classList.remove('open');});
}else if(eng==='duckduckgo'){
fetch('https://duckduckgo.com/ac/?q='+encodeURIComponent(q)+'&type=list')
.then(function(r){return r.json();}).then(function(d){renderSuggest((d||[]).map(function(i){return i.phrase||i;}));}).catch(function(){suggestDropdown.classList.remove('open');});
}else{renderSuggest([]);}}

function init(){
loadSettings();_bindVipEvents();_initAds();_initGame();applyAll();renderQuickLinks();
updateClock();scheduleClock();
showQuote();
bindPomodoroEvents();
var qc=document.getElementById('quoteWidget');if(qc){qc.addEventListener('mousedown',function(e){if(e.detail>1){e.preventDefault();window.getSelection().removeAllRanges();}qc._ts=Date.now();});qc.addEventListener('mouseup',function(){if(qc._ts&&Date.now()-qc._ts<300&&!window.getSelection().toString().trim())refreshQuote();});}
checkOnboarding();
var si=document.getElementById('searchInput');if(si)si.addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});
suggestTimer=null;suggestDropdown=document.getElementById('suggestDropdown');
if(si)si.addEventListener('input',function(){
var q=this.value.trim();clearTimeout(suggestTimer);if(suggestDropdown)suggestDropdown.classList.remove('open');
if(q.length<2)return;suggestTimer=setTimeout(function(){fetchSuggest(q);},250);});
document.addEventListener('click',function(e){if(!e.target.closest('#searchInput')&&!e.target.closest('#suggestDropdown')){if(suggestDropdown)suggestDropdown.classList.remove('open');}});
var sb=document.getElementById('searchBox');if(sb)sb.addEventListener('click',function(e){
if(e.target.closest('.search-engine')||e.target.closest('.engine-dropdown'))return;
var si2=document.getElementById('searchInput');if(si2)si2.focus();});
var engBtn=document.getElementById('searchEngineBtn');
var engDropdown=document.getElementById('engineDropdown');
function repositionDropdown(){
if(!engBtn||!engDropdown)return;
var rect=engBtn.getBoundingClientRect();
engDropdown.style.top=(rect.bottom+8)+'px';
engDropdown.style.right=(window.innerWidth-rect.right)+'px';
engDropdown.style.left='auto';
}
if(engBtn)engBtn.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();
if(engDropdown.classList.contains('open')){engDropdown.classList.remove('open');engBtn.classList.remove('open');}
else{repositionDropdown();engDropdown.classList.add('open');engBtn.classList.add('open');}});
if(engDropdown)engDropdown.addEventListener('click',function(e){e.stopPropagation();});
window.addEventListener('resize',function(){if(engDropdown&&engDropdown.classList.contains('open'))repositionDropdown();});
window.addEventListener('scroll',function(){if(engDropdown&&engDropdown.classList.contains('open'))repositionDropdown();});
document.addEventListener('click',function(e){
if(!e.target.closest('#searchEngineBtn')&&!e.target.closest('#engineDropdown')){
if(engDropdown)engDropdown.classList.remove('open');if(engBtn)engBtn.classList.remove('open');}});
var ti=document.getElementById('todoInput');if(ti)ti.addEventListener('keydown',function(e){if(e.key==='Enter')addTodo();});
var tb=document.getElementById('themeBtn');if(tb)tb.addEventListener('click',cycleTheme);
var lb=document.getElementById('langBtn');if(lb)lb.addEventListener('click',cycleLanguage);
var stb=document.getElementById('settingsBtn');if(stb)stb.addEventListener('click',function(){
var so=document.getElementById('settingsOverlay');if(so)so.classList.add('open');
var sp=document.getElementById('settingsPanel');if(sp)sp.classList.add('open');
renderLinkEditList();updateSettingsUI();translateDOM();
setTimeout(function(){
moveRadioSlider(document.getElementById('themeRadio'));
moveRadioSlider(document.getElementById('langRadio'));
},420);
if(typeof dismissOnboardingDot==='function')dismissOnboardingDot('settingsBtn');
});
var sc=document.getElementById('settingsClose');if(sc)sc.addEventListener('click',closeSettings);
var so2=document.getElementById('settingsOverlay');if(so2)so2.addEventListener('click',closeSettings);
document.querySelectorAll('.settings-tab').forEach(function(tab){tab.addEventListener('click',function(){
document.querySelectorAll('.settings-tab').forEach(function(t){t.classList.remove('active');});
document.querySelectorAll('.settings-section').forEach(function(s){s.classList.remove('active');});
tab.classList.add('active');var sec=document.getElementById('sec-'+tab.dataset.tab);if(sec)sec.classList.add('active');
if(tab.dataset.tab==='widgets'&&typeof dismissOnboardingDot==='function')dismissOnboardingDot('widgetsTab');
var slider=document.querySelector('.tab-slider');
if(slider){var tabs=document.querySelector('.settings-tabs');var rect=tabs.getBoundingClientRect();var tr=tab.getBoundingClientRect();slider.style.left=(tr.left-rect.left)+'px';slider.style.width=tr.width+'px';}
});});
(function initSlider(){var t=document.querySelector('.settings-tab.active');var s=document.querySelector('.tab-slider');var tabs=document.querySelector('.settings-tabs');if(t&&s&&tabs){var r0=tabs.getBoundingClientRect();var r1=t.getBoundingClientRect();s.style.left=(r1.left-r0.left)+'px';s.style.width=r1.width+'px';}})();
(function initRadioSliders(){document.querySelectorAll('.radio-group').forEach(function(g){moveRadioSlider(g);});})();
var debounceTimer=null;
function debounceApply(){clearTimeout(debounceTimer);debounceTimer=setTimeout(function(){saveSettings();applyAll();},80);}
var sgo=document.getElementById('setGlassOpacity');if(sgo)sgo.addEventListener('input',function(){settings.glassOpacity=parseInt(this.value);debounceApply();});
var sbl=document.getElementById('setBlur');if(sbl)sbl.addEventListener('input',function(){settings.blur=parseInt(this.value);debounceApply();});
var sr=document.getElementById('setRadius');if(sr)sr.addEventListener('input',function(){settings.radius=parseInt(this.value);debounceApply();});
var sa=document.getElementById('setAccent');if(sa)sa.addEventListener('input',function(){settings.accent=this.value;if(settings.showBgImage&&settings.bgTheme){settings['_accent_'+settings.bgTheme]=this.value;}else{settings._accentNone=this.value;}debounceApply();});
document.querySelectorAll('#bgPresetBtns .btn').forEach(function(btn){btn.addEventListener('click',function(){
settings.bgPreset=btn.dataset.preset;if(settings.showBgImage&&settings.bgTheme){settings['_preset_'+settings.bgTheme]=btn.dataset.preset;}else{settings._presetNone=btn.dataset.preset;}saveSettings();applyAll();});});
var bgInput=document.getElementById('setBgImage');if(bgInput){bgInput.addEventListener('blur',function(){var v=this.value.trim();
if(v&&!settings.showBgImage){settings.showBgImage=true;settings._showBgAuto=true;settings.bgThemeSaved=settings.bgTheme;}
else if(!v&&settings.bgImage){if(settings._showBgAuto){settings.showBgImage=false;settings._showBgAuto=undefined;}settings.bgTheme=settings.bgThemeSaved||'horizon';settings.bgThemeSaved=undefined;}
settings.bgImage=v;if(v)settings.bgTheme='';saveSettings();applyAll();});bgInput.addEventListener('keydown',function(e){if(e.key==='Enter'){this.blur();}});}
var buBtn=document.getElementById('bgUploadBtn');if(buBtn)buBtn.addEventListener('click',function(){var bfi=document.getElementById('bgFileInput');if(bfi)bfi.click();});
var bfi=document.getElementById('bgFileInput');if(bfi)bfi.addEventListener('change',function(){var f=this.files[0];if(!f)return;var reader=new FileReader();reader.onload=function(){if(!settings.showBgImage){settings.showBgImage=true;settings._showBgAuto=true;settings.bgThemeSaved=settings.bgTheme;}settings.bgImage=reader.result;settings.bgTheme='';saveSettings();applyAll();var bi=document.getElementById('setBgImage');if(bi)bi.value='[已上传: '+f.name+']';};reader.readAsDataURL(f);});
var tw=document.getElementById('toggleWeather');if(tw)tw.addEventListener('click',function(){settings.showWeather=!settings.showWeather;saveSettings();applyAll();if(settings.showWeather)fetchWeather();});
var ttd=document.getElementById('toggleTodo');if(ttd)ttd.addEventListener('click',function(){settings.showTodo=!settings.showTodo;saveSettings();applyAll();});
var tq=document.getElementById('toggleQuote');if(tq)tq.addEventListener('click',function(){settings.showQuote=!settings.showQuote;saveSettings();applyAll();});
var tl=document.getElementById('toggleLinks');if(tl)tl.addEventListener('click',function(){settings.showLinks=!settings.showLinks;saveSettings();applyAll();});
var tfl=document.getElementById('toggleFreeLayout');if(tfl)tfl.addEventListener('click',function(){ensureFreeLayoutState();settings.freeLayout.enabled=!settings.freeLayout.enabled;if(!settings.freeLayout.enabled)settings.freeLayout.editMode=false;saveSettings();applyAll();});
var tpom=document.getElementById('togglePomodoro');if(tpom)tpom.addEventListener('click',function(){settings.showPomodoro=!settings.showPomodoro;saveSettings();applyAll();});
var tg=document.getElementById('toggleGame');if(tg)tg.addEventListener('click',function(){settings.showGame=!settings.showGame;saveSettings();applyAll();});
var tdb=document.getElementById('toggleDynamicBg');if(tdb)tdb.addEventListener('click',function(){settings.dynamicBg=!settings.dynamicBg;saveSettings();applyAll();});
var tsb=document.getElementById('toggleShowBgImage');if(tsb)tsb.addEventListener('click',function(){settings.showBgImage=!settings.showBgImage;settings._showBgAuto=undefined;if(settings.showBgImage&&(!settings.bgTheme||settings.bgTheme===''))settings.bgTheme='horizon';saveSettings();applyAll();});
var tcu=document.getElementById('toggleCheckUpdate');if(tcu)tcu.addEventListener('click',function(){settings.checkUpdate=!settings.checkUpdate;saveSettings();applyAll();});
document.querySelectorAll('#themeRadio .radio-option').forEach(function(btn){btn.addEventListener('click',function(){
settings.theme=btn.dataset.themeVal;saveSettings();applyAll();moveRadioSlider(this.parentNode);});});
document.querySelectorAll('#langRadio .radio-option').forEach(function(btn){btn.addEventListener('click',function(){
settings.language=btn.dataset.langVal;saveSettings();renderQuickLinks();renderLinkEditList();applyAll();updateClock();showQuote();renderWeatherFromCache();moveRadioSlider(this.parentNode);});});
var alb=document.getElementById('addLinkBtn');if(alb)alb.addEventListener('click',function(){openLinkModal();});
var lmc=document.getElementById('linkModalCancel');if(lmc)lmc.addEventListener('click',closeLinkModal);
var lmo2=document.getElementById('linkModalOverlay');if(lmo2)lmo2.addEventListener('click',function(e){if(e.target===this)closeLinkModal();});
var lms=document.getElementById('linkModalSave');if(lms)lms.addEventListener('click',saveLinkFromModal);
var rb=document.getElementById('resetBtn');if(rb)rb.addEventListener('click',resetSettings);
var donateLink=document.getElementById('donateLink');if(donateLink)donateLink.addEventListener('click',function(e){e.preventDefault();var qr=document.getElementById('donateQr');if(qr&&!qr.src){qr.src=qr.getAttribute('data-src');}var dmo=document.getElementById('donateModalOverlay');if(dmo)dmo.classList.add('open');});
var donateClose=document.getElementById('donateModalClose');if(donateClose)donateClose.addEventListener('click',function(){var dmo=document.getElementById('donateModalOverlay');if(dmo)dmo.classList.remove('open');});
var donateOverlay=document.getElementById('donateModalOverlay');if(donateOverlay)donateOverlay.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});
var donateQr=document.getElementById('donateQr');if(donateQr){donateQr.addEventListener('click',function(){var z=document.getElementById('qrZoomOverlay');var zi=document.getElementById('qrZoomImg');if(z&&zi){zi.src=this.src;z.classList.add('open');}});donateQr.addEventListener('error',function(){this.parentElement.innerHTML='<p style=color:var(--text-dim)>'+t('qrFailed')+'</p>';});}
var qrZoom=document.getElementById('qrZoomOverlay');if(qrZoom)qrZoom.addEventListener('click',function(){this.classList.remove('open');});
var lni2=document.getElementById('linkNameInput');if(lni2)lni2.addEventListener('keydown',function(e){if(e.key==='Enter'){var lui2=document.getElementById('linkUrlInput');if(lui2)lui2.focus();e.preventDefault();}});
var lui2=document.getElementById('linkUrlInput');if(lui2){lui2.addEventListener('keydown',function(e){if(e.key==='Enter'){saveLinkFromModal();}});
lui2.addEventListener('input',function(){
var url=this.value.trim();updateFaviconBtn(url);});}
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSettings();if(suggestDropdown)suggestDropdown.classList.remove('open');}
if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();var si3=document.getElementById('searchInput');if(si3)si3.focus();}});
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(){if(settings.theme==='auto')applyAll();});
fetchWeather();window.fetchWeather=fetchWeather;
if(navigator.permissions&&navigator.permissions.query){
navigator.permissions.query({name:'geolocation'}).then(function(status){
if(status.state==='granted'&&!weatherLoaded)fetchWeather();
status.onchange=function(){if(this.state==='granted'&&!weatherLoaded)fetchWeather();};
}).catch(function(){});
}
checkUpdate();
}
function closeSettings(){var ov=document.getElementById('settingsOverlay');if(ov)ov.classList.remove('open');var pn=document.getElementById('settingsPanel');if(pn)pn.classList.remove('open');}
function checkUpdate(){if(!settings.checkUpdate)return;
var today=new Date().toISOString().slice(0,10);
var last;try{last=localStorage.getItem('lastUpdateCheck');}catch(e){}
if(last===today)return;
try{localStorage.setItem('lastUpdateCheck',today);}catch(e){}
fetch('https://api.github.com/repos/doiiaioiiiailphin-cmyk/vera-new-tab/releases/latest',{headers:{Accept:'application/vnd.github+json'}})
.then(function(r){return r.json();}).then(function(d){
var latest=d.tag_name?d.tag_name.replace(/^v/,''):'';if(!latest||!d.assets||!d.assets[0])return;
var rt=(typeof browser!=='undefined')?browser.runtime:chrome.runtime;
var cur=(rt&&rt.getManifest)?rt.getManifest().version:'1.0.0';
if(compareVersion(latest,cur)>0){showUpdateBadge(d.tag_name,d.assets[0].browser_download_url);}
}).catch(function(){});
}
function compareVersion(a,b){var ap=a.split('.'),bp=b.split('.');
for(var i=0;i<Math.max(ap.length,bp.length);i++){var an=parseInt(ap[i])||0,bn=parseInt(bp[i])||0;if(an>bn)return 1;if(an<bn)return -1;}return 0;}
function showUpdateBadge(tag,url){
var btn=document.getElementById('settingsBtn');if(!btn)return;
var badge=document.createElement('span');
badge.style.cssText='position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:var(--accent);border-radius:50%;box-shadow:0 0 8px var(--accent-glow);z-index:2';
badge.title=t('updateAvailable')+tag;
btn.appendChild(badge);
var bar=document.createElement('div');
bar.className='update-bar';
bar.innerHTML='<span>'+t('updateAvailable').replace(/ $/,'')+' '+escapeHtml(tag)+'</span><button class="btn sm accent" id="updateNow">'+t('updateNow')+'</button><button class="btn sm" id="updateDismiss">&times;</button>';
document.body.appendChild(bar);
setTimeout(function(){bar.classList.add('show');},500);
var un=document.getElementById('updateNow');if(un)un.addEventListener('click',function(){
bar.innerHTML='<span>'+t('downloading')+'</span>';
window.open(url,'_blank','noopener');bar.remove();
});
var ud=document.getElementById('updateDismiss');if(ud)ud.addEventListener('click',function(){bar.remove();});
}
function finishOnboarding(){
localStorage.setItem('newtab_onboarding_v3','1');
try{chrome.action.setBadgeText({text:''});}catch(e){}
document.querySelectorAll('.onboarding-dot').forEach(function(d){d.remove();});
document.querySelectorAll('.onboarding-highlight').forEach(function(e){e.classList.remove('onboarding-highlight');});
document.querySelectorAll('.onboarding-highlight-ring').forEach(function(e){e.remove();});
}
function flashOnboardingHighlight(target){
if(!target)return;
document.querySelectorAll('.onboarding-highlight-ring').forEach(function(e){e.remove();});
var r=target.getBoundingClientRect();
var label=target.querySelector('label');
var lr=label?label.getBoundingClientRect():r;
var w=r.width+16,h=r.height+16;
var centerY=lr.top+lr.height/2;
var ring=document.createElement('div');
ring.className='onboarding-highlight-ring';
ring.style.left=(r.left-8)+'px';
ring.style.top=(centerY-h/2)+'px';
ring.style.width=w+'px';
ring.style.height=h+'px';
document.body.appendChild(ring);
ring.addEventListener('animationend',function(){ring.remove();finishOnboarding();},{once:true});
setTimeout(function(){if(ring.parentNode){ring.remove();finishOnboarding();}},1300);
}
function dismissOnboardingDot(step){
if(localStorage.getItem('newtab_onboarding_v3'))return;
if(step==='settingsBtn'){
var d=document.getElementById('onboardingSettingsDot');if(d)d.remove();
var wt=document.querySelector('.settings-tab[data-tab="widgets"]');
if(wt){wt.style.position='relative';
var td=document.createElement('span');td.className='onboarding-dot on-tab';td.id='onboardingTabDot';wt.appendChild(td);}
}else if(step==='widgetsTab'){
var td=document.getElementById('onboardingTabDot');if(td)td.remove();
var gr=document.getElementById('toggleGame');if(gr){var row=gr.closest('.settings-row');setTimeout(function(){flashOnboardingHighlight(row);},380);}
else finishOnboarding();
}
}
function checkOnboarding(){
if(localStorage.getItem('newtab_onboarding_v3'))return;
try{chrome.action.setBadgeText({text:'●'});chrome.action.setBadgeBackgroundColor({color:'#ef4444'});}catch(e){}
var sb=document.getElementById('settingsBtn');
if(sb){sb.style.position='relative';
var dot=document.createElement('span');dot.className='onboarding-dot';dot.id='onboardingSettingsDot';sb.appendChild(dot);}
}
document.addEventListener('DOMContentLoaded',init);
})();

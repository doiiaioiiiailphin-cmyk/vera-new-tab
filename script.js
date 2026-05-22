(function(){
"use strict";

var PICKER_ICONS=['web','mail','code','play','chat','x','star','heart','home','book','music','camera','phone','bulb','palette','chart','dollar','zap','fire','gamepad'];

var DEFAULTS={glassOpacity:6,blur:32,radius:24,accent:'#5eead4',bgPreset:'ice',bgImage:'',bgTheme:'horizon',showBgImage:false,checkUpdate:true,
showWeather:true,showTodo:true,showQuote:true,showLinks:true,dynamicBg:true,
searchEngine:'google',theme:'auto',language:'zh',vip:false,
links:[{icon:'gmail',name:'Gmail',url:'https://mail.google.com',useFavicon:false},
{icon:'code',name:'GitHub',url:'https://github.com'},
{icon:'play',name:'YouTube',url:'https://youtube.com'},
{icon:'web',name:'Bilibili',url:'https://bilibili.com'},
{icon:'chat',name:'ChatGPT',url:'https://chat.openai.com'}],
todos:[]};

var THEMES=[{id:'horizon',nameKey:'themeHorizon',bgDark:'assets/bg-dark.webp',bgLight:'assets/bg-light.webp',preset:'ice',accent:'#5eead4'},{id:'landscape',nameKey:'themeLandscape',bgDark:'assets/theme-landscape.svg',bgLight:'assets/theme-landscape.svg',preset:'ocean',accent:'#547a7b'}];

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

function iconSvg(name,size){size=size||18;
return'<span class="icon-svg" style="font-size:'+size+'px"><svg viewBox="0 0 24 24"><use href="#i-'+name+'"/></svg></span>';}

function extractDomain(url){if(!/^https?:\/\//i.test(url))url='https://'+url;
try{return new URL(url).hostname;}catch(e){return null;}}

var KNOWN_FAVICONS={'mail.google.com':'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png',
'github.com':'https://github.githubassets.com/favicons/favicon-dark.svg',
'youtube.com':'https://www.youtube.com/s/desktop/12d6b690/img/favicon_32x32.png',
'bilibili.com':'https://www.bilibili.com/favicon.ico',
'chat.openai.com':'https://chat.openai.com/favicon.ico',
'chatgpt.com':'https://chatgpt.com/favicon.ico',
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

function t(key){var lang=settings.language||'zh';return (I18N[lang]&&I18N[lang][key])||(I18N.zh[key])||key;}

function translateDOM(){
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
for(var k in DEFAULTS){if(!(k in settings))settings[k]=DEFAULTS[k];}
if(!raw||!raw.language){var bl=(navigator.language||'').split('-')[0];settings.language={'zh':'zh','ja':'ja'}[bl]||'en';saveSettings();}
}
function saveSettings(){try{localStorage.setItem('newtab_settings_v3',JSON.stringify(settings));}catch(e){}}
// Fallback stubs — vip.js provides real implementations when bundled
if(typeof bindVipEvents==='undefined')function bindVipEvents(){}
if(typeof initAds==='undefined')function initAds(){}
if(typeof toggleAds==='undefined')function toggleAds(){}

function applyTheme(){
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
var scene=document.getElementById('landscapeScene');
lDebugMode=false;lDebugHour=undefined;lDebugWeather=undefined;
if(scene){var showScene=isLandscape&&settings.showBgImage&&!settings.bgImage;if(showScene){scene.style.display='';if(scene._teHide){scene.removeEventListener('transitionend',scene._teHide);scene._teHide=null;}requestAnimationFrame(function(){scene.classList.add('on');applyLandscapeScene();});}else{scene.classList.remove('on');if(scene._teHide)scene.removeEventListener('transitionend',scene._teHide);scene._teHide=function(){scene.style.display='none';scene.removeEventListener('transitionend',scene._teHide);scene._teHide=null;};scene.addEventListener('transitionend',scene._teHide);}}
var builtinBg=settings.showBgImage&&!settings.bgImage;
if(builtinBg&&!isLandscape){bgBase.classList.add('has-image');bgBase.classList.remove('custom-bg');bgBase.style.backgroundImage='';
var bgDark=document.querySelector('.bg-img-dark');if(bgDark){bgDark.src=activeTheme.bgDark;bgDark.className='bg-img bg-img-dark'+(activeTheme.id==='landscape'?' bg-img-landscape':'');}
var bgLight=document.querySelector('.bg-img-light');if(bgLight){bgLight.src=activeTheme.bgLight;bgLight.className='bg-img bg-img-light'+(activeTheme.id==='landscape'?' bg-img-landscape':'');}
}else if(builtinBg&&isLandscape){bgBase.classList.remove('has-image','custom-bg');bgBase.style.backgroundImage='';
}else if(settings.showBgImage&&settings.bgImage){bgBase.classList.add('has-image','custom-bg');bgBase.style.backgroundImage='url('+settings.bgImage+')';}
else{bgBase.classList.remove('has-image','custom-bg');bgBase.style.backgroundImage='';}
updateLandscapeFilter();
applyLandscapeScene();
var builtinLight=!settings.bgImage&&settings.showBgImage&&document.documentElement.getAttribute('data-theme')==='light';
document.body.classList.toggle('builtin-bg-light',builtinLight);
toggleAds();
updateEngineDisplay();
renderTodoList();
updateWidgetVisibility();
updateSettingsUI();
translateDOM();
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
var l=document.getElementById('linksContainer');if(l)l.style.display=settings.showLinks?'':'none';
var g=document.getElementById('widgetsGrid');if(g){
var anyVis=settings.showWeather||settings.showTodo||settings.showQuote;
g.style.display=anyVis?'':'none';
var visibleWidgets=[];
if(settings.showWeather)visibleWidgets.push(1);
if(settings.showQuote)visibleWidgets.push(1);
if(visibleWidgets.length===1)g.classList.add('single-col');
else g.classList.remove('single-col');
}
}

function renderQuickLinks(){
var container=document.getElementById('linksContainer');if(!container)return;
var html='';
settings.links.forEach(function(link,idx){
html+='<div class="link-card" draggable="true" data-idx="'+idx+'" data-url="'+escapeAttr(link.url)+'">'+
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
var draggedIdx=null,wasDragged=false;
container.querySelectorAll('.link-card[draggable]').forEach(function(card){
card.addEventListener('click',function(e){if(wasDragged){wasDragged=false;return;}
var url=card.dataset.url;if(url)window.open(url,'_blank','noopener');});
card.addEventListener('dragstart',function(e){draggedIdx=parseInt(card.dataset.idx);wasDragged=false;
card.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedIdx);});
card.addEventListener('dragend',function(){card.classList.remove('dragging');wasDragged=true;});
card.addEventListener('dragover',function(e){e.preventDefault();e.dataTransfer.dropEffect='move';card.classList.add('drag-over');});
card.addEventListener('dragleave',function(){card.classList.remove('drag-over');});
card.addEventListener('drop',function(e){e.preventDefault();card.classList.remove('drag-over');
var targetIdx=parseInt(card.dataset.idx);
if(draggedIdx!==null&&draggedIdx!==targetIdx){var item=settings.links.splice(draggedIdx,1)[0];
settings.links.splice(targetIdx,0,item);saveSettings();renderQuickLinks();renderLinkEditList();}
draggedIdx=null;wasDragged=true;});
});
}

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

function openLinkModal(idx){linkEditIdx=(idx!==undefined)?idx:null;
var link=linkEditIdx!==null?settings.links[linkEditIdx]:null;
translateDOM();
var lmt=document.getElementById('linkModalTitle');if(lmt)lmt.textContent=t(linkEditIdx!==null?'editLink':'addLinkTitle');
var lni=document.getElementById('linkNameInput');if(lni)lni.value=link?link.name:'';
var lui=document.getElementById('linkUrlInput');if(lui)lui.value=link?link.url:'';
renderIconPicker(link?link.icon:null,link?link.url:'',link?link.useFavicon:undefined);
var lmo=document.getElementById('linkModalOverlay');if(lmo)lmo.classList.add('open');}

function closeLinkModal(){var lmo=document.getElementById('linkModalOverlay');if(lmo)lmo.classList.remove('open');linkEditIdx=null;}

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
if(linkEditIdx!==null){settings.links[linkEditIdx]=linkData;}
else{settings.links.push(linkData);}
saveSettings();renderQuickLinks();renderLinkEditList();closeLinkModal();}

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
settings=JSON.parse(JSON.stringify(DEFAULTS));delete settings._showBgAuto;delete settings.bgThemeSaved;delete settings._savedPreset;delete settings._savedAccent;saveSettings();renderQuickLinks();applyAll();updateClock();
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
loadSettings();bindVipEvents();initAds();applyAll();renderQuickLinks();
updateClock();scheduleClock();
showQuote();
var qc=document.getElementById('quoteWidget');if(qc){qc.addEventListener('mousedown',function(e){if(e.detail>1){e.preventDefault();window.getSelection().removeAllRanges();}qc._ts=Date.now();});qc.addEventListener('mouseup',function(){if(qc._ts&&Date.now()-qc._ts<300&&!window.getSelection().toString().trim())refreshQuote();});}
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
renderLinkEditList();updateSettingsUI();translateDOM();});
var sc=document.getElementById('settingsClose');if(sc)sc.addEventListener('click',closeSettings);
var so2=document.getElementById('settingsOverlay');if(so2)so2.addEventListener('click',closeSettings);
document.querySelectorAll('.settings-tab').forEach(function(tab){tab.addEventListener('click',function(){
document.querySelectorAll('.settings-tab').forEach(function(t){t.classList.remove('active');});
document.querySelectorAll('.settings-section').forEach(function(s){s.classList.remove('active');});
tab.classList.add('active');var sec=document.getElementById('sec-'+tab.dataset.tab);if(sec)sec.classList.add('active');
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
document.addEventListener('DOMContentLoaded',init);
})();

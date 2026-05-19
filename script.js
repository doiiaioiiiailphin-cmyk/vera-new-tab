(function(){

var I18N={
zh:{theme:'主题',language:'语言',settings:'设置',searchPlaceholder:'搜索网页... (Ctrl+K 快速聚焦)',
weather:'天气',quote:'每日一言',todo:'待办事项',todoPlaceholder:'添加新任务...',
settingsTitle:'自定义设置',tabAppearance:'外观',tabWidgets:'组件',tabLinks:'链接',tabAbout:'关于',
themeLabel:'主题模式',themeAuto:'跟随系统',themeDark:'深色',themeLight:'浅色',
languageLabel:'界面语言',glassOpacity:'玻璃透明度',blurStrength:'模糊强度',borderRadius:'圆角大小',
accentColor:'强调色',bgPreset:'背景预设',dynamicBg:'动态背景',showBgImage:'显示背景图片',customBg:'自定义背景图URL',
bgPlaceholder:'输入图片URL (留空使用默认)',
showWeather:'天气组件',showTodo:'待办组件',showQuote:'名言组件',showLinks:'快捷链接',
addLink:'+ 添加链接',linkName:'名称',linkUrl:'网址 (https://...)',save:'保存',cancel:'取消',
resetSettings:'恢复默认设置',
aboutText:'Vera · 冰晶玻璃新标签页<br>液态玻璃设计风格<br>支持深色/浅色模式切换<br>多语言界面支持<br>所有设置自动保存在本地浏览器',
add:'添加',editLink:'编辑链接',addLinkTitle:'添加链接',
refresh:'刷新',clear:'清空',loadingWeather:'正在获取天气...',locationDenied:'请允许位置权限',
weatherFailed:'获取天气失败',locationUnavailable:'位置不可用',
windSpeed:'风速',currentWeather:'当前',
presetIce:'冰晶蓝',presetAurora:'极光紫',presetOcean:'深海蓝',presetForest:'森林绿',presetSunset:'日落橙',
noTasks:'暂无任务',confirmReset:'确认恢复默认设置？所有自定义将丢失。',
faviconText:'从网站获取',faviconTitle:'自动获取网站图标',faviconFail:'获取失败',tapRetry:'点击重试'},
en:{theme:'Theme',language:'Language',settings:'Settings',searchPlaceholder:'Search the web... (Ctrl+K to focus)',
weather:'Weather',quote:'Daily Quote',todo:'To-Do',todoPlaceholder:'Add a new task...',
settingsTitle:'Customization',tabAppearance:'Appearance',tabWidgets:'Widgets',tabLinks:'Links',tabAbout:'About',
themeLabel:'Theme Mode',themeAuto:'Auto',themeDark:'Dark',themeLight:'Light',
languageLabel:'Language',glassOpacity:'Glass Opacity',blurStrength:'Blur Strength',borderRadius:'Border Radius',
accentColor:'Accent Color',bgPreset:'Background Preset',dynamicBg:'Dynamic Background',showBgImage:'Show Background Image',customBg:'Custom Background URL',
bgPlaceholder:'Enter image URL (leave empty for default)',
showWeather:'Weather Widget',showTodo:'To-Do Widget',showQuote:'Quote Widget',showLinks:'Quick Links',
addLink:'+ Add Link',linkName:'Name',linkUrl:'URL (https://...)',save:'Save',cancel:'Cancel',
resetSettings:'Reset to Defaults',
aboutText:'Vera · Ice Crystal New Tab<br>Liquid Glass Design<br>Dark/Light theme support<br>Multi-language interface<br>All settings saved locally',
add:'Add',editLink:'Edit Link',addLinkTitle:'Add Link',
refresh:'Refresh',clear:'Clear',loadingWeather:'Fetching weather...',locationDenied:'Location permission denied',
weatherFailed:'Weather fetch failed',locationUnavailable:'Location unavailable',
windSpeed:'Wind Speed',currentWeather:'Currently',
presetIce:'Ice Blue',presetAurora:'Aurora',presetOcean:'Ocean',presetForest:'Forest',presetSunset:'Sunset',
noTasks:'No tasks',confirmReset:'Reset all settings? This cannot be undone.',
faviconText:'From Website',faviconTitle:'Auto-detect favicon',faviconFail:'Failed',tapRetry:'Tap to retry'},
ja:{theme:'テーマ',language:'言語',settings:'設定',searchPlaceholder:'ウェブ検索... (Ctrl+K)',
weather:'天気',quote:'今日の名言',todo:'ToDo',todoPlaceholder:'新しいタスクを追加...',
settingsTitle:'カスタマイズ',tabAppearance:'外観',tabWidgets:'ウィジェット',tabLinks:'リンク',tabAbout:'情報',
themeLabel:'テーマモード',themeAuto:'自動',themeDark:'ダーク',themeLight:'ライト',
languageLabel:'言語',glassOpacity:'透明度',blurStrength:'ぼかし強度',borderRadius:'角丸サイズ',
accentColor:'アクセントカラー',bgPreset:'背景プリセット',dynamicBg:'動的背景',showBgImage:'背景画像を表示',customBg:'カスタム背景URL',
bgPlaceholder:'画像URLを入力 (空欄でデフォルト)',
showWeather:'天気ウィジェット',showTodo:'ToDoウィジェット',showQuote:'名言ウィジェット',showLinks:'クイックリンク',
addLink:'+ リンク追加',linkName:'名前',linkUrl:'URL (https://...)',save:'保存',cancel:'キャンセル',
resetSettings:'デフォルトに戻す',
aboutText:'Vera · アイスクリスタル新規タブ<br>リキッドグラスデザイン<br>ダーク/ライトテーマ対応<br>多言語インターフェース<br>設定はローカルに保存',
add:'追加',editLink:'リンク編集',addLinkTitle:'リンク追加',
refresh:'更新',clear:'クリア',loadingWeather:'天気取得中...',locationDenied:'位置情報が許可されていません',
weatherFailed:'天気の取得に失敗',locationUnavailable:'位置情報が利用できません',
windSpeed:'風速',currentWeather:'現在',
presetIce:'アイスブルー',presetAurora:'オーロラ',presetOcean:'オーシャン',presetForest:'フォレスト',presetSunset:'サンセット',
noTasks:'タスクなし',confirmReset:'すべての設定をリセットしますか？',
faviconText:'サイトから取得',faviconTitle:'Faviconを自動取得',faviconFail:'失敗',tapRetry:'タップして再試行'}
};

var PICKER_ICONS=['web','mail','code','play','chat','x','star','heart','home','book','music','camera','phone','bulb','palette','chart','dollar','zap','fire','gamepad'];

var DEFAULTS={glassOpacity:6,blur:32,radius:24,accent:'#5eead4',bgPreset:'ice',bgImage:'',bgImageDark:'assets/bg-dark.png',bgImageLight:'assets/bg-light.png',showBgImage:false,checkUpdate:true,
showWeather:true,showTodo:true,showQuote:true,showLinks:true,dynamicBg:true,
searchEngine:'google',theme:'auto',language:'zh',
links:[{icon:'mail',name:'Gmail',url:'https://mail.google.com'},
{icon:'code',name:'GitHub',url:'https://github.com'},
{icon:'play',name:'YouTube',url:'https://youtube.com'},
{icon:'web',name:'Bilibili',url:'https://bilibili.com'},
{icon:'chat',name:'ChatGPT',url:'https://chat.openai.com'}],
todos:[]};

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

var QUOTES={zh:[
{text:'生活不止眼前的苟且，还有诗和远方。',author:'高晓松'},
{text:'世界以痛吻我，要我报之以歌。',author:'泰戈尔'},
{text:'人生如逆旅，我亦是行人。',author:'苏轼'},
{text:'但凡不能杀死你的，最终都会使你更强大。',author:'尼采'},
{text:'黑夜无论怎样悠长，白昼总会到来。',author:'莎士比亚'},
{text:'宝剑锋从磨砺出，梅花香自苦寒来。',author:'佚名'},
{text:'千里之行，始于足下。',author:'老子'},
{text:'你所浪费的今天，是昨天死去的人奢望的明天。',author:'哈佛校训'},
{text:'路漫漫其修远兮，吾将上下而求索。',author:'屈原'},
{text:'既然选择了远方，便只顾风雨兼程。',author:'汪国真'},
{text:'不经一番寒彻骨，怎得梅花扑鼻香。',author:'黄檗禅师'},
{text:'天行健，君子以自强不息。',author:'《周易》'},
{text:'知之为知之，不知为不知，是知也。',author:'孔子'},
{text:'学而不思则罔，思而不学则殆。',author:'孔子'},
{text:'知之者不如好之者，好之者不如乐之者。',author:'孔子'}
],en:[
{text:'The only way to do great work is to love what you do.',author:'Steve Jobs'},
{text:'Stay hungry, stay foolish.',author:'Steve Jobs'},
{text:'The best time to plant a tree was 20 years ago. The second best time is now.',author:'Chinese Proverb'},
{text:'It does not matter how slowly you go as long as you do not stop.',author:'Confucius'},
{text:'In the middle of difficulty lies opportunity.',author:'Albert Einstein'},
{text:'Imagination is more important than knowledge.',author:'Albert Einstein'},
{text:'Be the change that you wish to see in the world.',author:'Mahatma Gandhi'},
{text:'Life is what happens when you\'re busy making other plans.',author:'John Lennon'},
{text:'The purpose of our lives is to be happy.',author:'Dalai Lama'},
{text:'Get busy living or get busy dying.',author:'Stephen King'},
{text:'You miss 100% of the shots you don\'t take.',author:'Wayne Gretzky'},
{text:'Whether you think you can or you think you can\'t, you\'re right.',author:'Henry Ford'},
{text:'The future belongs to those who believe in the beauty of their dreams.',author:'Eleanor Roosevelt'},
{text:'Do what you can, with what you have, where you are.',author:'Theodore Roosevelt'},
{text:'Everything you\'ve ever wanted is on the other side of fear.',author:'George Addair'}
],ja:[
{text:'千里の道も一歩から。',author:'老子'},
{text:'為せば成る、為さねば成らぬ何事も。',author:'上杉鷹山'},
{text:'石の上にも三年。',author:'日本のことわざ'},
{text:'七転び八起き。',author:'日本のことわざ'},
{text:'一期一会。',author:'千利休'},
{text:'継続は力なり。',author:'日本のことわざ'},
{text:'明日は明日の風が吹く。',author:'日本のことわざ'},
{text:'案ずるより産むが易し。',author:'日本のことわざ'},
{text:'塵も積もれば山となる。',author:'日本のことわざ'},
{text:'急がば回れ。',author:'日本のことわざ'},
{text:'花鳥風月。',author:'日本の美意識'},
{text:'初心忘るべからず。',author:'世阿弥'},
{text:'日々是新。',author:'禅語'},
{text:'諸行無常。',author:'仏教'},
{text:'温故知新。',author:'孔子'}
]};

var WMO_ICONS={0:'w-clear',1:'w-clear',2:'cloud-sun',3:'w-cloudy',45:'w-fog',48:'w-fog',51:'w-rain',53:'w-rain',55:'w-rain',56:'w-rain',57:'w-rain',61:'w-rain',63:'w-rain',65:'w-rain',66:'w-rain',67:'w-rain',71:'w-snow',73:'w-snow',75:'w-snow',77:'w-snow',80:'w-rain',81:'w-rain',82:'w-rain',85:'w-snow',86:'w-snow',95:'w-storm',96:'w-storm',99:'w-storm'};
var WMO_DESC_ZH={0:'晴',1:'晴',2:'多云间晴',3:'阴',45:'雾',48:'霜雾',51:'毛毛雨',53:'毛毛雨',55:'毛毛雨',56:'冻毛毛雨',57:'冻毛毛雨',61:'小雨',63:'中雨',65:'大雨',66:'冻雨',67:'冻雨',71:'小雪',73:'中雪',75:'大雪',77:'雪粒',80:'阵雨',81:'阵雨',82:'大阵雨',85:'阵雪',86:'阵雪',95:'雷暴',96:'冰雹雷暴',99:'强雷暴'};
var WMO_DESC_EN={0:'Clear',1:'Clear',2:'Partly Cloudy',3:'Cloudy',45:'Fog',48:'Frost Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',56:'Freezing Drizzle',57:'Freezing Drizzle',61:'Light Rain',63:'Rain',65:'Heavy Rain',66:'Freezing Rain',67:'Freezing Rain',71:'Light Snow',73:'Snow',75:'Heavy Snow',77:'Snow Grains',80:'Showers',81:'Showers',82:'Heavy Showers',85:'Snow Showers',86:'Snow Showers',95:'Thunderstorm',96:'Hail Thunderstorm',99:'Severe Thunderstorm'};
var WMO_DESC_JA={0:'晴れ',1:'晴れ',2:'晴れ時々曇り',3:'曇り',45:'霧',48:'霜霧',51:'霧雨',53:'霧雨',55:'霧雨',56:'凍結霧雨',57:'凍結霧雨',61:'小雨',63:'雨',65:'大雨',66:'凍結雨',67:'凍結雨',71:'小雪',73:'雪',75:'大雪',77:'雪粒',80:'にわか雨',81:'にわか雨',82:'強いにわか雨',85:'にわか雪',86:'にわか雪',95:'雷雨',96:'雹雷雨',99:'激しい雷雨'};

// wttr.in codes → internal icon keys
var WW_ICON={113:'w-clear',116:'cloud-sun',119:'w-cloudy',122:'w-cloudy',143:'w-rain',176:'w-rain',179:'w-snow',182:'w-snow',185:'w-snow',200:'w-storm',227:'w-storm',230:'w-storm',248:'w-fog',260:'w-fog',263:'w-rain',266:'w-rain',293:'w-rain',296:'w-rain',299:'w-rain',302:'w-rain',305:'w-rain',308:'w-rain',311:'w-snow',314:'w-snow',317:'w-snow',320:'w-snow',323:'w-snow',326:'w-snow',329:'w-snow',332:'w-snow',335:'w-snow',338:'w-snow',350:'w-snow',353:'w-snow',356:'w-snow',359:'w-snow',362:'w-snow',365:'w-snow',368:'w-snow',371:'w-snow',374:'w-snow',377:'w-snow',386:'w-storm',389:'w-storm',392:'w-storm',395:'w-storm'};
var WW_DESC_ZH={113:'晴',116:'多云间晴',119:'多云',122:'阴',143:'雾',176:'阵雨',179:'阵雪',182:'雨夹雪',185:'冻雨',200:'雷阵雨',227:'暴风雪',230:'暴风雪',248:'雾',260:'雾',263:'毛毛雨',266:'小雨',293:'小雨',296:'小雨',299:'中雨',302:'中雨',305:'大雨',308:'大雨',311:'冻雨',314:'小雪',317:'中雪',320:'中雪',323:'小雪',326:'小雪',329:'中雪',332:'中雪',335:'大雪',338:'大雪',350:'冰雹',353:'小冰雹',356:'中冰雹',359:'大冰雹',362:'小冰雹',365:'中冰雹',368:'小冰雹',371:'中雪',374:'小冰雹',377:'中冰雹',386:'雷暴',389:'雷暴',392:'雷暴',395:'大冰雹'};
var WW_DESC_JA={113:'晴れ',116:'晴れ時々曇り',119:'曇り',122:'曇り',143:'霧',176:'にわか雨',179:'にわか雪',182:'みぞれ',185:'凍雨',200:'雷雨',227:'吹雪',230:'吹雪',248:'霧',260:'霧',263:'霧雨',266:'小雨',293:'小雨',296:'小雨',299:'雨',302:'雨',305:'大雨',308:'大雨',311:'凍雨',314:'小雪',317:'雪',320:'雪',323:'小雪',326:'小雪',329:'雪',332:'雪',335:'大雪',338:'大雪',350:'雹',353:'小雹',356:'雹',359:'大雹',362:'小雹',365:'雹',368:'小雹',371:'雪',374:'小雹',377:'雹',386:'雷雨',389:'雷雨',392:'雷雨',395:'大雹'};

function wwDesc(code,lang){var m={zh:WW_DESC_ZH,en:{},ja:WW_DESC_JA};return (m[lang]||{})[code]||'Unknown';}

var settings={},linkEditIdx=null;

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

function getFaviconUrl(url){var domain=extractDomain(url);if(!domain)return'';
if(domain==='localhost'||/^\d+\.\d+\.\d+\.\d+$/.test(domain))return'';
return KNOWN_FAVICONS[domain]||('https://www.google.com/s2/favicons?domain='+domain+'&sz=64');}

function linkFaviconHtml(link){var useFav=link.useFavicon!==false;if(!useFav)return'';
var domain=extractDomain(link.url);if(!domain)return'';
var favurl=KNOWN_FAVICONS[domain]||('https://www.google.com/s2/favicons?domain='+domain+'&sz=64');
return'<img class="link-favicon" src="'+escapeAttr(favurl)+'" alt="">';}

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
img.src=src;img.style.cssText='width:'+size+'px;height:'+size+'px;border-radius:3px;display:block;flex-shrink:0';
img.addEventListener('error',function(){var span=document.createElement('span');span.className='icon-svg';span.style.fontSize=size+'px';span.innerHTML='<svg viewBox="0 0 24 24"><use href="#i-web"/></svg>';img.replaceWith(span);});
return img;}

function t(key){var lang=settings.language||'zh';return (I18N[lang]&&I18N[lang][key])||(I18N.zh[key])||key;}

function translateDOM(){
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
document.querySelectorAll('.bg-preset').forEach(function(btn){
btn.textContent=t('preset'+btn.dataset.preset.charAt(0).toUpperCase()+btn.dataset.preset.slice(1));
});
document.querySelectorAll('.radio-option[data-theme-val]').forEach(function(btn){
btn.textContent=t('theme'+btn.dataset.themeVal.charAt(0).toUpperCase()+btn.dataset.themeVal.slice(1));
});
var addLabel=document.querySelector('.add-link-card .add-label');
if(addLabel)addLabel.textContent=t('add');
}

function loadSettings(){
try{var s=JSON.parse(localStorage.getItem('newtab_settings_v3'));settings=s||{};}catch(e){settings={};}
for(var k in DEFAULTS){if(!(k in settings))settings[k]=DEFAULTS[k];}
if(!s||!s.language){var bl=(navigator.language||'').split('-')[0];settings.language={'zh':'zh','ja':'ja'}[bl]||'en';}
}
function saveSettings(){try{localStorage.setItem('newtab_settings_v3',JSON.stringify(settings));}catch(e){}}

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
r.style.setProperty('--accent2',settings.accent);
r.style.setProperty('--accent3',shiftHue(settings.accent,40));
var preset=BG_PRESETS[settings.bgPreset]||BG_PRESETS.ice;
r.style.setProperty('--blob-1',preset.blob1);
r.style.setProperty('--blob-2',preset.blob2);
r.style.setProperty('--blob-3',preset.blob3);
r.style.setProperty('--blob-4',preset.blob4);
document.querySelectorAll('.bg-blob').forEach(function(b){b.classList.toggle('still',!settings.dynamicBg);});
applyTheme();
var bgBase=document.querySelector('.bg-base');
var bgUrl=settings.showBgImage?(settings.bgImage||(document.documentElement.getAttribute('data-theme')==='light'?settings.bgImageLight:settings.bgImageDark)):'';
if(bgUrl){bgBase.classList.add('has-image');bgBase.style.backgroundImage='url('+bgUrl+')';}
else{bgBase.classList.remove('has-image');bgBase.style.backgroundImage='';}
var builtinBg=!settings.bgImage&&settings.showBgImage&&document.documentElement.getAttribute('data-theme')==='light';
document.body.classList.toggle('builtin-bg-light',builtinBg);
updateEngineDisplay();
renderQuickLinks();
renderTodoList();
updateWidgetVisibility();
updateSettingsUI();
translateDOM();
}

function hexToRgba(hex,a){var h=hex.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
var r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);
return'rgba('+r+','+g+','+b+','+a+')';}

function shiftHue(hex,a){var h=hex.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
var r=Math.min(255,parseInt(h.substring(0,2),16)+a);
var g=Math.min(255,parseInt(h.substring(2,4),16)+a);
var b=Math.min(255,parseInt(h.substring(4,6),16)+a);
return'#'+[r,g,b].map(function(c){return('0'+c.toString(16)).slice(-2)}).join('');}

function updateClock(){var n=new Date();var h=n.getHours(),m=n.getMinutes();
document.getElementById('clockTime').textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
var days=settings.language==='en'?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']:
settings.language==='ja'?['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日']:
['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
document.getElementById('clockDate').textContent=
n.getFullYear()+(settings.language==='ja'?'年':settings.language==='en'?'/':'年')+
(settings.language==='en'?'':(n.getMonth()+1)+(settings.language==='ja'?'月':settings.language==='en'?'/':'月'))+
(settings.language==='en'?('/'+(n.getMonth()+1)):'')+
n.getDate()+(settings.language==='ja'?'日':settings.language==='en'?' ':'日 ')+days[n.getDay()];}

function updateEngineDisplay(){
var eng=SEARCH_ENGINES.find(function(e){return e.id===settings.searchEngine})||SEARCH_ENGINES[0];
var favurl=KNOWN_FAVICONS[eng.domain]||('https://www.google.com/s2/favicons?domain='+eng.domain+'&sz=64');
var engIcon=document.getElementById('engineIconSvg');
engIcon.innerHTML='';
engIcon.appendChild(createFaviconImgElement(favurl,18));
document.getElementById('engineName').textContent=eng.name;
renderEngineDropdown();
}

function renderEngineDropdown(){
var dd=document.getElementById('engineDropdown');
dd.innerHTML=SEARCH_ENGINES.map(function(e){var active=e.id===settings.searchEngine?' active':'';
return'<div class="engine-option'+active+'" data-engine="'+e.id+'"><span class="eng-favicon-box"></span> '+e.name+'</div>';}).join('');
dd.querySelectorAll('.engine-option').forEach(function(el){
var eng=SEARCH_ENGINES.find(function(e){return e.id===el.dataset.engine});
if(eng){
var favurl=KNOWN_FAVICONS[eng.domain]||('https://www.google.com/s2/favicons?domain='+eng.domain+'&sz=64');
var box=el.querySelector('.eng-favicon-box');
if(box)box.appendChild(createFaviconImgElement(favurl,16));
}
el.addEventListener('click',function(e){
e.stopPropagation();settings.searchEngine=el.dataset.engine;saveSettings();updateEngineDisplay();dd.classList.remove('open');
document.getElementById('searchEngineBtn').classList.remove('open');
});
});
}

function doSearch(){var q=document.getElementById('searchInput').value.trim();if(!q)return;
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
var container=document.getElementById('linksContainer');
var html='';
settings.links.forEach(function(link,idx){
html+='<div class="link-card" draggable="true" data-idx="'+idx+'" data-url="'+escapeAttr(link.url)+'">'+
'<button class="link-delete" data-del="'+idx+'">&times;</button>'+
'<div class="link-icon">'+linkFaviconHtml(link)+iconSvg(link.icon||'web',22)+'</div>'+
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
var url=card.dataset.url;if(url)window.open(url,'_blank');});
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
return'<div class="link-edit-item"><div class="link-edit-icon">'+icoHtml+'</div>'+
'<div class="info"><div class="name">'+escapeHtml(link.name)+'</div><div class="url">'+escapeHtml(link.url)+'</div></div>'+
'<div class="actions"><button class="btn sm" data-edit="'+idx+'">'+t('editLink')+'</button>'+
'<button class="btn sm danger" data-del="'+idx+'">'+t('cancel')+'</button></div></div>';}).join('');
list.querySelectorAll('.link-edit-item').forEach(function(el,idx){
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
document.getElementById('linkModalTitle').textContent=t(linkEditIdx!==null?'editLink':'addLinkTitle');
document.getElementById('linkNameInput').value=link?link.name:'';
document.getElementById('linkUrlInput').value=link?link.url:'';
renderIconPicker(link?link.icon:null,link?link.url:'',link?link.useFavicon:undefined);
document.getElementById('linkModalOverlay').classList.add('open');}

function closeLinkModal(){document.getElementById('linkModalOverlay').classList.remove('open');linkEditIdx=null;}

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

function saveLinkFromModal(){var name=document.getElementById('linkNameInput').value.trim();
var url=document.getElementById('linkUrlInput').value.trim();if(!name||!url)return;
var sel=document.querySelector('#linkIconPicker .selected');
var icon=sel?sel.dataset.icon:'favicon';
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

function addTodo(){var input=document.getElementById('todoInput');var text=input.value.trim();if(!text)return;
settings.todos.unshift({text:text,done:false});saveSettings();renderTodoList();input.value='';}

var weatherPending=false,weatherLoaded=false;
function fetchWeather(){if(!settings.showWeather||weatherPending)return;
weatherPending=true;
var wc=document.getElementById('weatherContent');
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg('w-cloudy')+'</div><div>'+
'<div class="weather-temp">--&deg;</div><div class="weather-details">'+t('loadingWeather')+'</div></div></div>';
if(!navigator.geolocation){wc.innerHTML='<div class="weather-details">'+t('locationUnavailable')+'</div>';weatherPending=false;return;}
navigator.geolocation.getCurrentPosition(function(pos){
var lat=pos.coords.latitude.toFixed(2);var lon=pos.coords.longitude.toFixed(2);
tryWW(lat,lon,wc);
},function(err){
if(err.code===1){wc.innerHTML='<div class="weather-details" style="cursor:pointer;text-decoration:underline">'+t('locationDenied')+' — '+t('tapRetry')+'</div>';wc.querySelector('.weather-details').addEventListener('click',fetchWeather);}
else{wc.innerHTML='<div class="weather-details">'+t('weatherFailed')+' ('+err.message+')</div>';}
weatherPending=false;},{maximumAge:300000,enableHighAccuracy:false});}

function tryWW(lat,lon,wc){
var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();tryOM(lat,lon,wc);},8000);
fetch('https://wttr.in/'+lat+','+lon+'?format=j1',{signal:ctrl.signal})
.then(function(r){clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
.then(function(d){
var cc=d.current_condition[0];var code=parseInt(cc.weatherCode);
var wi=WW_ICON[code]||'w-cloudy';var temp=Math.round(cc.temp_C);
var descEn=cc.weatherDesc[0].value;
var desc=(settings.language==='zh')?wwDesc(code,'zh'):(settings.language==='ja')?wwDesc(code,'ja'):descEn;
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg(wi)+'</div><div>'+
'<div class="weather-temp">'+temp+'&deg;</div>'+
'<div class="weather-details">'+desc+'</div>'+
'</div></div>';
weatherLoaded=true;weatherPending=false;
}).catch(function(e){clearTimeout(to);if(e.name!=='AbortError')tryOM(lat,lon,wc);});
}

function tryOM(lat,lon,wc){
var ctrl=new AbortController();var to=setTimeout(function(){ctrl.abort();showWFail(wc);},10000);
fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current_weather=true',{signal:ctrl.signal})
.then(function(r){clearTimeout(to);if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
.then(function(data){
var w=data.current_weather;var temp=Math.round(w.temperature);var code=w.weathercode;
var wi=WMO_ICONS[code]||'w-cloudy';
var descMaps={zh:WMO_DESC_ZH,en:WMO_DESC_EN,ja:WMO_DESC_JA};
var desc=descMaps[settings.language]?descMaps[settings.language][code]:WMO_DESC_EN[code]||'';
wc.innerHTML='<div class="weather-main"><div class="weather-icon-svg">'+wIconSvg(wi)+'</div><div>'+
'<div class="weather-temp">'+temp+'&deg;</div>'+
'<div class="weather-details">'+desc+'</div>'+
'<div class="weather-loc">'+t('windSpeed')+': '+w.windspeed+' km/h</div></div></div>';
weatherLoaded=true;weatherPending=false;
}).catch(function(e){clearTimeout(to);showWFail(wc);});
}

function showWFail(wc){wc.innerHTML='<div class="weather-details">'+t('weatherFailed')+'</div>';weatherPending=false;}

function wIconSvg(name){
if(name==='cloud-sun')return'<svg viewBox="0 0 24 24"><defs><mask id="cs-mask"><rect width="24" height="24" fill="white"/><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" fill="black" stroke="black" stroke-width="1.8" stroke-linejoin="round"/></mask></defs><g mask="url(#cs-mask)"><circle cx="18" cy="6" r="3.5" fill="currentColor" opacity="0.15"/><circle cx="18" cy="6" r="3.5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 1V0M18 11v1M13 6h-1M23 6h1M14.5 2.5l-.7-.7M21.5 9.5l.7.7M14.5 9.5l-.7.7M21.5 2.5l.7-.7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></g><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" fill="currentColor" opacity="0.15"/><path d="M 7.5 17 H 16.5 C 19.5 17 21 15.5 21 12.5 C 21 10.5 19.8 8.8 18.2 8.2 C 17.5 5 15 3 12 3 C 9 3 6.5 5 5.8 8.2 C 4.2 8.8 3 10.5 3 12.5 C 3 15.5 4.5 17 7.5 17 Z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
return'<svg viewBox="0 0 24 24"><use href="#i-'+name+'"/></svg>';}

function randomQuote(){var langQuotes=QUOTES[settings.language]||QUOTES.zh;
var q=langQuotes[Math.floor(Math.random()*langQuotes.length)];
var qc=document.getElementById('quoteContent');
if(qc)qc.innerHTML='<div class="quote-text">'+escapeHtml(q.text)+'</div><div class="quote-author">— '+escapeHtml(q.author)+'</div>';}

function updateSettingsUI(){
document.getElementById('setGlassOpacity').value=settings.glassOpacity;
document.getElementById('setBlur').value=settings.blur;
document.getElementById('setRadius').value=settings.radius;
document.getElementById('setAccent').value=settings.accent;
document.getElementById('setBgImage').value=settings.bgImage||'';
document.querySelectorAll('#bgPresetBtns .btn').forEach(function(b){b.classList.toggle('active',b.dataset.preset===settings.bgPreset);});
updateToggle('toggleWeather',settings.showWeather);
updateToggle('toggleTodo',settings.showTodo);
updateToggle('toggleQuote',settings.showQuote);
updateToggle('toggleLinks',settings.showLinks);
updateToggle('toggleDynamicBg',settings.dynamicBg);
updateToggle('toggleShowBgImage',settings.showBgImage);
updateThemeRadio();
}
function updateToggle(id,val){var btn=document.getElementById(id);if(btn)btn.classList.toggle('on',val);}
function escapeHtml(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function escapeAttr(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function cycleTheme(){
var themes=['auto','dark','light'];var idx=themes.indexOf(settings.theme);
settings.theme=themes[(idx+1)%themes.length];saveSettings();applyAll();
}
function cycleLanguage(){
var langs=['zh','en','ja'];var idx=langs.indexOf(settings.language);
settings.language=langs[(idx+1)%langs.length];saveSettings();applyAll();updateClock();randomQuote();
}
function resetSettings(){
if(!confirm(t('confirmReset')))return;
settings=JSON.parse(JSON.stringify(DEFAULTS));saveSettings();applyAll();updateClock();
setTimeout(function(){updateSettingsUI();},100);
}

// Native fetch-based search suggestions for all engines (no JSONP)
function renderSuggest(list){if(!list||!list.length){suggestDropdown.classList.remove('open');return;}
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
loadSettings();applyAll();
updateClock();setInterval(updateClock,10000);
randomQuote();
document.getElementById('searchInput').addEventListener('keydown',function(e){if(e.key==='Enter')doSearch();});
var suggestTimer=null,suggestDropdown=document.getElementById('suggestDropdown');
document.getElementById('searchInput').addEventListener('input',function(){
var q=this.value.trim();clearTimeout(suggestTimer);suggestDropdown.classList.remove('open');
if(q.length<2)return;suggestTimer=setTimeout(function(){fetchSuggest(q);},250);});
document.addEventListener('click',function(e){if(!e.target.closest('#searchInput')&&!e.target.closest('#suggestDropdown')){suggestDropdown.classList.remove('open');}});
document.getElementById('searchBox').addEventListener('click',function(e){
if(e.target.closest('.search-engine')||e.target.closest('.engine-dropdown'))return;
document.getElementById('searchInput').focus();});
var engBtn=document.getElementById('searchEngineBtn');
var engDropdown=document.getElementById('engineDropdown');
function repositionDropdown(){
var rect=engBtn.getBoundingClientRect();
engDropdown.style.top=(rect.bottom+8)+'px';
engDropdown.style.right=(window.innerWidth-rect.right)+'px';
engDropdown.style.left='auto';
}
engBtn.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();
if(engDropdown.classList.contains('open')){engDropdown.classList.remove('open');engBtn.classList.remove('open');}
else{repositionDropdown();engDropdown.classList.add('open');engBtn.classList.add('open');}});
engDropdown.addEventListener('click',function(e){e.stopPropagation();});
window.addEventListener('resize',function(){if(engDropdown.classList.contains('open'))repositionDropdown();});
window.addEventListener('scroll',function(){if(engDropdown.classList.contains('open'))repositionDropdown();});
document.addEventListener('click',function(e){
if(!e.target.closest('#searchEngineBtn')&&!e.target.closest('#engineDropdown')){
engDropdown.classList.remove('open');engBtn.classList.remove('open');}});
document.getElementById('todoInput').addEventListener('keydown',function(e){if(e.key==='Enter')addTodo();});
document.getElementById('themeBtn').addEventListener('click',cycleTheme);
document.getElementById('langBtn').addEventListener('click',cycleLanguage);
document.getElementById('settingsBtn').addEventListener('click',function(){
document.getElementById('settingsOverlay').classList.add('open');
document.getElementById('settingsPanel').classList.add('open');
renderLinkEditList();updateSettingsUI();translateDOM();});
document.getElementById('settingsClose').addEventListener('click',closeSettings);
document.getElementById('settingsOverlay').addEventListener('click',closeSettings);
document.querySelectorAll('.settings-tab').forEach(function(tab){tab.addEventListener('click',function(){
document.querySelectorAll('.settings-tab').forEach(function(t){t.classList.remove('active');});
document.querySelectorAll('.settings-section').forEach(function(s){s.classList.remove('active');});
tab.classList.add('active');document.getElementById('sec-'+tab.dataset.tab).classList.add('active');});});
document.getElementById('setGlassOpacity').addEventListener('input',function(){settings.glassOpacity=parseInt(this.value);saveSettings();applyAll();});
document.getElementById('setBlur').addEventListener('input',function(){settings.blur=parseInt(this.value);saveSettings();applyAll();});
document.getElementById('setRadius').addEventListener('input',function(){settings.radius=parseInt(this.value);saveSettings();applyAll();});
document.getElementById('setAccent').addEventListener('input',function(){settings.accent=this.value;saveSettings();applyAll();});
document.querySelectorAll('#bgPresetBtns .btn').forEach(function(btn){btn.addEventListener('click',function(){
settings.bgPreset=btn.dataset.preset;saveSettings();applyAll();});});
var bgInput=document.getElementById('setBgImage');bgInput.addEventListener('blur',function(){settings.bgImage=this.value.trim();saveSettings();applyAll();});bgInput.addEventListener('keydown',function(e){if(e.key==='Enter'){this.blur();}});
document.getElementById('toggleWeather').addEventListener('click',function(){settings.showWeather=!settings.showWeather;saveSettings();applyAll();if(settings.showWeather)fetchWeather();});
document.getElementById('toggleTodo').addEventListener('click',function(){settings.showTodo=!settings.showTodo;saveSettings();applyAll();});
document.getElementById('toggleQuote').addEventListener('click',function(){settings.showQuote=!settings.showQuote;saveSettings();applyAll();});
document.getElementById('toggleLinks').addEventListener('click',function(){settings.showLinks=!settings.showLinks;saveSettings();applyAll();});
document.getElementById('toggleDynamicBg').addEventListener('click',function(){settings.dynamicBg=!settings.dynamicBg;saveSettings();applyAll();});
document.getElementById('toggleShowBgImage').addEventListener('click',function(){settings.showBgImage=!settings.showBgImage;saveSettings();applyAll();});
document.querySelectorAll('#themeRadio .radio-option').forEach(function(btn){btn.addEventListener('click',function(){
settings.theme=btn.dataset.themeVal;saveSettings();applyAll();});});
document.querySelectorAll('#langRadio .radio-option').forEach(function(btn){btn.addEventListener('click',function(){
settings.language=btn.dataset.langVal;saveSettings();applyAll();updateClock();randomQuote();});});
document.getElementById('addLinkBtn').addEventListener('click',function(){openLinkModal();});
document.getElementById('linkModalCancel').addEventListener('click',closeLinkModal);
document.getElementById('linkModalOverlay').addEventListener('click',function(e){if(e.target===this)closeLinkModal();});
document.getElementById('linkModalSave').addEventListener('click',saveLinkFromModal);
document.getElementById('resetBtn').addEventListener('click',resetSettings);
document.getElementById('linkNameInput').addEventListener('keydown',function(e){if(e.key==='Enter'){document.getElementById('linkUrlInput').focus();e.preventDefault();}});
document.getElementById('linkUrlInput').addEventListener('keydown',function(e){if(e.key==='Enter'){saveLinkFromModal();}});
document.getElementById('linkUrlInput').addEventListener('input',function(){
var url=this.value.trim();updateFaviconBtn(url);});
document.addEventListener('keydown',function(e){
if(e.key==='Escape'){closeSettings();suggestDropdown.classList.remove('open');}
if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();document.getElementById('searchInput').focus();}});
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
function closeSettings(){document.getElementById('settingsOverlay').classList.remove('open');document.getElementById('settingsPanel').classList.remove('open');}
function checkUpdate(){if(!settings.checkUpdate)return;
fetch('https://api.github.com/repos/doiiaioiiiailphin-cmyk/vera-new-tab/releases/latest')
.then(function(r){return r.json();}).then(function(d){
var latest=d.tag_name?d.tag_name.replace(/^v/,''):'';if(!latest||!d.assets||!d.assets[0])return;
var cur=(chrome.runtime&&chrome.runtime.getManifest)?chrome.runtime.getManifest().version:'1.0.0';
if(compareVersion(latest,cur)>0){showUpdateBadge(d.tag_name,d.assets[0].browser_download_url);}
}).catch(function(){});
}
function compareVersion(a,b){var ap=a.split('.'),bp=b.split('.');
for(var i=0;i<Math.max(ap.length,bp.length);i++){var an=parseInt(ap[i])||0,bn=parseInt(bp[i])||0;if(an>bn)return 1;if(an<bn)return -1;}return 0;}
function showUpdateBadge(tag,url){
var btn=document.getElementById('settingsBtn');
var badge=document.createElement('span');
badge.style.cssText='position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:var(--accent);border-radius:50%;box-shadow:0 0 8px var(--accent-glow);z-index:2';
badge.title='新版本 '+tag+' 可用';
btn.appendChild(badge);
var bar=document.createElement('div');
bar.className='update-bar';
bar.innerHTML='<span>Vera '+tag+' 可用</span><button class="btn sm accent" id="updateNow">更新</button><button class="btn sm" id="updateDismiss">&times;</button>';
document.body.appendChild(bar);
setTimeout(function(){bar.classList.add('show');},500);
document.getElementById('updateNow').addEventListener('click',function(){
bar.innerHTML='<span>正在下载...</span>';
var dlUrl=url.replace('/tag/','/download/')+'/vera-v'+tag.replace('v','')+'.zip';
window.open(dlUrl,'_blank');bar.remove();
});
document.getElementById('updateDismiss').addEventListener('click',function(){bar.remove();});
}
document.addEventListener('DOMContentLoaded',init);
})();

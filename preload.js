(function(){try{
var s=JSON.parse(localStorage.getItem('newtab_settings_v3'));var theme=(s&&s.theme)||'auto';
if(theme==='auto'){theme=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';}
document.documentElement.setAttribute('data-theme',theme);
}catch(e){}})();

"""One-time reversible extraction of the mini-game module; retain source bytes."""
from pathlib import Path
import hashlib
import json
import re

root=Path(__file__).resolve().parents[1]
module=root/'modules/minigames'
module.mkdir(parents=True,exist_ok=True)
original={}
for name in ['game.js','assets/game-cover-snake.webp','assets/game-cover-cube.webp']:
    source=root/name
    target=module/name
    target.parent.mkdir(parents=True,exist_ok=True)
    assert source.exists() and not target.exists()
    original[name]=hashlib.sha256(source.read_bytes()).hexdigest()
    source.rename(target)
    assert hashlib.sha256(target.read_bytes()).hexdigest()==original[name]
html=(root/'index.html').read_text(encoding='utf-8')
start=html.index('<div class="widget game-widget"')
end=html.index('</div>',html.index('<div id="gameScore"',start))+len('</div>')
end=html.index('</div>',end)+len('</div>')
(module/'widget.html').write_text(html[start:end]+'\n',encoding='utf-8')
html=html[:start]+html[end:]
row=re.search(r'<div class="settings-row"><label data-i18n="showGame">.*?</div>',html).group()
(module/'settings.html').write_text(row+'\n',encoding='utf-8')
html=html.replace(row,'').replace('<script src="game.js"></script>','<!-- Mini-games archived in modules/minigames; intentionally not loaded. -->')
(root/'index.html').write_text(html,encoding='utf-8')
script=(root/'script.js').read_text(encoding='utf-8')
# Preserve the exact pre-extraction integration source as a restoration reference.
(module/'script-integration.js.reference').write_text(script,encoding='utf-8')
script=script.replace("var _initGame = typeof initGame !== 'undefined' ? initGame : function(){};",'')
script=script.replace("if(window.VeraGame)window.VeraGame.setActive(!!settings.showGame);",'')
script=script.replace(",['gameWidget','showGame']",'').replace(",'showGame']",']')
script=script.replace(",settings.showGame",'').replace(',#gameWidget','')
script=script.replace("updateToggle('toggleGame',settings.showGame);",'')
script=script.replace("var tg=document.getElementById('toggleGame');if(tg)tg.addEventListener('click',function(){settings.showGame=!settings.showGame;saveSettings();applyAll();});",'')
script=re.sub(r",\n\{id:'game',type:'widget'.*?\}\n",'\n',script)
script=script.replace("if(d.id==='game')return{x:1,y:3};",'')
start=script.index("if(d.id==='game'){",script.index('function freeWidgetDefs'))
end=script.index('\n}',start)+2
script=script[:start]+script[end:]
(root/'script.js').write_text(script,encoding='utf-8')
css=[]
for path in (root/'styles').glob('*.css'):
    lines=path.read_text(encoding='utf-8').splitlines(keepends=True)
    kept=[]
    for line in lines:
        selector=line.split('{')[0]
        if 'game' in selector and ',' not in selector and '{' in line and '}' in line:
            css.append('/* '+path.name+' */\n'+line)
        else:kept.append(line)
    path.write_text(''.join(kept),encoding='utf-8')
(module/'game.css').write_text(''.join(css),encoding='utf-8')
(module/'archive.json').write_text(json.dumps({'enabled':False,'includedInRelease':False,'originalSha256':original},indent=2)+'\n',encoding='utf-8')
p=root/'scripts/package.py'
p.write_text(p.read_text(encoding='utf-8').replace("'script.js', 'game.js',", "'script.js',"),encoding='utf-8')

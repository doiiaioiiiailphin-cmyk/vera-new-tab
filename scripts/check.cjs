const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const acorn=require('acorn');
const cssom=require('rrweb-cssom');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const manifest=JSON.parse(read('manifest.json'));
assert.equal(JSON.parse(read('package.json')).version,manifest.version,'package version must match manifest');
assert.equal(JSON.parse(read('package-lock.json')).version,manifest.version,'lockfile version must match manifest');
assert.equal(manifest.chrome_url_overrides.newtab,'index.html');
assert.match(manifest.content_security_policy.extension_pages,/font-src 'self'/,'bundled pixel fonts must be allowed');
const html=read('index.html');
const dom=new JSDOM(html),doc=dom.window.document;
const ids=new Set();
for(const el of doc.querySelectorAll('[id]')){assert.ok(!ids.has(el.id),'duplicate id: '+el.id);ids.add(el.id);}
let scripts=0,styles=0,resources=0;
const seen=new Set();
function checkLocal(relative,parent){
  if(!relative||/^(?:https?:|data:|#|app:)/.test(relative))return;
  const file=path.resolve(path.dirname(path.join(root,parent)),relative.split('?')[0].split('#')[0]);
  assert.ok(file.startsWith(root+path.sep),'resource escapes project: '+relative);
  assert.ok(fs.existsSync(file),'missing resource: '+file);resources++;
  if(file.endsWith('.css')&&!seen.has(file)){seen.add(file);const css=fs.readFileSync(file,'utf8');cssom.parse(css);styles++;for(const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/g))checkLocal(match[1]||match[2]||match[3],path.relative(root,file));}
}
for(const el of doc.querySelectorAll('script[src]')){const file=el.getAttribute('src');checkLocal(file,'index.html');acorn.parse(read(file),{ecmaVersion:'latest',sourceType:'script'});scripts++;}
assert.equal(doc.querySelectorAll('script:not([src])').length,0,'MV3 cannot execute inline scripts');
for(const el of doc.querySelectorAll('link[href],img[src]'))checkLocal(el.getAttribute('href')||el.getAttribute('src'),'index.html');
assert.equal(doc.querySelectorAll('main').length,1);
assert.ok(!doc.querySelector('main .desk-note'),'desktop main closing tag must precede footer');
for(const dir of fs.readdirSync(path.join(root,'_locales'))){const messages=JSON.parse(read('_locales/'+dir+'/messages.json'));assert.ok(messages.extensionName.message);assert.ok(messages.extensionDescription.message.length<=132);}
dom.window.close();
console.log(`Checked ${scripts} scripts, ${styles} stylesheets, ${resources} local resource references, markup, locales and manifest.`);

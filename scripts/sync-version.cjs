const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8')).version;
for(const file of ['package.json','package-lock.json']){
  const filename=path.join(root,file),data=JSON.parse(fs.readFileSync(filename,'utf8'));
  data.version=version;
  if(data.packages&&data.packages[''])data.packages[''].version=version;
  fs.writeFileSync(filename,JSON.stringify(data,null,2)+'\n');
}
console.log('Version synchronized from manifest.json: '+version);

import {readFile,access} from 'node:fs/promises';
for(const page of ['index.html','system.html']){
 const html=await readFile(page,'utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 if(new Set(ids).size!==ids.length) throw Error(`Duplicate IDs in ${page}`);
 for(const [,url] of html.matchAll(/(?:href|src)="([^\"]+)"/g)){
  if(/^(https?:|mailto:)/.test(url))continue;
  const [path,fragment]=url.split('#');
  if(path) await access(path);
  if(fragment){const target=path?await readFile(path,'utf8'):html;if(!target.includes(`id="${fragment}"`))throw Error(`Broken fragment ${url}`);}
 }
 console.log(`${page}: local links, assets and IDs pass`);
}

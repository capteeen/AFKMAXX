import {mkdir,cp,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for (const file of ['index.html','system.html','desktop.html','mobile.html','app.html','product.js','styles.css','app.js','DESIGN-SYSTEM.md']) await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
await cp('extension','dist/extension',{recursive:true});
console.log('Built static site in dist/');

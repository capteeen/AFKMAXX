import { mkdir, copyFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'extension');
const outDir = join(root, 'dist-extension');
const files = [
  'manifest.json',
  'background.js',
  'bridge.js',
  'popup.html',
  'popup.js',
  'icon16.png',
  'icon32.png',
  'icon48.png',
  'icon128.png'
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
for (const file of files) await copyFile(join(src, file), join(outDir, file));

const zip = join(root, 'dist-extension.zip');
await rm(zip, { force: true });
execFileSync('zip', ['-X', '-r', zip, ...files], { cwd: outDir });
console.log(`Wrote ${zip}`);

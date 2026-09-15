import { mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'downloads');
await mkdir(out, { recursive: true });

const macApp = join(root, 'desktop/macos/DerivedData/Build/Products/Release/AFKMAXX.app');
const macZip = join(out, 'AFKMAXX-1.0.0-mac.zip');
await rm(macZip, { force: true });
execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', macApp, macZip]);

const winDir = join(root, 'desktop/windows/AFKMAXX');
const winZip = join(out, 'AFKMAXX-1.0.0-windows.zip');
await rm(winZip, { force: true });
execFileSync('zip', ['-r', '-X', winZip, '.', '-x', 'bin/*', 'obj/*', '*.user'], { cwd: winDir });

console.log(`Wrote ${macZip}`);
console.log(`Wrote ${winZip}`);

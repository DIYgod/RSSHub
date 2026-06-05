import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const packageManager = packageJson.packageManager;
const match = /^pnpm@([^+]+)(?:\+.*)?$/.exec(packageManager ?? '');

if (!match) {
    throw new Error(`Expected packageManager to pin pnpm, got ${packageManager ?? 'undefined'}`);
}

const result = spawnSync('npx', ['-y', `pnpm@${match[1]}`, 'install', '--frozen-lockfile', ...process.argv.slice(2)], {
    stdio: 'inherit',
});

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);

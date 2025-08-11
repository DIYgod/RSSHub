import packageJson from '../../package.json';
import fs from 'node:fs';

packageJson.name = 'rsshub-vercel';
// @ts-ignore
delete packageJson.scripts;
// @ts-ignore
delete packageJson.main;
// @ts-ignore
delete packageJson.files;
// @ts-ignore
delete packageJson['lint-staged'];

fs.writeFileSync('rsshub-vercel/package.json', JSON.stringify(packageJson, null, 4));

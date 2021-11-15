/** */
import fs from 'node:fs';
import path from 'node:path';

import {createCommons} from 'simport';

const {
    __dirname,
} = createCommons(import.meta.url);

const target = path.join(__dirname, '../../assets/build/maintainer.json');
const maintainer = (await import(path.join(__dirname, '../../lib/maintainer.js'))).default;

const count = Object.keys(maintainer).length;
const uniqueMaintainer = new Set();
Object.values(maintainer)
    .flat()
    .forEach((e) => uniqueMaintainer.add(e));

// eslint-disable-next-line no-console
console.log(`We have ${count} routes and maintained by ${uniqueMaintainer.size} contributors!`);

fs.writeFileSync(target, JSON.stringify(maintainer, null, 4));

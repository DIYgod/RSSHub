import fs from 'node:fs';
import path from 'node:path';

import {createCommons} from 'simport';

const {
    __dirname,
} = createCommons(import.meta.url);

const target = path.join(__dirname, '../../assets/build/radar-rules.js');
const radar = (await import(path.join(__dirname, '../../lib/radar.js'))).default;

fs.writeFileSync(target, radar.toSource());

import fs from 'fs';
import path from 'path';
const target = path.join(__dirname, '../../assets/build/radar-rules.js');
import radar from path.join(__dirname, '../../lib/radar.js');

fs.writeFileSync(target, radar.toSource());

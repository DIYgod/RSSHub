const fs = require('fs');
import path from 'path'
const target = path.join(__dirname, '../../assets/build/radar-rules.js');
const radar = require(path.join(__dirname, '../../lib/radar.js'));

fs.writeFileSync(target, radar.toSource());

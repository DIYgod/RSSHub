const fs = require('fs');
const path = require('path');
const targetJs = path.join(__dirname, '../../assets/build/radar-rules.js');
const targetJson = path.join(__dirname, '../../assets/build/radar-rules.json');
const radar = require(path.join(__dirname, '../../lib/radar.js'));

fs.writeFileSync(targetJs, radar.toSource());
fs.writeFileSync(targetJson, JSON.stringify(radar.rules, undefined, 2));

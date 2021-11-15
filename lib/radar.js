import { __dirname } from './utils/dirname.js';

const dirname = __dirname(import.meta.url) + '/v2';
const toSource = require('tosource');

const radarRules = require('require-all')({
    dirname,
    filter: /radar\.js$/,
});

let rules = {};

for (const dir in radarRules) {
    const rule = radarRules[dir]['radar.js']; // Do not merge other file
    rules = { ...rules, ...rule };
}

const oldRules = require('./radar-rules.js'); // Match old rules
rules = { ...rules, ...oldRules };

export default {
    rules,
    toSource: () => `(${toSource(rules)})`,
};

import { __dirname } from '@/utils/dirname.js';
const dirname = __dirname(import.meta) + 'v2';
import toSource from 'tosource';

import requireAll from 'require-all';
const radarRules = requireAll({
    dirname,
    filter: /radar\.js$/,
});

let rules = {};

for (const dir in radarRules) {
    const rule = radarRules[dir]['radar.js']; // Do not merge other file
    rules = { ...rules, ...rule };
}

import oldRules from './radar-rules.js'; // Match old rules
rules = { ...rules, ...oldRules };

export default {
    rules,
    toSource: () => `(${toSource(rules)})`,
};

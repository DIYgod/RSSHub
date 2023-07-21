const dirname = __dirname + '/v2';
const fs = require('fs');
const toSource = require('tosource');
const { join } = require('path');

const allowNamespace = ['ehentai', 'test'];
// Check if a radar.js file is exist under each folder of dirname
for (const dir of fs.readdirSync(dirname)) {
    const dirPath = join(dirname, dir);
    if (!fs.existsSync(join(dirPath, 'radar.js')) && !allowNamespace.includes(dir)) {
        throw Error(`No radar.js in "${dirPath}".`);
    }
}

const validateRadarRules = (rule, dir) => {
    const allowDomains = ['www.gov.cn'];
    const blockWords = ['/', 'http', 'www'];
    const domain = Object.keys(rule);
    if (!domain.length && !allowNamespace.includes(dir)) {
        // typo check e.g., ✘ module.export, ✔ module.exports
        throw Error(`No Radar rule in "${dir}".`);
    }
    for (const [d, r] of Object.entries(rule)) {
        if (blockWords.some((word) => d.startsWith(word)) && !allowDomains.includes(d)) {
            throw Error(`Domain name "${d}" should not contain any of ${blockWords.join(', ')}.`);
        }
        if (!r.hasOwnProperty('_name')) {
            throw Error(`No _name in "${dir}".`);
        }
        // property check
        for (const [host, items] of Object.entries(r)) {
            if (host !== '_name') {
                if (!Array.isArray(items)) {
                    throw Error(`Radar rules for domain "${host}" in "${dir}" should be placed in an array.`);
                }
                for (const item of items) {
                    if (!item.hasOwnProperty('title') || !item.hasOwnProperty('docs')) {
                        throw Error(`Radar rules for "${host}" in "${dir}" should have at least "title" and "docs".`);
                    }
                    if (!item.title || !item.docs) {
                        throw Error(`Radar rules for "${host}" in "${dir}" should not be empty.`);
                    }
                    if (!item.docs.startsWith('https://docs.rsshub.app/')) {
                        throw Error(`Radar rules for "${host}" in "${dir}" should start with 'https://docs.rsshub.app/'.`);
                    }
                    if (Array.isArray(item.source)) {
                        if (!item.source.length) {
                            // check for []
                            throw Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                        if (item.source.some((s) => s.includes('#') || s.includes('='))) {
                            // Some will try to match '/some/path?a=1' which is not supported
                            throw Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" cannot match URL hash or URL search parameters.`);
                        }
                        if (item.source.some((s) => !s.length)) {
                            // check for ['/some/thing', ''] and ['']
                            throw Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                    }
                    if (typeof item.source === 'string') {
                        if (!item.source.length) {
                            // check for ''
                            throw Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                        if (item.source.includes('#') || item.source.includes('=')) {
                            throw Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" cannot match URL hash or URL search parameters.`);
                        }
                    }
                    for (const key in item) {
                        if (key !== 'title' && key !== 'docs' && key !== 'source' && key !== 'target') {
                            throw Error(`Radar rules for "${host}" in "${dir}" should not have property "${key}".`);
                        }
                    }
                }
            }
        }
    }
};

const radarRules = require('require-all')({
    dirname,
    filter: /radar\.js$/,
});

let rules = {};

for (const dir in radarRules) {
    const rule = radarRules[dir]['radar.js']; // Do not merge other file

    validateRadarRules(rule, dir);

    rules = { ...rules, ...rule };
}

const oldRules = require('./radar-rules.js'); // Match old rules
rules = { ...rules, ...oldRules };

module.exports = {
    rules,
    toSource: () => `(${toSource(rules)})`,
};

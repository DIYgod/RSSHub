import * as fs from 'node:fs';
import * as path from 'node:path';
import { directoryImport } from 'directory-import';
import toSource from 'tosource';

const targetJs = path.join(__dirname, '../../assets/build/radar-rules.js');
const targetJson = path.join(__dirname, '../../assets/build/radar-rules.json');
const dirname = path.join(__dirname + '../../../lib/routes');

// Namespaces that do not require radar.ts
const allowNamespace = new Set(['discourse', 'discuz', 'ehentai', 'lemmy', 'mail', 'test', 'index.tsx', 'robots.txt.ts']);
// Check if a radar.ts file is exist under each folder of dirname
for (const dir of fs.readdirSync(dirname)) {
    const dirPath = path.join(dirname, dir);
    if (!fs.existsSync(path.join(dirPath, 'radar.ts')) && !allowNamespace.has(dir)) {
        throw new Error(`No radar.ts in "${dirPath}".`);
    }
}

const validateRadarRules = (rule, dir) => {
    const allowDomains = new Set(['www.gov.cn']);
    const blockWords = ['/', 'http', 'www'];
    const domain = Object.keys(rule);
    if (!domain.length && !allowNamespace.has(dir)) {
        // typo check e.g., ✘ module.export, ✔ module.exports
        throw new Error(`No Radar rule in "${dir}".`);
    }
    for (const [d, r] of Object.entries(rule)) {
        if (blockWords.some((word) => d.startsWith(word)) && !allowDomains.has(d)) {
            throw new Error(`Domain name "${d}" should not contain any of ${blockWords.join(', ')}.`);
        }
        if (!Object.hasOwn(r, '_name')) {
            throw new Error(`No _name in "${dir}".`);
        }
        // property check
        for (const [host, items] of Object.entries(r)) {
            if (host !== '_name') {
                if (!Array.isArray(items)) {
                    throw new TypeError(`Radar rules for domain "${host}" in "${dir}" should be placed in an array.`);
                }
                for (const item of items) {
                    if (!Object.hasOwn(item, 'title') || !Object.hasOwn(item, 'docs')) {
                        throw new Error(`Radar rules for "${host}" in "${dir}" should have at least "title" and "docs".`);
                    }
                    if (!item.title || !item.docs) {
                        throw new Error(`Radar rules for "${host}" in "${dir}" should not be empty.`);
                    }
                    if (!item.docs.startsWith('https://docs.rsshub.app/')) {
                        throw new Error(`Radar rules for "${host}" in "${dir}" should start with 'https://docs.rsshub.app/'.`);
                    }
                    if (Array.isArray(item.source)) {
                        if (!item.source.length) {
                            // check for []
                            throw new Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                        if (item.source.some((s) => s.includes('#') || s.includes('='))) {
                            // Some will try to match '/some/path?a=1' which is not supported
                            throw new Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" cannot match URL hash or URL search parameters.`);
                        }
                        if (item.source.some((s) => !s.length)) {
                            // check for ['/some/thing', ''] and ['']
                            throw new Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                    }
                    if (typeof item.source === 'string') {
                        if (!item.source.length) {
                            // check for ''
                            throw new Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" should not be empty.`);
                        }
                        if (item.source.includes('#') || item.source.includes('=')) {
                            throw new Error(`Radar rule of "${item.title}" for subdomain "${host}" in "${dir}" cannot match URL hash or URL search parameters.`);
                        }
                    }
                    for (const key in item) {
                        if (key !== 'title' && key !== 'docs' && key !== 'source' && key !== 'target') {
                            throw new Error(`Radar rules for "${host}" in "${dir}" should not have property "${key}".`);
                        }
                    }
                }
            }
        }
    }
};

// const radarRules = require('require-all')({
//     dirname,
//     filter: /radar\.ts$/,
// });
const imports = directoryImport({
    targetDirectoryPath: dirname,
    importPattern: /radar\.ts$/,
});

let rules = {};

for (const dir in imports) {
    const rule = imports[dir].default; // Do not merge other file

    validateRadarRules(rule, dir.replace('/radar.ts', '').replace(/^\//, ''));

    rules = { ...rules, ...rule };
}

const oldRules = require('./radar-rules.js'); // Match old rules
rules = { ...rules, ...oldRules };

fs.writeFileSync(targetJs, `(${toSource(rules)})`);
fs.writeFileSync(targetJson, JSON.stringify(rules, undefined, 2));

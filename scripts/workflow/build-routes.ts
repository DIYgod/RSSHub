import { namespaces } from '../../lib/registry';
import { RadarItem } from '../../lib/types';
import { parse } from 'tldts';
import fs from 'node:fs';
import * as path from 'node:path';
import toSource from 'tosource';
import { categories } from './data';

const maintainers: Record<string, string[]> = {};
const radar: {
    [domain: string]: {
        _name: string;
        [subdomain: string]: RadarItem[] | string;
    };
} = {};
const docs = {};

for (const namespace in namespaces) {
    let defaultCategory = namespaces[namespace].categories?.[0];
    if (!defaultCategory) {
        for (const path in namespaces[namespace].routes) {
            if (namespaces[namespace].routes[path].categories) {
                defaultCategory = namespaces[namespace].routes[path].categories[0];
                break;
            }
        }
    }
    if (!defaultCategory) {
        defaultCategory = 'other';
    }
    for (const path in namespaces[namespace].routes) {
        const realPath = `/${namespace}${path}`;
        const data = namespaces[namespace].routes[path];
        const categories = data.categories || namespaces[namespace].categories || [defaultCategory];
        // maintainers
        if (data.maintainers) {
            maintainers[realPath] = data.maintainers;
        }
        // radar
        if (data.radar?.length) {
            for (const radarItem of data.radar) {
                const parsedDomain = parse(new URL('https://' + radarItem.source[0]).hostname);
                const subdomain = parsedDomain.subdomain || '.';
                const domain = parsedDomain.domain;
                if (domain) {
                    if (!radar[domain]) {
                        radar[domain] = {
                            _name: namespaces[namespace].name,
                        };
                    }
                    if (!radar[domain][subdomain]) {
                        radar[domain][subdomain] = [];
                    }
                    radar[domain][subdomain].push({
                        title: radarItem.title || data.name,
                        docs: `https://docs.rsshub.app/routes/${categories[0]}`,
                        source: radarItem.source.map((source) => {
                            const sourceURL = new URL('https://' + source);
                            return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                        }),
                        target: radarItem.target ? `/${namespace}${radarItem.target}` : realPath,
                    });
                }
            }
        }
        // docs.json
        for (const category of categories) {
            if (!docs[category]) {
                docs[category] = {};
            }
            if (!docs[category][namespace]) {
                docs[category][namespace] = {
                    routes: {},
                };
            }
            docs[category][namespace].name = namespaces[namespace].name;
            docs[category][namespace].url = namespaces[namespace].url;
            docs[category][namespace].description = namespaces[namespace].description;
            docs[category][namespace].routes[realPath] = data;
        }
    }
}

fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.json'), JSON.stringify(radar, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.js'), `(${toSource(radar)})`);
fs.writeFileSync(path.join(__dirname, '../../assets/build/maintainers.json'), JSON.stringify(maintainers, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/routes.json'), JSON.stringify(namespaces, null, 2));

// Generate markdown
const pinyinCompare = new Intl.Collator('zh-Hans-CN-u-co-pinyin').compare;
const isASCII = (str) => /^[\u0000-\u007F]*$/.test(str);

function generateMd(lang) {
    const md = {};
    for (const category in docs) {
        const nameObj = categories.find((c) => c.link.includes(category));
        if (!nameObj) {
            throw new Error(`Category not found: ${category}, please double check your spelling.`);
        }

        md[category] = `# ${`${nameObj.icon} ${nameObj[lang]}`}\n\n`;

        const namespaces = Object.keys(docs[category]).sort((a, b) => {
            const aname = docs[category][a].name[0];
            const bname = docs[category][b].name[0];
            const ia = isASCII(aname);
            const ib = isASCII(bname);
            if (ia && ib) {
                return aname.toLowerCase() < bname.toLowerCase() ? -1 : 1;
            } else if (ia || ib) {
                return ia > ib ? -1 : 1;
            } else {
                return pinyinCompare(aname, bname);
            }
        });
        for (const namespace of namespaces) {
            if (docs[category][namespace].name === 'Unknown') {
                docs[category][namespace].name = namespace;
            }
            md[category] += `## ${docs[category][namespace].name || namespace} ${docs[category][namespace].url ? `<Site url="${docs[category][namespace].url}"/>` : ''}\n\n`;
            if (docs[category][namespace].description) {
                md[category] += `${docs[category][namespace].description}\n\n`;
            }

            const realPaths = Object.keys(docs[category][namespace].routes).sort((a, b) => {
                const aname = docs[category][namespace].routes[a].name[0];
                const bname = docs[category][namespace].routes[b].name[0];
                const ia = isASCII(aname);
                const ib = isASCII(bname);
                if (ia && ib) {
                    return aname.toLowerCase() < bname.toLowerCase() ? -1 : 1;
                } else if (ia || ib) {
                    return ia > ib ? -1 : 1;
                } else {
                    return pinyinCompare(aname, bname);
                }
            });

            for (const realPath of realPaths) {
                const data = docs[category][namespace].routes[realPath];
                md[category] += `### ${data.name} ${data.url || docs[category][namespace].url ? `<Site url="${data.url || docs[category][namespace].url}" size="sm" />` : ''}\n\n`;
                md[category] += `<Route namespace="${namespace}" :data='${JSON.stringify(data).replaceAll(`'`, '&#39;')}' />\n\n`;
                if (data.description) {
                    md[category] += `${data.description}\n\n`;
                }
            }
        }
    }
    fs.mkdirSync(path.join(__dirname, `../../assets/build/docs/${lang}`), { recursive: true });
    for (const category in md) {
        fs.writeFileSync(path.join(__dirname, `../../assets/build/docs/${lang}/${category}.md`), md[category]);
    }
}
generateMd('en');
generateMd('zh');

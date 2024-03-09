import { namespaces } from '../../lib/registry';
import { parse } from 'tldts';
import fs from 'node:fs';
import * as path from 'node:path';

const maintainers: Record<string, string[]> = {};
const radar: {
    [domain: string]: {
        _name: string;
        [subdomain: string]:
            | {
                  title: string;
                  docs: string;
                  source: string[];
                  target: string | ((params: any, url: string) => string);
              }[]
            | string;
    };
} = {};
const docs = {};

for (const namespace in namespaces) {
    for (const path in namespaces[namespace].routes) {
        const realPath = `/${namespace}${path}`;
        const data = namespaces[namespace].routes[path];
        if (data.maintainers) {
            maintainers[realPath] = data.maintainers;
        }
        if (data.radar && data.radar.source) {
            const parsedDomain = parse(new URL('https://' + data.radar.source[0]).hostname);
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
                    title: data.name,
                    docs: `https://docs.rsshub.app/routes/${data.categories?.[0] || 'other'}`,
                    source: data.radar.source.map((source) => {
                        const sourceURL = new URL('https://' + source);
                        return sourceURL.pathname + sourceURL.search + sourceURL.hash;
                    }),
                    target: data.radar.target || realPath,
                });
            }
        }
        const categories = data.categories || namespaces[namespace].categories || ['other'];
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
            docs[category][namespace].description = namespaces[namespace].description;
            docs[category][namespace].routes[realPath] = data;
        }
    }
}

fs.writeFileSync(path.join(__dirname, '../../assets/build/radar-rules.json'), JSON.stringify(radar, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/maintainers.json'), JSON.stringify(maintainers, null, 2));
fs.writeFileSync(path.join(__dirname, '../../assets/build/routes.json'), JSON.stringify(namespaces, null, 2));

const pinyinCompare = new Intl.Collator('zh-Hans-CN-u-co-pinyin').compare;
const isASCII = (str) => /^[\u0000-\u007F]*$/.test(str);

const md = {};
for (const category in docs) {
    md[category] = `# ${category}\n\n`;

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
        md[category] += `## ${docs[category][namespace].name}\n\n`;
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
            md[category] += `### ${data.name}\n\n`;
            md[category] += `<Route namespace="${namespace}" data={${JSON.stringify(data)}} />\n\n`;
            if (data.description) {
                md[category] += `${data.description}\n\n`;
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, '../../assets/build/docs.json'), JSON.stringify(docs, null, 2));
if (fs.existsSync(path.join(__dirname, '../../website'))) {
    for (const category in md) {
        fs.writeFileSync(path.join(__dirname, `../../website/docs/routes/${category}.mdx`), md[category]);
    }
}

import { namespaces } from '../../lib/registry';
import fs from 'node:fs';
import path from 'node:path';
import { categories } from './data';
import { getCurrentPath } from '../../lib/utils/helpers';

const fullTests = await (await fetch('https://cdn.jsdelivr.net/gh/DIYgod/RSSHub@gh-pages/build/test-full-routes.json')).json();
const testResult = fullTests.testResults[0].assertionResults;

const foloAnalysis = await (
    await fetch('https://api.follow.is/discover/rsshub-analytics', {
        headers: {
            'user-agent': 'RSSHub',
        },
    })
).json();
const foloAnalysisResult = foloAnalysis.data as Record<string, { subscriptionCount: number; topFeeds: any[] }>;
const foloAnalysisTop100 = Object.entries(foloAnalysisResult)
    .sort((a, b) => b[1].subscriptionCount - a[1].subscriptionCount)
    .slice(0, 150);

const __dirname = getCurrentPath(import.meta.url);

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
        if (foloAnalysisTop100.some(([path]) => path === realPath)) {
            categories.push('popular');
        }
        // docs.json
        for (const category of categories) {
            if (!docs[category]) {
                docs[category] = {};
            }
            if (!docs[category][namespace]) {
                docs[category][namespace] = {
                    routes: {},
                    heat: 0,
                };
            }
            docs[category][namespace].name = namespaces[namespace].name;
            docs[category][namespace].url = namespaces[namespace].url;
            docs[category][namespace].description = namespaces[namespace].description;
            docs[category][namespace].routes[realPath] = {
                ...data,
                heat: foloAnalysisResult[realPath]?.subscriptionCount || 0,
                topFeeds: foloAnalysisResult[realPath]?.topFeeds || [],
            };
            docs[category][namespace].heat += foloAnalysisResult[realPath]?.subscriptionCount || 0;
        }
    }
}

function generateMd(lang) {
    const md = {};
    for (const category in docs) {
        const nameObj = categories.find((c) => c.link.includes(category));
        if (!nameObj) {
            throw new Error(`Category not found: ${category}, please double check your spelling.`);
        }

        md[category] = `# ${`${nameObj.icon} ${nameObj[lang]}`}\n\n`;

        const namespaces = Object.keys(docs[category]).sort((a, b) => {
            const aname = docs[category][a].heat;
            const bname = docs[category][b].heat;
            return bname - aname;
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
                const aheat = docs[category][namespace].routes[a].heat;
                const bheat = docs[category][namespace].routes[b].heat;
                return bheat - aheat;
            });

            const processedPaths = new Set();

            for (const realPath of realPaths) {
                const data = docs[category][namespace].routes[realPath];
                if (Array.isArray(data.path)) {
                    if (processedPaths.has(data.path[0])) {
                        continue;
                    }
                    processedPaths.add(data.path[0]);
                }

                const test = testResult.find((t) => t.title === realPath);
                const parsedTest = test
                    ? {
                          code: test.status === 'passed' ? 0 : 1,
                          message: test.failureMessages?.[0],
                      }
                    : undefined;
                md[category] += `### ${data.name} ${data.url || docs[category][namespace].url ? `<Site url="${data.url || docs[category][namespace].url}" size="sm" />` : ''}\n\n`;
                md[category] += `<Route namespace="${namespace}" :data='${JSON.stringify(data).replaceAll(`'`, '&#39;')}' :test='${JSON.stringify(parsedTest)?.replaceAll(`'`, '&#39;')}' />\n\n`;
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

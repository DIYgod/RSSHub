import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const fields = ['namespace', 'route', 'name', 'url', 'maintainer', 'category', 'template'];
const templates = new Set(['api', 'html', 'browser']);

async function checkSource(url, fetcher) {
    const response = await fetcher(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (response.status === 404 || response.status >= 500) {
        throw new Error(`Source URL returned HTTP ${response.status}: ${url}`);
    }
}

function renderRoute(options) {
    const imports = ["import type { Route } from '@/types';", "import { parseDate } from '@/utils/parse-date';"];
    let body;
    if (options.template === 'api') {
        imports.push("import ofetch from '@/utils/ofetch';");
        body = `    // Replace this endpoint and field names with the site's first-page API.\n    const response = await ofetch<{ items: { title: string; url: string; content: string; publishedAt?: string }[] }>(new URL('/api/articles', link).href);\n    const items = response.items.map((article) => ({\n        title: article.title,\n        link: new URL(article.url, link).href,\n        description: article.content,\n        pubDate: article.publishedAt ? parseDate(article.publishedAt) : undefined,\n    }));`;
    } else {
        imports.unshift("import { load } from 'cheerio';", '');
        const parse = `        // Replace these selectors with the site's actual article list.\n        const $ = load(response);\n        const items = $('.article').toArray().map((element) => {\n            const article = $(element);\n            const anchor = article.find('h2 a');\n            const date = article.find('time').attr('datetime');\n            return {\n                title: anchor.text(),\n                link: new URL(anchor.attr('href')!, link).href,\n                description: article.find('.summary').html() || '',\n                pubDate: date ? parseDate(date) : undefined,\n            };\n        });`;
        if (options.template === 'html') {
            imports.push("import ofetch from '@/utils/ofetch';");
            body = `    const response = await ofetch(link);\n${parse.replaceAll(/^ {4}/gm, '')}`;
        } else {
            imports.push("import { getPlaywrightPage } from '@/utils/playwright';");
            body = `    const { page, destroy } = await getPlaywrightPage(link, {\n        closeTimeout: 0,\n        onBeforeLoad: async (page) => {\n            await page.route('**/*', (request) => ['document', 'script', 'xhr', 'fetch'].includes(request.request().resourceType()) ? request.continue() : request.abort());\n        },\n    });\n    try {\n        await page.waitForSelector('.article');\n        const response = await page.content();\n${parse}\n        return { title: ${JSON.stringify(options.name)}, link, item: items };\n    } finally {\n        await destroy();\n    }`;
        }
    }
    const routePath = options.path || `/${options.route}`;
    const example = options.example || `/${options.namespace}${routePath}`;
    return `${imports.join('\n')}\n\nexport const route: Route = {\n    path: ${JSON.stringify(routePath)},\n    name: ${JSON.stringify(options.name)},\n    example: ${JSON.stringify(example)},\n    categories: [${JSON.stringify(options.category)}],\n    maintainers: [${JSON.stringify(options.maintainer)}],\n    features: { requirePuppeteer: ${options.template === 'browser'} },\n    handler,\n};\n\nasync function handler() {\n    const link = ${JSON.stringify(options.url)};\n${body}\n${options.template === 'browser' ? '' : `    return { title: ${JSON.stringify(options.name)}, link, item: items };\n`}}\n`;
}

export async function generateRoute(options, fetcher = fetch) {
    for (const field of fields) {
        if (!Object.hasOwn(options, field) || options[field] === '') {
            throw new Error(`Missing --${field}.`);
        }
    }
    if (!/^[a-z][a-z\d-]*$/.test(options.namespace) || !/^[a-z][a-z\d-]*$/.test(options.route) || options.route === 'namespace') {
        throw new Error('Namespace and route filenames must use lowercase letters, numbers and hyphens.');
    }
    if (!templates.has(options.template)) {
        throw new Error('Template must be api, html or browser.');
    }
    const types = await readFile(new URL('../lib/types.ts', import.meta.url), 'utf8');
    const categories =
        types
            .match(/export type Category =([\s\S]*?);/)?.[1]
            .matchAll(/'([^']+)'/g)
            .toArray()
            .map((match) => match[1]) || [];
    if (!categories.includes(options.category)) {
        throw new Error(`Unknown category. Choose one of: ${categories.join(', ')}.`);
    }
    const url = new URL(options.url);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('Source URL must be HTTP(S) without credentials.');
    }
    if (options.path && (!options.path.startsWith('/') || /\?(?!\/|$)/.test(options.path))) {
        throw new Error('--path must start with / and use path parameters instead of a query string.');
    }
    if (!options.example && (options.path || '').includes(':')) {
        throw new Error('Parameterized paths require an explicit --example.');
    }
    if (options.example && !options.example.startsWith(`/${options.namespace}/`)) {
        throw new Error('--example must be a route path under the selected namespace.');
    }
    const directory = path.resolve(options.directory || 'lib/routes', options.namespace);
    const routeFile = path.join(directory, `${options.route}.ts`);
    try {
        await access(routeFile);
        throw new Error(`Route already exists: ${routeFile}`);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
    const maintainer = await fetcher(`https://api.github.com/users/${encodeURIComponent(options.maintainer)}`, { signal: AbortSignal.timeout(15000) });
    if (!maintainer.ok || (await maintainer.json()).login?.toLowerCase() !== options.maintainer.toLowerCase()) {
        throw new Error(`GitHub could not verify maintainer ${options.maintainer}.`);
    }
    await checkSource(url.href, fetcher);
    await mkdir(directory, { recursive: true });
    const namespaceFile = path.join(directory, 'namespace.ts');
    try {
        await writeFile(namespaceFile, `import type { Namespace } from '@/types';\n\nexport const namespace: Namespace = { name: ${JSON.stringify(options.namespace)}, url: ${JSON.stringify(url.host)} };\n`, { flag: 'wx' });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
    await writeFile(routeFile, renderRoute(options), { flag: 'wx' });
    return routeFile;
}

async function main() {
    const { values } = parseArgs({ options: Object.fromEntries([...[...fields, 'directory', 'path', 'example'].map((field) => [field, { type: 'string' }]), ['help', { type: 'boolean' }]]) });
    if (values.help) {
        process.stdout.write(
            'pnpm new:route --namespace example --route news --name News --url https://example.com --maintainer YOUR_GITHUB_ID --category new-media --template api|html|browser [--path /news/:id --example /example/news/123]\n'
        );
        return;
    }
    if (process.stdin.isTTY && fields.some((field) => !Object.hasOwn(values, field))) {
        const prompts = createInterface({ input: process.stdin, output: process.stdout });
        try {
            for (const field of fields) {
                // Prompts must be sequential because they share a terminal input stream.
                // eslint-disable-next-line no-await-in-loop
                values[field] ||= await prompts.question(`${field}${field === 'template' ? ' (api/html/browser)' : ''}: `);
            }
        } finally {
            prompts.close();
        }
    }
    process.stdout.write(`Created ${await generateRoute(values)}. Adapt the endpoint or selectors, then run pnpm format and verify the example against the live site.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    await main();
}

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import http from 'http';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

program
    .version('1.0.0')
    .description('A command-tool to help add new routes. Usage example: node cli.js add-route')
    .addHelpText(
        'after',
        '\nFull usage example:\n  $ node cli.js add-route\n  Enter the namespace name: example\n  Enter the route name: test\n  Enter the maintainer name: John Doe\n  Select data fetching method (1: API, 2: HTML, 3: Puppeteer): 1'
    );

program
    .command('run-server')
    .description('Run a test server with list and detail pages, and JSON API.')
    .action(() => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const path = url.pathname;
            const query = Object.fromEntries(url.searchParams);

            if (path === '/') {
                const category = query.category;
                const items = [
                    { id: 1, title: 'Item 1', category: 'tech', description: 'This is item 1 description.', pubDate: new Date().toISOString() },
                    { id: 2, title: 'Item 2', category: 'science', description: 'This is item 2 description.', pubDate: new Date().toISOString() },
                    { id: 3, title: 'Item 3', category: 'health', description: 'This is item 3 description.', pubDate: new Date().toISOString() },
                ];
                const filteredItems = category ? items.filter((item) => item.category === category) : items;

                // List page HTML
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
        <h1>Test Server - List Page</h1>
        <p name="category">Category: ${category || 'All'}</p>
        <ul id="items">
          ${filteredItems
              .map(
                  (item) => `
            <li id="item" name="${item.title}">
              <a href="/item/${item.id}?category=${item.category}">
                <h2 name="title">${item.title}</h2>
              </a>
              <p name="description">${item.description || 'No description available.'}</p>
              <p name="pubDate">${new Date().toISOString()}</p>
            </li>
          `
              )
              .join('')}
        </ul>
      `);
            } else if (path.startsWith('/item/')) {
                // Detail page HTML
                const itemId = path.split('/')[2];
                const category = query.category || 'unknown';
                const currentDate = new Date().toLocaleString();
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
        <h1>Test Server - Item Detail</h1>
        <h2 name="title">Item ${itemId}</h2>
        <p name="category">Category: ${category}</p>
        <p name="maintainer">Maintainer: Foo Bar</p>
        <p name="description">Description: This is a sample item description.</p>
        <p name="summary">Summary: The quick brown fox jumps over the lazy dog.</p>
        <p name="datetime">DateTime: ${currentDate}</p>
        <a href="/">Back to List</a>
      `);
            } else if (path === '/api') {
                const category = query.category;
                const items = [
                    { id: 1, title: 'Item 1', category: 'tech', description: 'API This is item 1 description.', pubDate: new Date().toISOString(), link: 'http://localhost:3000/api/item/1?category=tech' },
                    { id: 2, title: 'Item 2', category: 'science', description: 'API This is item 2 description.', pubDate: new Date().toISOString(), link: 'http://localhost:3000/api/item/2?category=science' },
                    { id: 3, title: 'Item 3', category: 'health', description: 'API This is item 3 description.', pubDate: new Date().toISOString(), link: 'http://localhost:3000/api/item/3?category=health' },
                ];

                const filteredItems = category ? items.filter((item) => item.category === category) : items;

                // API list of items
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(filteredItems));
            } else if (path.startsWith('/api/item/')) {
                // API item detail
                const itemId = path.split('/')[3];
                const item = {
                    id: itemId,
                    title: `Item ${itemId}`,
                    category: query.category || 'unknown',
                    maintainer: 'Foo Bar',
                    description: 'This is a sample item description.',
                    summary: 'The quick brown fox jumps over the lazy dog.',
                    dateTime: new Date().toISOString(),
                    name: `item-${itemId}`,
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(item));
            } else {
                // 404 Not Found
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        });

        server.listen(3000, () => {
            console.log('Test server running at http://localhost:3000/');
            console.log('Features:');
            console.log('- List page (HTML): http://localhost:3000/');
            console.log('- List page with category filter (HTML): http://localhost:3000/?category=:category');
            console.log('- Item detail page (HTML): http://localhost:3000/item/:id?category=:category');
            console.log('- API list of items (JSON): http://localhost:3000/api/');
            console.log('- API list with category filter (JSON): http://localhost:3000/api/?category=:category');
            console.log('- API item detail (JSON): http://localhost:3000/api/item/:id?category=:category');
        });
    });

program
    .command('add-route')
    .description('Add a new route.')
    .action(() => {
        const questions = [
            { prompt: 'Enter the namespace name: ', key: 'namespaceName' },
            { prompt: 'Enter the route name: ', key: 'routeName' },
            { prompt: 'Enter the maintainer name: ', key: 'maintainer' },
            { prompt: 'Select data fetching method (1: API, 2: HTML, 3: Puppeteer): ', key: 'fetchMethod' },
        ];

        const answers = {};

        const askQuestion = (index) => {
            if (index >= questions.length) {
                createRouteFiles(answers);
                return;
            }

            const question = questions[index];
            rl.question(question.prompt, (answer) => {
                answers[question.key] = answer;
                askQuestion(index + 1);
            });
        };

        askQuestion(0);
    });

function createRouteFiles(answers) {
    const { namespaceName, routeName, maintainer, fetchMethod } = answers;

    if (!['1', '2', '3'].includes(fetchMethod)) {
        console.error('Invalid choice. Please select 1, 2, or 3.');
        rl.close();
        return;
    }

    const routesPath = path.join(process.cwd(), 'lib', 'routes');
    const newRoutePath = path.join(routesPath, namespaceName);

    // Check if namespace exists
    if (fs.existsSync(newRoutePath)) {
        rl.question(`Warning: Namespace '${namespaceName}' already exists. Continue? [y/N] `, (answer) => {
            if (answer.toLowerCase() !== 'y') {
                console.log('Operation cancelled.');
                rl.close();
                return;
            }
            checkRouteAndProceed();
        });
    } else {
        checkRouteAndProceed();
    }

    function checkRouteAndProceed() {
        const routeFilePath = path.join(newRoutePath, `${routeName}.ts`);
        if (fs.existsSync(routeFilePath)) {
            rl.question(`Warning: Route '${routeName}' already exists in namespace '${namespaceName}'. Continue? [y/N] `, (answer) => {
                if (answer.toLowerCase() !== 'y') {
                    console.log('Operation cancelled.');
                    rl.close();
                    return;
                }
                proceedWithCreation();
            });
        } else {
            proceedWithCreation();
        }
    }

    function proceedWithCreation() {
        // Create the namespaceName folder if it doesn't exist
        if (!fs.existsSync(newRoutePath)) {
            fs.mkdirSync(newRoutePath, { recursive: true });
        }

        // Create namespace.ts file
        const namespaceTemplate = `import type { Namespace } from '@/types';

export const namespace: Namespace = {
    name: '${namespaceName}',
    // TODO: add url
    url: 'https://example.com',
    description: \`${namespaceName} RSS feeds\`,
};
`;
        fs.writeFileSync(path.join(newRoutePath, 'namespace.ts'), namespaceTemplate);

        // Create route file
        const commonImports = `import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';`;

        const commonTemplate = `
export const route: Route = {
    path: '/${routeName}/:category?',
    categories: ['other'],
    example: '/${namespaceName}/${routeName}/science',
    parameters: { category: 'Category (optional)' },
    features: {
        requireConfig: false,
        requirePuppeteer: ${fetchMethod === '3' ? 'true' : 'false'},
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '${namespaceName} ${routeName}',
    maintainers: ['${maintainer}'],
    handler,
};`;

        let routeTemplate = '';

        switch (fetchMethod) {
            case '1':
                routeTemplate = `${commonImports}

${commonTemplate}

async function handler(ctx) {
    const category = ctx.req.param('category');
    const baseUrl = 'http://localhost:3000/api';
    const apiUrl = category ? \`\${baseUrl}?category=\${category}\` : baseUrl;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const data = response.data;

    let items = [];
    items = data.map((item) => ({
        title: item.title,
        description: item.description,
        pubDate: parseDate(new Date().toISOString()),
        link: item.link,
    }));

    return {
        title: \`${namespaceName} - ${routeName}\${category ? \` Category \${category}\` : ' List'}\`,
        link: baseUrl,
        item: items,
    };
}`;
                break;
            case '2':
                routeTemplate = `${commonImports}
import { load } from 'cheerio';

${commonTemplate}

async function handler(ctx) {
    const category = ctx.req.param('category');
    const baseUrl = 'http://localhost:3000';
    const target = category ? \`\${baseUrl}/?category=\${category}\` : baseUrl;

    const response = await got({
        method: 'get',
        url: target,
    });
    const $ = load(response.data);

    const items = $('ul[id="items"] li[id="item"]').map((_, el) => ({
        title: $(el).find('h2[name="title"]').text(),
        link: $(el).find('li[id="item"] a').attr('href'),
        pubDate: parseDate($(el).find('p[name="pubDate"]').text()),
        description: $(el).find('p[name="description"]').text(),
    })).toArray();

    return {
        title: \`${namespaceName} - ${routeName}\${category ? \` \${category}\` : ''}\`,
        link: target,
        item: items,
    };
}`;
                break;
            case '3':
                routeTemplate = `${commonImports}
import puppeteer from '@/utils/puppeteer';
import { load } from 'cheerio';

${commonTemplate}

async function handler(ctx) {
    const { category } = ctx.req.param();
    const baseUrl = 'http://localhost:3000';
    const url = category ? \`\${baseUrl}/?category=\${category}\` : baseUrl;
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
    });

    const html = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();

    const $ = load(html);

    const items = $('ul[id="items"] li[id="item"]').map((_, li) => ({
        title: $(li).find('h2[name="title"]').text(),
        link: $(li).find('a').attr('href'),
        description: $(li).find('p[name="description"]').text(),
        pubDate: $(li).find('p[name="pubDate"]').text(),
    })).toArray();

    return {
        title: \`${namespaceName} - ${routeName}\${category ? \` Category \${category}\` : ' List'}\`,
        link: baseUrl,
        item: items,
    };
}`;
                break;
            default:
                console.error('Invalid choice. Please select 1, 2, or 3.');
                rl.close();
                return;
        }

        const routeFilePath = path.join(newRoutePath, `${routeName}.ts`);
        fs.writeFileSync(routeFilePath, routeTemplate);

        console.log(`New route created:`);
        console.log(`Route folder: ${newRoutePath}`);
        console.log(`Namespace file: ${path.join(newRoutePath, 'namespace.ts')}`);
        console.log(`Route file: ${routeFilePath}`);

        rl.close();
    }
}

program.parse(process.argv);

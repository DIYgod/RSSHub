import { load } from 'cheerio';
import pMap from 'p-map';
import type { BrowserContext } from 'patchright';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { getPlaywrightPage } from '@/utils/playwright';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/journal/:journal',
    categories: ['journal'],
    example: '/springer/journal/10450',
    parameters: { journal: 'Journal Code, the number in the URL from the journal homepage' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.springer.com/journal/:journal', 'www.springer.com/journal/:journal/*'],
            target: '/journal/:journal',
        },
        {
            source: ['link.springer.com/journal/:journal', 'link.springer.com/journal/:journal/*'],
            target: '/journal/:journal',
        },
    ],
    name: 'Journal',
    maintainers: ['Derekmini', 'TonyRL', 'xiahaoyun'],
    handler,
};

async function handler(ctx) {
    const host = 'https://link.springer.com';
    const journal = ctx.req.param('journal');
    const jrnlUrl = `${host}/journal/${journal}/volumes-and-issues`;

    const { context, destroy } = await getPlaywrightPage('about:blank', {
        noGoto: true,
        closeTimeout: 0,
        javaScriptEnabled: false,
        onBeforeLoad: async (_, context) => {
            await context!.route('**/*', (request) => (request.request().resourceType() === 'document' && new URL(request.request().url()).hostname === 'link.springer.com' ? request.continue() : request.abort()));
        },
    });
    try {
        const response = await getHtml(context, jrnlUrl);
        const $ = load(response);
        const jrnlName = $('span.app-journal-masthead__title').text().trim();
        const issuePath = $('li.c-list-group__item a[href]').attr('href');
        if (!issuePath) {
            throw new Error('Springer returned no issues for this journal. Verify its journal code and public volumes page.');
        }
        const issueUrl = new URL(issuePath, host).href;

        const response2 = await getHtml(context, issueUrl);
        const $2 = load(response2);
        const list = $2('main .app-card-open__heading a[href]')
            .toArray()
            .map((item): DataItem & { link: string } => {
                const link = new URL($2(item).attr('href')!, host).href;
                return {
                    title: $2(item).text(),
                    link,
                    doi: new URL(link).pathname.replace('/article/', ''),
                };
            });

        const items = await pMap(
            list,
            async (item) => {
                const details = await cache.tryGet(`springer:article:v3:${item.link}`, async () => {
                    const response3 = await getHtml(context, item.link);
                    const $3 = load(response3);
                    const publicationDate = $3('meta[name="dc.date"]').attr('content');
                    return {
                        description: $3(
                            '#Abs1-section, .main-content > section[data-title], section[aria-labelledby="Bib1"], .c-article-body > section[data-title="Data availability"], .c-article-body > section[data-title="Abbreviations"], .c-article-body > section[data-title="Acknowledgements"], .c-article-body > section[data-title="Funding"], .c-article-body > section[data-title="Ethics declarations"], .c-article-body > section[data-title="Supplementary Information"], .c-article-body > section[data-title="Supplementary information"]'
                        )
                            .toArray()
                            .map((section) => $3.html(section))
                            .join(''),
                        pubDate: publicationDate ? parseDate(publicationDate, 0) : undefined,
                        author: $3('meta[name="citation_author"]')
                            .toArray()
                            .map((author) => $3(author).attr('content'))
                            .filter(Boolean)
                            .join(', '),
                        category: $3('.c-article-subject-list li')
                            .toArray()
                            .map((subject) => $3(subject).text().trim())
                            .filter(Boolean),
                    };
                });
                return { ...item, ...details };
            },
            { concurrency: 3, stopOnError: false }
        );
        return {
            title: jrnlName,
            link: jrnlUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}

async function getHtml(context: BrowserContext, url: string): Promise<string> {
    const page = await context.newPage();
    try {
        const response = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        if (!response || response.status() !== 200) {
            throw new Error(`Springer browser response failed for ${url}. Only publicly readable journal pages are supported.`);
        }
        const html = await response.text();
        if (html.includes('<title>Client Challenge</title>')) {
            throw new Error('Springer returned a client challenge in the browser. Retry when the public page is available.');
        }
        return html;
    } finally {
        await page.close();
    }
}

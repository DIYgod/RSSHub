import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getPlaywrightPage } from '@/utils/playwright';

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

    const source = new JournalSource();
    try {
        const response = await source.get(jrnlUrl);
        const $ = load(response);
        const jrnlName = $('span.app-journal-masthead__title').text().trim();
        const issuePath = $('li.c-list-group__item a[href]').first().attr('href');
        if (!issuePath) {
            throw new Error('Springer returned no issues for this journal. Verify its journal code and public volumes page.');
        }
        const issueUrl = new URL(issuePath, host).href;

        const response2 = await source.get(issueUrl);
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
                    const response3 = await source.get(item.link);
                    const $3 = load(response3);
                    const publicationDate = $3('meta[name="dc.date"]').attr('content');
                    return {
                        description: $3(
                            '#Abs1-section, .main-content > section[data-title], section[aria-labelledby="Bib1"], .c-article-body > section[data-title="Data availability"], .c-article-body > section[data-title="Abbreviations"], .c-article-body > section[data-title="Acknowledgements"], .c-article-body > section[data-title="Funding"], .c-article-body > section[data-title="Ethics declarations"], .c-article-body > section[data-title="Supplementary Information"], .c-article-body > section[data-title="Supplementary information"]'
                        )
                            .toArray()
                            .map((section) => $3.html(section))
                            .join(''),
                        pubDate: publicationDate ? parseDateInTimezone(publicationDate, 0) : undefined,
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
        await source.destroy();
    }
}

class JournalSource {
    private session?: Awaited<ReturnType<typeof getPlaywrightPage>>;
    private queue: Promise<void> = Promise.resolve();

    async get(url: string): Promise<string> {
        const response = await ofetch.raw(url, { responseType: 'text', ignoreResponseError: true });
        if (response.status !== 200) {
            throw new Error(`Springer returned HTTP ${response.status} for ${url}. Check that the journal and article remain publicly available.`);
        }
        const html = response._data ?? '';
        if (!html.includes('<title>Client Challenge</title>')) {
            return html;
        }
        const pending = (async () => {
            await this.queue;
            this.session ??= await getPlaywrightPage('about:blank', {
                noGoto: true,
                closeTimeout: 0,
                javaScriptEnabled: false,
                onBeforeLoad: async (page) => {
                    await page.route('**/*', (request) => (request.request().resourceType() === 'document' && new URL(request.request().url()).hostname === 'link.springer.com' ? request.continue() : request.abort()));
                },
            });
            const response = await this.session.page.goto(url, { waitUntil: 'load', timeout: 30000 });
            if (!response || response.status() !== 200) {
                throw new Error(`Springer browser response failed for ${url}. Only publicly readable journal pages are supported.`);
            }
            const html = await response.text();
            if (html.includes('<title>Client Challenge</title>')) {
                throw new Error('Springer returned a client challenge in the browser. Retry when the public page is available.');
            }
            return html;
        })();
        this.queue = settleRequest(pending);
        return pending;
    }

    async destroy() {
        await this.queue;
        if (this.session) {
            await this.session.destroy();
        }
    }
}

async function settleRequest(promise: Promise<unknown>): Promise<void> {
    try {
        await promise;
    } catch {
        // Keep queue scheduling alive; the caller still receives the original request rejection.
    }
}

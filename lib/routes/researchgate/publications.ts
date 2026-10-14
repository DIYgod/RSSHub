import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { getPlaywrightPage } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/publications/:id',
    categories: ['study'],
    example: '/researchgate/publications/Somsak-Panha',
    parameters: { id: 'Username, can be found in URL' },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
    },
    radar: [
        {
            source: ['researchgate.net/profile/:id'],
            target: '/publications/:id',
        },
    ],
    name: 'Publications',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.researchgate.net';
    const currentUrl = `${rootUrl}/profile/${id}`;
    const { page, destroy } = await getPlaywrightPage(currentUrl, { noGoto: true, closeTimeout: 0 });
    try {
        await page.route('**/*', (route) => {
            const request = route.request();
            request.resourceType() === 'document' || request.resourceType() === 'script' ? route.continue() : route.abort();
        });
        await page.goto(currentUrl);
        const response = await page.evaluate(() => document.documentElement.getHTML());

        const $ = load(response);

        const list = $('div[itemprop="headline"] a')
            .toArray()
            .slice(0, getRouteLimit(ctx, 15))
            .map((item): DataItem => {
                const $item = $(item);
                return {
                    title: $item.text(),
                    link: $item.attr('href'),
                };
            });

        const items = await pMap(
            list,
            (item) =>
                cache.tryGet(item.link!, async () => {
                    await page.goto(item.link!);
                    const detailResponse = await page.evaluate(() => document.documentElement.getHTML());
                    const content = load(detailResponse);

                    item.doi = content('meta[property="citation_doi"]').attr('content');
                    const pubDate = content('meta[property="citation_publication_date"]').attr('content')?.trim();
                    item.pubDate = pubDate ? parseDate(pubDate) : undefined;

                    const authors: any[] = [];

                    content('meta[property="citation_author"]').each((_, el) => {
                        authors.push(content(el).attr('content'));
                    });

                    item.author = authors.join(', ');

                    item.description = content('div[itemprop="description"]').html();

                    return item;
                }),
            { concurrency: 1 }
        );

        return {
            title: `${$('meta[property="profile:username"]').attr('content')}'s Publications - ResearchGate`,
            link: currentUrl,
            item: items,
        };
    } finally {
        await destroy();
    }
}

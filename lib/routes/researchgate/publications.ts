import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/publications/:id',
    radar: [
        {
            source: ['researchgate.net/profile/:username'],
            target: '/publications/:username',
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const rootUrl = 'https://www.researchgate.net';
    const currentUrl = `${rootUrl}/profile/${id}`;
    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(currentUrl);
    const response = await page.evaluate(() => document.documentElement.innerHTML);
    await page.close();

    const $ = load(response);

    const list = $('div[itemprop="headline"] a')
        .toArray()
        .slice(0, ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 15)
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
                });
                await page.goto(item.link);
                const detailResponse = await page.evaluate(() => document.documentElement.innerHTML);
                await page.close();
                const content = load(detailResponse);

                item.doi = content('meta[property="citation_doi"]').attr('content');
                item.pubDate = parseDate(content('meta[property="citation_publication_date"]').attr('content'));

                const authors = [];

                content('meta[property="citation_author"]').each(function () {
                    authors.push(content(this).attr('content'));
                });

                item.author = authors.join(', ');

                item.description = content('div[itemprop="description"]').html();

                return item;
            })
        )
    );

    await browser.close();

    return {
        title: `${$('meta[property="profile:username"]').attr('content')}'s Publications - ResearchGate`,
        link: currentUrl,
        item: items,
    };
}

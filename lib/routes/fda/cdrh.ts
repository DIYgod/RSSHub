import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

export const route: Route = {
    path: '/cdrh/:titleOnly?',
    categories: ['government'],
    example: '/fda/cdrh',
    parameters: { titleOnly: 'Title only, empty by default which includes the full text, any other value shows the title only' },
    radar: [
        {
            source: ['fda.gov/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates', 'fda.gov/'],
            target: '/cdrh',
        },
    ],
    name: 'CDRHNew',
    maintainers: ['nczitzk'],
    handler,
    url: 'fda.gov/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates',
};

async function handler(ctx) {
    const titleOnly = !!(ctx.req.param('titleOnly') ?? '');
    const rootUrl = 'https://www.fda.gov';
    const currentUrl = `${rootUrl}/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const seen = new Set<string>();
    let items = $('div[role="main"] h2')
        .toArray()
        .flatMap((heading) => {
            const $heading = $(heading);
            const date = $heading.text().trim();
            if (!/^[A-Z][a-z]+ \d{1,2}, \d{4}$/.test(date)) {
                return [];
            }
            const pubDate = parseDate(`${date} UTC`);
            return $heading
                .nextUntil('h2')
                .find('li > a[href]')
                .toArray()
                .map((item): DataItem => {
                    const title = $(item).text();
                    const link = new URL($(item).attr('href')!, rootUrl).href;
                    return { title, link, pubDate, guid: `${link}#${title}#${date}` };
                });
        })
        .filter((item) => {
            if (seen.has(item.guid!)) {
                return false;
            }
            seen.add(item.guid!);
            return true;
        })
        .slice(0, getRouteLimit(ctx, 30));

    items = items.map((item) => ({ ...item, guid: titleOnly ? `${item.guid}#titleOnly` : item.guid }));
    if (!titleOnly) {
        items = await pMap(
            items,
            (item) =>
                cache.tryGet(item.guid!, async () => {
                    const detailResponse = await got({ method: 'get', url: item.link });
                    const content = load(detailResponse.data);
                    item.author = content('meta[property="article:publisher"]').attr('content');
                    const article = content('div[role="main"], .doc-content-area');
                    article.find('.document-headings .fr-seal-meta').remove();
                    item.description = article.html();
                    return item;
                }),
            { concurrency: 3 }
        );
    }

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

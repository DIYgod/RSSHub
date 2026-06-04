import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/cdrh/:titleOnly?',
    radar: [
        {
            source: ['fda.gov/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates', 'fda.gov/'],
            target: '/cdrh/:titleOnly',
        },
    ],
    name: 'Unknown',
    maintainers: [],
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

    let items = $('div[role="main"] a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.startsWith('http') ? link : `${rootUrl}${link}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(titleOnly ? `${item.link}#${item.title}#titleOnly` : `${item.link}#${item.title}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('meta[property="article:publisher"]').attr('content');

                try {
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content').split(', ').pop(), 'MM/DD/YYYY - HH:mm');
                } catch {
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                }

                item.description = titleOnly ? null : content('div[role="main"], .doc-content-area').html();
                item.guid = titleOnly ? `${item.link}#${item.title}#titleOnly` : `${item.link}#${item.title}`;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}

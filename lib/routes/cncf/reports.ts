import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.cncf.io';

export const route: Route = {
    path: '/reports',
    categories: ['programming'],
    example: '/cncf/reports',
    radar: [
        {
            source: ['cncf.io/reports'],
        },
    ],
    name: 'Reports',
    maintainers: ['Fatpandac'],
    handler,
    url: 'cncf.io/reports',
};

async function handler() {
    const url = `${rootURL}/reports/`;
    const response = await got(url);
    const $ = load(response.data);
    const list: DataItem[] = $('div.report-item')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('a.report-item__link').attr('title')!,
            link: $(item).find('a.report-item__link').attr('href'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                const publicationDate = content('meta[property="article:published_time"]').attr('content') || content('p.is-style-spaced-uppercase').text().split(':', 2)[1];
                item.pubDate = publicationDate ? parseDate(publicationDate) : undefined;
                const article = content('article');
                article.find('.social-share').remove();
                item.description = article.html();

                return item;
            })
        )
    );

    return {
        title: 'CNCF - Reports',
        link: url,
        item: items,
    };
}

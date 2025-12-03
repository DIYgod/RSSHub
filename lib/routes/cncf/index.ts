import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootURL = 'https://www.cncf.io';

export const route: Route = {
    path: '/:cate?',
    categories: ['programming'],
    example: '/cncf',
    parameters: { cate: 'blog by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['Fatpandac'],
    handler,
    description: `| Blog | News | Announcements | Reports |
| ---- | ---- | ------------- | ------- |
| blog | news | announcements | reports |`,
};

async function handler(ctx) {
    const cate = ctx.req.param('cate') ?? 'blog';
    const url = `${rootURL}/${cate}/`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('h1.is-style-page-title').text();
    const list = $('div.post-archive__item')
        .toArray()
        .map((item) => ({
            title: $(item).find('span.post-archive__title').text().trim(),
            link: $(item).find('span.post-archive__title > a').attr('href'),
            pubDate: parseDate($(item).find('span.post-archive__item_date').text().split('|')[0]),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                content('div.post-author').remove();
                content('div.social-share').remove();

                item.description = content('article').html();

                return item;
            })
        )
    );

    return {
        title: `CNCF - ${title}`,
        link: url,
        item: items,
    };
}

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/photo/jx',
    categories: ['traditional-media'],
    example: '/cctv/photo/jx',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['photo.cctv.com/jx', 'photo.cctv.com/'],
        },
    ],
    name: '央视网图片《镜象》',
    maintainers: ['nczitzk'],
    handler,
    url: 'photo.cctv.com/jx',
};

async function handler(ctx) {
    const rootUrl = 'https://photo.cctv.com';
    const currentUrl = `${rootUrl}/jx/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.textr a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .toArray()
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
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                const date = content('head')
                    .html()
                    .match(/publishDate ="(.*) ";/)[1];
                item.pubDate = date ? parseDate(date, 'YYYYMMDDHHmmss') : null;

                item.description = content('.tujitop').html();

                return item;
            })
        )
    );

    return {
        title: '央视网图片《镜象》',
        link: currentUrl,
        item: items,
    };
}

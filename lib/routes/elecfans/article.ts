import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/article/:atype',
    categories: ['programming'],
    example: '/elecfans/article/special',
    parameters: { atype: '需获取文章的类别' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    radar: [
        {
            source: ['www.elecfans.com'],
        },
    ],
    maintainers: ['tian051011'],
    handler: async (ctx) => {
        const { atype } = ctx.req.param();
        const response = await ofetch(`https://www.elecfans.com/article/${atype}/`);
        const $ = load(response);
        const list = $('#mainContent li')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('a').eq(1);
                return {
                    title: a.text(),
                    link: String(a.attr('href')),
                };
            });
        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    item.pubDate = parseDate($('.article-info .time').first().text());
                    item.author = $('.article-info a').first().text();
                    item.description = $('.rticle-content .simditor-body').first().html();
                    item.category = $('.hot-main li > span')
                        .toArray()
                        .map((item) => $(item).text().trim());

                    return item;
                })
            )
        );
        return {
            title: `elecfans ${atype} articles`,
            link: `https://www.elecfans.com/article/${atype}/`,
            item: items,
        };
    },
};

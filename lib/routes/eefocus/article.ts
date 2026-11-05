import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rf/article',
    categories: ['bbs'],
    example: '/eefocus/rf/article',
    name: '文章',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://rf.eefocus.com/article/';
    const response = await ofetch(rootUrl);
    const $ = load(response);

    const limit = getRouteLimit(ctx, 10);
    const detailLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(10, limit);
    const list = $('h3.media-heading')
        .slice(0, detailLimit)
        .toArray()
        .map((item) => {
            const a = $(item).find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, 'https://rf.eefocus.com/').href,
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const res = await ofetch(item.link);
                const content = load(res);
                return {
                    ...item,
                    pubDate: timezone(parseDate(content('div.article-subline-desc').eq(0).text().replace('发布时间：', '')), 8),
                    description: content('div.clearfix.article-content').html(),
                    category: content('.tag-terms a')
                        .toArray()
                        .map((tag) => content(tag).text()),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: 'RF技术社区 - 文章',
        link: rootUrl,
        item: items,
    };
}

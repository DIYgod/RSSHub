import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/zsjy/:category?',
    categories: ['university'],
    example: '/sicau/zsjy/bkszs',
    parameters: { category: '分类，见下表，默认为本科生招生' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['dky.sicau.edu.cn/'],
        },
    ],
    name: '招生就业',
    maintainers: ['nczitzk'],
    handler,
    url: 'dky.sicau.edu.cn/',
    description: `| 本科生招生 | 研究生招生 | 毕业生选录指南 |
| ---------- | ---------- | -------------- |
| bkszs      | yjszs      | bysxlzn        |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'bkszs';

    const rootUrl = 'https://dky.sicau.edu.cn';
    const currentUrl = `${rootUrl}/zsjy/${category}.htm`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('a.tit')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                pubDate: parseDate(item.prev().text()),
                link: `${rootUrl}${item.attr('href').replace(/\.\./, '/')}`,
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

                content('.v_news_content p').slice(0, 2).remove();

                item.description = content('.v_news_content').html();

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

import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { finishArticleItem } from '@/utils/wechat-mp';

const host = 'https://www.ipo.sdu.edu.cn/';

const typeMap = {
    tzgg: {
        title: '通知公告',
        url: 'tzgg.htm',
    },
};

export const route: Route = {
    path: '/gjsw/:type?',
    categories: ['university'],
    example: '/sdu/gjsw/tzgg',
    parameters: { type: '默认为`tzgg`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '国际事务部',
    maintainers: ['kukeya'],
    handler,
    description: `| 通知公告 |
| -------- |
| tzgg     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'tzgg';

    const link = new URL(typeMap[type].url, host).href;
    const response = await got(link);

    const $ = load(response.data);

    let item = $('.dqlb ul li')
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            const a = $e.find('a');
            return {
                title: a.text().trim(),
                link: new URL(a.attr('href')!, link).href,
                pubDate: parseDateInTimezone($e.find('.fr').text().trim(), 8),
            };
        });

    item = await pMap(
        item,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`gjsw:article-v2:${item.link}`, async () => {
                const hostname = new URL(item.link!).hostname;
                if (hostname === 'mp.weixin.qq.com') {
                    return finishArticleItem(item);
                }
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('.v_news_content').html();

                return { description: item.description };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: `山东大学国际事务部${typeMap[type].title}`,
        description: $('title').text(),
        link,
        item,
    };
}

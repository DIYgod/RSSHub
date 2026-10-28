import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.qztc.edu.cn/';

export const route: Route = {
    path: '/home/:type',
    categories: ['university'],
    example: '/qztc/home/2093',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['iQNRen'],
    url: 'www.qztc.edu.cn',
    handler,
    radar: [
        {
            source: ['www.qztc.edu.cn/:type/list.htm'],
            target: '/home/:type',
        },
    ],
    description: `| 板块     | 参数 |
| -------- | ---- |
| 泉师新闻 | 2093 |
| 通知公告 | 2094 |
| 采购公告 | 2095 |
| 学术资讯 | xszx |
| 招聘信息 | 2226 |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    // const type = Number.parseInt(ctx.req.param('type'));
    const currentUrl = `${rootUrl}${type === '2093' ? 'xw' : type}/list.htm`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('.news.clearfix')
        .toArray()
        .map((item) => {
            const cheerioItem = $(item);
            const a = cheerioItem.find('a');

            try {
                const title = a.attr('title') || '';
                let link = a.attr('href');
                if (!link) {
                    link = '';
                } else if (!link.startsWith('http')) {
                    link = rootUrl.slice(0, -1) + link;
                }
                const pubDate = timezone(parseDate(cheerioItem.find('.news_meta').text()), 8);

                return {
                    title,
                    link,
                    pubDate,
                };
            } catch {
                return {
                    title: '',
                    link: '',
                    pubDate: Date.now(),
                };
            }
        })
        .filter((item) => item.title && item.link);

    const items = await pMap(
        list,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`qztc:home:article:v2:${item.link}`, async () => {
                const response = await ofetch(item.link);
                const detail = load(response);
                return detail('.wp_articlecontent').html() ?? '';
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head > title').text() + ' - 泉州师范学院-首页',
        link: currentUrl,
        item: items,
    } satisfies Data;
}

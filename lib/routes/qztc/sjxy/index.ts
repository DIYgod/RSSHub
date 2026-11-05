import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.qztc.edu.cn/sjxy/';
const host = 'www.qztc.edu.cn';

export const route: Route = {
    path: '/sjxy/:type',
    categories: ['university'],
    example: '/qztc/sjxy/1939',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '数学与计算机科学学院 软件学院',
    maintainers: ['iQNRen'],
    url: 'www.qztc.edu.cn',
    handler,
    radar: [
        {
            source: ['www.qztc.edu.cn/sjxy/:type/list.htm'],
            target: '/sjxy/:type',
        },
    ],
    description: `| 板块     | 参数 |
| -------- | ---- |
| 学院概况 | 1938 |
| 学院动态 | 1939 |
| 学科建设 | 1940 |
| 教学教务 | 1941 |
| 人才培养 | 1942 |
| 科研工作 | 1943 |
| 党群工作 | 1944 |
| 团学工作 | 1945 |
| 资料下载 | 1947 |
| 采购信息 | 1948 |
| 信息公开 | xxgk |`,
    // | 学院简介 | 1949 |
    // | 学院领导 | 1950 |
    // | 组织机构 | 1951 |
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    // const type = Number.parseInt(ctx.req.param('type'));
    const response = await ofetch(rootUrl + type + '/list.htm');
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
                    link = new URL(link, rootUrl).href;
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
            description: await cache.tryGet(`qztc:sjxy:article:v2:${item.link}`, async () => {
                const url = new URL(item.link);
                if (url.hostname !== host || url.pathname.startsWith('/_upload')) {
                    return item.link;
                }
                const response = await ofetch(item.link);
                const $ = load(response);
                return $('.wp_articlecontent').html() ?? '';
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head > title').text() + ' - 泉州师范学院-数学与计算机科学学院 软件学院',
        link: rootUrl + type + '/list.htm',
        item: items,
    } satisfies Data;
}

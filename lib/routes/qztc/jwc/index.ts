import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.qztc.edu.cn/jwc/';
const host = 'www.qztc.edu.cn';

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/qztc/jwc/jwdt',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '教务处',
    maintainers: ['iQNRen'],
    url: 'www.qztc.edu.cn',
    handler,
    radar: [
        {
            source: ['www.qztc.edu.cn/jwc/:type/list.htm'],
            target: '/jwc/:type',
        },
    ],
    description: `| 板块     | 参数 |
| -------- | ---- |
| 教务动态 | jwdt |
| 首 页    | 1020 |
| 岗位介绍 | 1021 |
| 管理文件 | 1022 |
| 教学教改 | 1023 |
| 办事指南 | 1024 |
| 通知公告 | 1025 |
| 下载中心 | 1026 |
| 对外交流 | 1027 |
| 政策文件 | 1028 |
| 会议纪要 | 1029 |`,
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
            description: await cache.tryGet(`qztc:jwc:article:v2:${item.link}`, async () => {
                const url = new URL(item.link);
                if (url.hostname !== host || url.pathname.startsWith('/_upload')) {
                    return item.link;
                }
                try {
                    const response = await ofetch(item.link);
                    const $ = load(response);
                    return $('.wp_articlecontent').html() ?? '';
                } catch (error) {
                    if (error instanceof FetchError && error.statusCode === 403) {
                        // Keep the public listing metadata when a detail page forbids anonymous access.
                        return;
                    }
                    throw error;
                }
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head > title').text() + ' - 泉州师范学院-教务处',
        link: rootUrl + type + '/list.htm',
        item: items,
    } satisfies Data;
}

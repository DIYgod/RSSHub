import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://jwc.shmtu.edu.cn';

async function loadContent(link) {
    const response = await got(link);
    const $ = load(response.data);

    return $('.wp_articlecontent').html();
}

const processFeed = (list: Array<DataItem & { link: string }>, caches: typeof cache) =>
    pMap(
        list,
        async (item) => {
            const details = await caches.tryGet(`shmtu:jwc:v2:${item.link}`, async () => {
                item.description = await loadContent(item.link);
                return { description: item.description };
            });
            return { ...item, ...details };
        },
        { concurrency: 3 }
    );

export const route: Route = {
    path: '/jwc/:type',
    categories: ['university'],
    example: '/shmtu/jwc/jwgg',
    parameters: { type: '类型名称' },
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
            source: ['jwc.shmtu.edu.cn/:type/list.htm', 'jwc.shmtu.edu.cn/:type'],
        },
    ],
    name: '教务信息',
    maintainers: ['imbytecat', 'simonsmh'],
    handler,
    description: `| 教务公告 | 教务新闻 |
| -------- | -------- |
| jwgg     | jwxw     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const info = type === 'jwgg' ? '教务公告' : '教务新闻';

    const response = await got(`${host}/${type}/list.htm`, {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const list = $('.news_list .news')
        .toArray()
        .flatMap((item) => {
            const $item = $(item);
            const href = $item.find('a[href]').attr('href');
            const title = $item.find('.news_title .ttbox').text();
            return href && title ? { title, link: new URL(href, host).href, pubDate: timezone(parseDate($item.find('.news_time').text()), 8) } : [];
        });

    const result = await processFeed(list, cache);

    return {
        title: `上海海事大学 ${info}`,
        link: `${host}/${type}`,
        description: '上海海事大学 教务信息',
        item: result,
    };
}

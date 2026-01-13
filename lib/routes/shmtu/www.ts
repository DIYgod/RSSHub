import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const host = 'https://www.shmtu.edu.cn';

async function loadContent(link) {
    const response = await got(link);
    const $ = load(response.data);

    return $('article').html();
}

const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map((item) =>
            caches.tryGet(item.link, async () => {
                item.description = await loadContent(item.link);

                return item;
            })
        )
    );

export const route: Route = {
    path: '/www/:type',
    categories: ['university'],
    example: '/shmtu/www/events',
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
            source: ['www.shmtu.edu.cn/:type'],
        },
    ],
    name: '官网信息',
    maintainers: ['imbytecat', 'simonsmh'],
    handler,
    description: `| 学术讲座 | 通知公告 |
| -------- | -------- |
| events   | notes    |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const info = type === 'notes' ? '通知公告' : '学术讲座';

    const response = await got(`${host}/${type}`, {
        headers: {
            Referer: host,
        },
    });

    const $ = load(response.data);
    const list = $('tbody tr')
        .toArray()
        .map((item) => {
            item = $(item);
            const category = item.find('.department').text().trim();
            return {
                title: item.find('.title a').text().trim(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: parseDate(item.find('.date-display-single').attr('content')),
                category,
                author: category,
            };
        });

    const result = await ProcessFeed(list, cache);

    return {
        title: `上海海事大学 ${info}`,
        link: `${host}/${type}`,
        description: '上海海事大学 官网信息',
        item: result,
    };
}

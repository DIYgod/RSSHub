import { load } from 'cheerio';

import type { Route } from '@/types';
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
            source: ['jwc.shmtu.edu.cn/:type'],
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
    const list = $('tbody tr')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('.views-field-nothing a').attr('title').trim(),
                link: new URL(item.find('a').attr('href'), host).href,
                pubDate: timezone(parseDate(item.find('.pubdate').text()), 8),
                category: item.find('.views-field-field-xxlb').text(),
                author: item.find('.views-field-field-xxly').text(),
            };
        });

    const result = await ProcessFeed(list, cache);

    return {
        title: `上海海事大学 ${info}`,
        link: `${host}/${type}`,
        description: '上海海事大学 教务信息',
        item: result,
    };
}

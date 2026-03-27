import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/it/:type?',
    categories: ['university'],
    example: '/ouc/it/0',
    parameters: { type: '默认为 `0`' },
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
            source: ['it.ouc.edu.cn/'],
            target: '/it',
        },
    ],
    name: '信息科学与工程学院',
    maintainers: ['GeoffreyChen777', '3401797899'],
    handler,
    url: 'it.ouc.edu.cn/',
    description: `| 学院要闻 | 学院公告 | 学院活动 |
| -------- | -------- | -------- |
| 0        | 1        | 2        |`,
};

async function handler(ctx) {
    const host = 'https://it.ouc.edu.cn';
    const typelist = ['学院要闻', '学院公告', '学术活动'];
    const urlList = ['xyyw/list.htm', 'xygg/list.htm', 'xshd/list.htm'];
    const type = Number.parseInt(ctx.req.param('type')) || 0;
    const link = new URL(urlList[type], host).href;
    const response = await got(link);
    const $ = load(response.data);

    const list = $('.col_news_list .news_list li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('span.news_meta').text(), 'YYYY-MM-DD'),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.author = '中国海洋大学信息科学与工程学院';
                item.description = $('.wp_articlecontent').html();
                return item;
            })
        )
    );

    return {
        title: `中国海洋大学信息科学与工程学院${typelist[type]}`,
        link,
        item: out,
    };
}

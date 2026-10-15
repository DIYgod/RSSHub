import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

async function fetch(address) {
    const res = await got(address);
    const $ = load(res.data);
    const pubDate = $('.details-time')
        .text()
        .match(/时间：(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/)?.[1];
    const content = $('[name="_newscontent_fromname"]');
    content.children('h1, .details-time').remove();
    content.find('script').remove();
    return {
        description: content.html(),
        link: address,
        guid: address,
        pubDate: pubDate ? timezone(parseDate(pubDate, 'YYYY年MM月DD日 HH:mm'), 8) : undefined,
    };
}

export const route: Route = {
    path: '/cse/:type?',
    categories: ['university'],
    example: '/csu/cse',
    parameters: { type: '类型' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '计算机学院',
    maintainers: ['j1g5awi'],
    handler,
    description: `| 类型 | 学院新闻 | 通知公告 | 学术信息 | 学工动态 | 科研动态 |
| ---- | -------- | -------- | -------- | -------- | -------- |
| 参数 | xyxw     | tzgg     | xsxx     | xgdt     | kydt     |`,
};

async function handler(ctx) {
    const url = 'https://cse.csu.edu.cn/index/';
    const type = ctx.req.param('type') ?? 'tzgg';
    const link = url + type + '.htm';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('.download li').toArray();
    const out = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const address = new URL($('a').attr('href')!, url).href;
            const title = $('a').text();
            const pubDate = $('span').text();
            return cache.tryGet(address, async () => {
                const fetched = await fetch(address);
                const single: DataItem = {
                    ...fetched,
                    title,
                    pubDate: fetched.pubDate ?? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8),
                };
                return single;
            });
        })
    );
    return {
        title: $('title').text(),
        link,
        item: out,
    };
}

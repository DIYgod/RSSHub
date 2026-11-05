import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.cqwu.edu.cn';
const map = {
    notify: '/channel_24894.html',
    academiceve: '/channel_25646.html',
};
const titleMap = {
    notify: '通知',
    academiceve: '学术活动',
};

export const route: Route = {
    path: '/news/:type?',
    categories: ['university'],
    example: '/cqwu/news/academiceve',
    parameters: { type: '可选，默认为 academiceve ' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 通知公告 | 学术活动公告 |
| -------- | ------------ |
| notify   | academiceve  |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'academiceve';
    if (!Object.hasOwn(map, type)) {
        throw new InvalidParameterError('Invalid type. Use notify or academiceve.');
    }
    const link = host + map[type];
    const title = '重文理' + titleMap[type] + '公告';
    const response = await got.get(link);
    const $ = load(response.data);
    const list = $('div[class="list"] ul').find('li');

    const items = await Promise.all(
        list.map(async (i, item) => {
            const pageUrl = new URL($(item).find('a').attr('href')!, link).href;
            const {
                title: detailTitle,
                desc,
                pubDate,
            } = await cache.tryGet(pageUrl, async () => {
                const page = await got.get(pageUrl);
                const $ = load(page.data);
                const dateText = $('.abs span:nth-child(1)').text().replace('发布时间：', '');
                return {
                    title: $('.abs').prev('.title').text(),
                    desc: $('.contentAtice').html(),
                    pubDate: dateText ? timezone(parseDate(dateText, 'YYYY-MM-DD HH:mm'), 8) : undefined,
                };
            });

            const listDate = $(item).find('.time').text();
            return {
                title: detailTitle || $(item).find('.title').text(),
                link: pageUrl,
                description: desc,
                pubDate: pubDate || (/^\d{4}-\d{2}-\d{2}$/.test(listDate) ? timezone(parseDate(listDate, 'YYYY-MM-DD'), 8) : undefined),
            };
        })
    );

    return {
        title,
        link,
        item: items,
    };
}

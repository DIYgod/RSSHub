import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/developer/group/:type',
    categories: ['programming'],
    example: '/aliyun/developer/group/alitech',
    parameters: { type: '对应技术领域分类' },
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
            source: ['developer.aliyun.com/group/:type'],
        },
    ],
    name: '开发者社区 - 主题',
    maintainers: ['umm233'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = `https://developer.aliyun.com/group/${type}`;

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = load(data);
    const title = $('.header-information-title').text().trim();
    const desc = $('.header-information p').text();
    const list = $('ul[class^="content-tab-list"] > li');

    return {
        title: `阿里云开发者社区-${title}`,
        link,
        description: desc,
        item: list.toArray().map((item) => {
            const $item = $(item);
            const date = $item.find('.time').text();
            const href = $item.find('a').first().attr('href');
            return {
                title: $item.find('h3').first().text() || $item.find('.question-title').text() || $item.find('a p').text(),
                link: href ? new URL(href, link).href : undefined,
                pubDate: /^\d{4}-\d{2}-\d{2}/.test(date) ? timezone(parseDate(date), 8) : undefined,
                author: $item.find('.user').text() || undefined,
                category: $item.find('.tag').text() || undefined,
                image: $item.find('img').attr('src'),
            };
        }),
    };
}

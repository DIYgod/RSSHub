import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseTitle = 'NUIST CS（南信大计软院）';
const baseUrl = 'https://scs.nuist.edu.cn';

export const route: Route = {
    path: '/scs/:category?',
    categories: ['university'],
    example: '/nuist/scs/xwkx',
    parameters: { category: '默认为新闻快讯' },
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
            source: ['scs.nuist.edu.cn/:category/list.htm'],
            target: '/scs/:category',
        },
    ],
    name: 'NUIST CS（南信大计软院）',
    maintainers: ['gylidian'],
    handler,
    description: `| 新闻快讯 | 通知公告 | 教务信息 | 科研动态 | 学子风采 |
| -------- | -------- | -------- | -------- | -------- |
| xwkx     | tzgg     | jwxx     | kydt     | xzfc     |`,
};

async function handler(ctx) {
    const { category = 'xwkx' } = ctx.req.param();
    const link = `${baseUrl}/${category}/list.htm`;

    const response = await got(link);
    const $ = load(response.data);

    const list = $('.newsList ul')
        .eq(0)
        .find('li')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').attr('title'),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.newsDate').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const authorMatch = $('.newsTitleAddDate')
                    .text()
                    .match(/发布者：(.*)发布时间/);
                item.author = authorMatch ? authorMatch[1].trim() : null;
                item.description = $('.newsContent').html();
                return item;
            })
        )
    );

    return {
        title: baseTitle + '：' + $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        link,
        item: items,
    };
}

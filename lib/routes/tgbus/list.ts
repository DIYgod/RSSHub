import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { parseArticle } from './utils';

type Category = 'news' | 'review' | 'video' | 'special' | 'hardware';

const categories: Record<Category, string> = {
    news: '最新资讯',
    review: '游戏评测',
    video: '游戏视频',
    special: '巴士首页特稿',
    hardware: '硬件资讯',
};

export const route: Route = {
    path: '/list/:category',
    parameters: {
        category: '列表分类，见下表',
    },
    categories: ['game'],
    example: '/tgbus/list/news',
    radar: [
        {
            source: ['www.tgbus.com/list/:category/'],
            target: '/list/:category',
        },
    ],
    name: '文章列表',
    maintainers: ['Xzonn'],
    handler,
    description: `| 最新资讯 | 游戏评测 | 游戏视频 | 巴士首页特稿 | 硬件资讯 |
| -------- | -------- | -------- | ------------ | -------- |
| news     | review   | video    | special      | hardware |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') as Category;
    const listUrl = `https://www.tgbus.com/list/${category}/`;

    const res = await got(listUrl);
    const $ = load(res.data as unknown as string);
    const list = $('div.special-infocard')
        .toArray()
        .map((item) => {
            const element = $(item);
            const a = element.find('a');
            return {
                title: element.find('div.title').text(),
                link: `https://www.tgbus.com${a.attr('href')}`,
                description: element.find('div.content').text(),
                pubDate: timezone(parseDate(element.find('div.info span:nth-child(3)').text().trim()), 8),
            };
        });

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `${categories[category]} - 电玩巴士`,
        description: $('meta[name="description"]').attr('content'),
        link: listUrl,
        item: out,
    };
}

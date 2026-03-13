import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news-cn/:category?',
    categories: ['game'],
    example: '/blizzard/news-cn/ow',
    parameters: { category: '游戏类别, 默认为 ow' },
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
            source: ['ow.blizzard.cn', 'wow.blizzard.cn', 'hs.blizzard.cn'],
            target: '/news-cn/',
        },
    ],
    name: '暴雪游戏国服新闻',
    maintainers: ['zhangpeng2k'],
    description: `
| 守望先锋 | 炉石传说 | 魔兽世界 |
|----------|----------|---------|
| ow       | hs       | wow     |
`,
    handler,
};

const categoryNames = {
    ow: '守望先锋',
    hs: '炉石传说',
    wow: '魔兽世界',
};

/* 列表解析逻辑 */
const parsers = {
    ow: ($) =>
        $('.list-data-container .list-item-container')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('.content-title').text(),
                    link: item.find('.fill-link').attr('href'),
                    description: item.find('.content-intro').text(),
                    pubDate: parseDate(item.find('.content-date').text()),
                    image: item.find('.item-pic').attr('src'),
                };
            }),
    hs: ($) =>
        $('.article-container>a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('.title').text(),
                    link: item.attr('href'),
                    description: item.find('.desc').text(),
                    pubDate: parseDate(item.find('.date').attr('data-time')),
                    image: item.find('.article-img img').attr('src'),
                };
            }),
    wow: ($) =>
        $('.Pane-list>a')
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('.list-title').text(),
                    link: item.attr('href'),
                    description: item.find('.list-desc').text(),
                    pubDate: parseDate(item.find('.list-time').attr('data-time')),
                    image: item.find('.img-box img').attr('src'),
                };
            }),
};

// 详情页解析逻辑
const detailParsers = {
    ow: ($) => $('.deatil-content').first().html(),
    hs: ($) => $('.article').first().html(),
    wow: ($) => $('.detail').first().html(),
};

function getList(category, $) {
    return parsers[category] ? parsers[category]($) : [];
}

async function fetchDetail(item, category) {
    return await cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);

        const parseDetail = detailParsers[category];
        item.description = parseDetail($);
        return item;
    });
}

async function handler(ctx) {
    const category = ctx.req.param('category') || 'ow';
    if (!categoryNames[category]) {
        throw new Error('Invalid category');
    }

    const rootUrl = `https://${category}.blizzard.cn/news`;

    const response = await ofetch(rootUrl);
    const $ = load(response);

    const list = getList(category, $);
    if (!list.length) {
        throw new Error('No news found');
    }

    const items = await Promise.all(list.map((item) => fetchDetail(item, category)));

    return {
        title: `${categoryNames[category]}新闻`,
        link: rootUrl,
        item: items,
    };
}

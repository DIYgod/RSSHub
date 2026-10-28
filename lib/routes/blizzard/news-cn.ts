import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
            source: ['ow.blizzard.cn/news', 'ow.blizzard.cn'],
            target: '/news-cn/ow',
        },
        {
            source: ['wow.blizzard.cn/news', 'wow.blizzard.cn'],
            target: '/news-cn/wow',
        },
        {
            source: ['hs.blizzard.cn/news', 'hs.blizzard.cn'],
            target: '/news-cn/hs',
        },
    ],
    name: '暴雪游戏国服新闻',
    maintainers: ['zhangpeng2k'],
    description: `| 守望先锋 | 炉石传说 | 魔兽世界 |
| -------- | -------- | -------- |
| ow       | hs       | wow      |`,
    handler,
};

const categoryNames = {
    ow: '守望先锋',
    hs: '炉石传说',
    wow: '魔兽世界',
};

// List parsers.
const parsers = {
    ow: ($) =>
        $('.list-data-container .list-item-container')
            .toArray()
            .map((item) => {
                const $item = $(item);
                return {
                    title: $item.find('.content-title').text(),
                    link: $item.find('.fill-link').attr('href'),
                    description: $item.find('.content-intro').text(),
                    pubDate: timezone(parseDate($item.find('.content-date').text()), 8),
                    image: $item.find('.item-pic').attr('src'),
                };
            }),
    hs: ($) =>
        $('.article-container>a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const timestamp = $item.find('.date').attr('data-timestamp');
                return {
                    title: $item.find('.title').text(),
                    link: $item.attr('href'),
                    description: $item.find('.desc').text(),
                    pubDate: timestamp ? parseDate(Number(timestamp)) : undefined,
                    image: $item.find('.article-img img').attr('src'),
                };
            }),
    wow: ($) =>
        $('.Pane-list>a')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const timestamp = $item.find('.list-time').attr('data-timestamp');
                return {
                    title: $item.find('.list-title').text(),
                    link: $item.attr('href'),
                    description: $item.find('.list-desc').text(),
                    pubDate: timestamp ? parseDate(Number(timestamp)) : undefined,
                    image: $item.find('.img-box img').attr('src'),
                };
            }),
};

// Detail parsers.
const detailParsers = {
    ow: ($) => $('.deatil-content').first().html(),
    hs: ($) => $('.article-content').first().html(),
    wow: ($) => $('.detail').first().html(),
};

function getList(category, $) {
    return Object.hasOwn(parsers, category) ? parsers[category]($) : [];
}

async function fetchDetail(item, category) {
    const url = new URL(item.link);
    if (url.hostname !== `${category}.blizzard.cn` || !url.pathname.startsWith('/news/')) {
        return item;
    }
    return await cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);

        const parseDetail = detailParsers[category];
        item.description = parseDetail($) ?? item.description;
        if (category === 'hs') {
            item.author = $('.article-author').first().text();
        }
        return item;
    });
}

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category') || 'ow';
    if (!Object.hasOwn(categoryNames, category)) {
        throw new Error('Invalid category');
    }

    const rootUrl = `https://${category}.blizzard.cn/news`;

    const response = await ofetch(rootUrl);
    const $ = load(response);

    const list = getList(category, $);
    if (!list.length) {
        throw new Error('No news found');
    }

    const selectedList = list;
    const items = await Promise.all(selectedList.map((item) => fetchDetail(item, category)));

    return {
        title: `${categoryNames[category]}新闻`,
        link: rootUrl,
        language: 'zh-CN',
        item: items,
    };
}

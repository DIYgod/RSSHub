import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { rootUrl, ProcessItem } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const categories = {
    24: {
        title: '24小时热榜',
        key: 'homeData.data.hotlist.data',
    },
    renqi: {
        title: '资讯人气榜',
        key: 'hotListData.topList',
    },
    zonghe: {
        title: '资讯综合榜',
        key: 'hotListData.hotList',
    },
    shoucang: {
        title: '资讯综合榜',
        key: 'hotListData.collectList',
    },
};

export const route: Route = {
    path: '/hot-list/:category?',
    categories: ['new-media', 'popular'],
    example: '/36kr/hot-list',
    parameters: { category: '分类，默认为24小时热榜' },
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
            source: ['36kr.com/hot-list/:category', '36kr.com/'],
            target: '/hot-list/:category',
        },
    ],
    name: '资讯热榜',
    maintainers: ['nczitzk'],
    handler,
    description: `| 24 小时热榜 | 资讯人气榜 | 资讯综合榜 | 资讯收藏榜 |
| ----------- | ---------- | ---------- | ---------- |
| 24          | renqi      | zonghe     | shoucang   |`,
};

const getProperty = (object, key) => {
    let result = object;
    const keys = key.split('.');
    for (const k of keys) {
        result = result && result[k];
    }
    return result;
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '24';

    if (!categories[category]) {
        throw new InvalidParameterError('This category does not exist. Please refer to the documentation for the correct usage.');
    }

    const currentUrl = category === '24' ? rootUrl : `${rootUrl}/hot-list/catalog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const data = getProperty(JSON.parse(response.data.match(/window.initialState=({.*})/)[1]), categories[category].key);

    let items = data
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            item = item.templateMaterial ?? item;
            return {
                title: item.widgetTitle.replaceAll(/<\/?em>/g, ''),
                author: item.authorName,
                pubDate: parseDate(item.publishTime),
                link: `${rootUrl}/p/${item.itemId}`,
                description: item.summary,
            };
        });

    items = await Promise.all(items.map((item) => ProcessItem(item, cache.tryGet)));

    return {
        title: `36氪 - ${categories[category].title}`,
        link: currentUrl,
        item: items,
    };
}

import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['travel'],
    example: '/nippon/Politics',
    parameters: { category: '默认政治，可选如下' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['www.nippon.com/cn'] },
        { source: ['www.nippon.com/cn/politics'], target: '/Politics' },
        { source: ['www.nippon.com/cn/economy'], target: '/Economy' },
        { source: ['www.nippon.com/cn/society'], target: '/Society' },
        { source: ['www.nippon.com/cn/culture'], target: '/Culture' },
        { source: ['www.nippon.com/cn/sci-tech'], target: '/Science,Technology' },
        { source: ['www.nippon.com/cn/in-depth'], target: '/In-depth' },
        { source: ['www.nippon.com/cn/japan-topics'], target: '/japan-topics' },
        { source: ['www.nippon.com/cn/japan-data'], target: '/japan-data' },
        { source: ['www.nippon.com/cn/japan-glances'], target: '/japan-glances' },
        { source: ['www.nippon.com/cn/people'], target: '/People' },
        { source: ['www.nippon.com/cn/announcements'], target: '/Announcements' },
    ],
    name: '政治外交',
    description: `| 政治     | 经济    | 社会    | 展览预告 | 焦点专题           | 深度报道 | 话题         | 日本信息库 | 日本一蹩      | 人物访谈 | 编辑部通告    |
| -------- | ------- | ------- | -------- | ------------------ | -------- | ------------ | ---------- | ------------- | -------- | ------------- |
| Politics | Economy | Society | Culture  | Science,Technology | In-depth | japan-topics | japan-data | japan-glances | People   | Announcements |`,
    maintainers: ['laampui'],
    handler,
};

type SearchResult = { title: string; pub_url: string; pub_date: string };

const categoryPaths = {
    Politics: 'politics',
    Economy: 'economy',
    Society: 'society',
    Culture: 'culture',
    'Science,Technology': 'sci-tech',
    'In-depth': 'in-depth',
    'japan-topics': 'japan-topics',
    'japan-data': 'japan-data',
    'japan-glances': 'japan-glances',
    People: 'people',
    Announcements: 'announcements',
} satisfies Record<string, string>;

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'Politics';
    const path = category === 'Science,Technology' ? 'condition4' : 'category_code';
    const res: { data: { body: { dataList: SearchResult[] } } } = await got.get(`https://www.nippon.com/api/search/cn/${path}/20/1/${category}?t=${Date.now()}`);

    const list: Array<DataItem & { link: string }> = res.data.body.dataList.map((item) => ({
        title: item.title,
        link: new URL(item.pub_url, 'https://www.nippon.com').href,
        pubDate: parseDate(item.pub_date),
    }));

    const item = await pMap(
        list.slice(0, 10),
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`nippon:details:v2:${item.link}`, async () => {
                const res = await got.get(item.link);
                const $ = load(res.data);
                return { description: $('.editArea').html() };
            })),
        }),
        { concurrency: 3 }
    );

    const categoryPath = categoryPaths[category];
    return {
        title: `走进日本 - ${category}`,
        link: `https://www.nippon.com/cn/${categoryPath ? `${categoryPath}/` : ''}`,
        item,
    };
}

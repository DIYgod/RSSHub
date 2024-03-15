import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

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
        {
            source: ['www.nippon.com/nippon/:category?', 'www.nippon.com/cn'],
        },
    ],
    name: 'Unknown',
    maintainers: ['laampui'],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'Politics';
    const path = category === 'Science,Technology' ? 'condition4' : 'category_code';
    const res = await got.get(`https://www.nippon.com/api/search/cn/${path}/20/1/${category}?t=${Date.now()}`);

    const list = res.data.body.dataList.map((item) => ({
        title: item.title,
        link: `https://www.nippon.com/${item.pub_url}`,
        pubDate: item.pub_date,
    }));

    const item = await Promise.all(
        list.slice(0, 10).map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got.get(item.link);
                const $ = load(res.data);
                item.description = $('.editArea').html();
                return item;
            })
        )
    );

    return {
        title: `走进日本 - ${category}`,
        link: 'https://www.nippon.com/cn/economy/',
        item,
    };
}

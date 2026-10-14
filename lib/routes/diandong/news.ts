import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const rootUrl = 'https://webapi.diandong.com';

const titleMap = {
    0: '推荐',
    29: '新车',
    61: '导购',
    30: '试驾',
    75: '用车',
    22: '技术',
    24: '政策',
    23: '行业',
};

export const route: Route = {
    path: '/news/:cate?',
    categories: ['new-media'],
    example: '/diandong/news',
    parameters: { cate: '分类，见下表，默认为推荐' },
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
            source: ['diandong.com/news', 'diandong.com/news/:article'],
            target: '/news',
        },
    ],
    name: '资讯',
    maintainers: ['Fatpandac'],
    handler,
    url: 'diandong.com/news',
    description: `分类

| 推荐 | 新车 | 导购 | 试驾 | 用车 | 技术 | 政策 | 行业 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 0    | 29   | 61   | 30   | 75   | 22   | 24   | 23   |`,
};

async function handler(ctx) {
    const cate = ctx.req.param('cate') ?? 0;
    const limit = getRouteLimit(ctx, 25);
    const url = `${rootUrl}/content/list?page=1&size=${limit}&source_id=12&content_type=news&content_ids=&category_id=${cate}`;

    const response = await got(url);
    const data = response.data.data.list;
    const list: Array<DataItem & { link: string; pubDate: Date }> = data.map((item) => ({
        title: item.title,
        pubDate: timezone(parseDate(item.published), 8),
        author: item.author,
        link: `https://www.diandong.com/news/${item.contentid}.html`,
    }));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = $('#gallery-selector').html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `电动邦 - ${titleMap[cate]}`,
        link: 'https://www.diandong.com/news',
        item: items,
    };
}

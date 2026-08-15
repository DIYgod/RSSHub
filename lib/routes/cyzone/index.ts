import type { Route } from '@/types';

import { apiRootUrl, getInfo, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/:id?',
    categories: ['new-media'],
    example: '/cyzone',
    parameters: { id: '频道 id，可在对应频道页 URL 中找到，默认为 news，即最新资讯' },
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
            source: ['cyzone.cn/channel/:id', 'cyzone.cn/'],
            target: '/:id',
        },
    ],
    name: '资讯',
    maintainers: ['nczitzk'],
    handler,
    description: `| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |
| ---- | ------ | ---- | ------ | ---- |
| news | 5      | 14   | 13     | 8    |

| 海外 | 消费 | 科技 | 医疗 | 文娱 |
| ---- | ---- | ---- | ---- | ---- |
| 10   | 9    | 7    | 27   | 11   |

| 城市 | 政策 | 特写 | 干货 | 科技股 |
| ---- | ---- | ---- | ---- | ------ |
| 16   | 15   | 6    | 12   | 33     |`,
};

async function handler(ctx) {
    const { id = 'news' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 5;

    const apiUrl = new URL(`v2/content/channel/${id === 'news' ? 'getArticle' : 'detail'}`, apiRootUrl).href;
    const currentUrl = new URL(`channel/${id}`, rootUrl).href;

    const items = await processItems(
        apiUrl,
        limit,
        id === 'news'
            ? {}
            : {
                  channel_id: id,
              }
    );

    return {
        item: items,
        ...(await getInfo(currentUrl)),
    };
}

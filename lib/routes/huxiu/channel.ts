import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { rootUrl, apiArticleRootUrl, processItems, fetchData } from './util';

export const route: Route = {
    path: ['/article', '/channel/:id?'],
    categories: ['new-media', 'popular'],
    example: '/huxiu/article',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huxiu.com/article'],
        },
    ],
    name: '资讯',
    maintainers: ['HenryQW', 'nczitzk'],
    handler,
    description: `| 视频 | 车与出行 | 年轻一代 | 十亿消费者 | 前沿科技 |
| ---- | -------- | -------- | ---------- | -------- |
| 10   | 21       | 106      | 103        | 105      |

| 财经 | 娱乐淘金 | 医疗健康 | 文化教育 | 出海 |
| ---- | -------- | -------- | -------- | ---- |
| 115  | 22       | 111      | 113      | 114  |

| 金融地产 | 企业服务 | 创业维艰 | 社交通讯 | 全球热点 | 生活腔调 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 102      | 110      | 2        | 112      | 107      | 4        |`,
    url: 'huxiu.com/article',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL(`web/${id ? 'channel' : 'article'}/articleList`, apiArticleRootUrl).href;
    const currentUrl = new URL(id ? `channel/${id}.html` : 'article', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            channel_id: id,
            pagesize: limit,
        },
    });

    const items = await processItems(response.data?.dataList ?? response.data.datalist, limit, cache.tryGet);

    const data = await fetchData(currentUrl);

    return {
        item: items,
        ...data,
    };
}

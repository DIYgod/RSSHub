import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import { apiArticleRootUrl, processItems, rootUrl } from './util';

const prefixHuxiu = (value?: string) => {
    if (!value) {
        return;
    }

    return value.startsWith('虎嗅资讯-') ? value : `虎嗅资讯-${value}`;
};

export const route: Route = {
    path: ['/article', '/channel/:id?'],
    categories: ['new-media'],
    example: '/huxiu/article',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['huxiu.com/article'],
        },
    ],
    name: '资讯',
    maintainers: ['HenryQW', 'nczitzk', 'TimoYoung'],
    handler,
    description: `| 视频 | 前沿科技 | 车与出行 | 商业消费 | 社会文化 |
| ---- | -------- | -------- | ---------- | -------- |
| 10   | 105    | 21    | 103        | 106     |

| 金融财经 | 出海 | 国际热点 | 游戏娱乐 | 健康 |
| -------- | ---- | -------- | -------- | ---- |
| 115      | 114  | 107      | 22       | 118  |

| 书影音 | 医疗 | 3C数码 | 观点 | 其他 |
| ------ | ---- | ------ | ---- | ---- |
| 119    | 120  | 121    | 122  | 123  |`,
    url: 'huxiu.com/article',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const apiUrl = new URL(`web/channel/articleListV1`, apiArticleRootUrl).href;
    const currentUrl = new URL(id ? `channel/${id}.html` : 'article', rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            channel_id: id || '0',
            pagesize: limit,
        },
    });

    const items = await processItems(response.data?.dataList ?? response.data.datalist, limit, cache.tryGet);
    const rawTitle = response.data?.share_info?.share_title ?? response.data?.name ?? '全部';
    const data = {
        title: prefixHuxiu(rawTitle) ?? rawTitle,
        link: currentUrl,
        description: prefixHuxiu(response.data?.share_info?.share_desc || rawTitle),
        icon: response.data?.share_info?.share_img,
        logo: response.data?.share_info?.share_img,
        subtitle: rawTitle,
        allowEmpty: true,
        itunes_category: 'News',
    };

    return {
        item: items,
        ...data,
    };
}

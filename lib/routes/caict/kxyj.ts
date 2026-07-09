import type { Route } from '@/types';

import { fetchPage, parseList } from './utils';

export const route: Route = {
    path: '/kxyj',
    categories: ['government'],
    example: '/caict/kxyj',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.caict.ac.cn/kxyj', 'www.caict.ac.cn/kxyj/', 'caict.ac.cn/kxyj', 'caict.ac.cn/kxyj/'],
            target: '/kxyj',
        },
    ],
    name: '科研能力',
    maintainers: ['lisyer'],
    url: 'www.caict.ac.cn/kxyj/',
    description: `科研能力栏目首页的动态摘要（含白皮书 / 权威数据 / 观点等混排条目）。

更完整的分类订阅请使用：

| 白皮书                   | 权威数据                   | CAICT 观点                       |
| ------------------------ | -------------------------- | -------------------------------- |
| [/caict/bps](/caict/bps) | [/caict/qwsj](/caict/qwsj) | [/caict/caictgd](/caict/caictgd) |

::: warning
官网导航中的「市场研究报告」(\`/kxyj/qwfb/scbg/\`) 当前返回 404，暂无法提供对应路由。
:::`,
    handler,
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Math.trunc(Number(ctx.req.query('limit'))) : 20;
    const { $, url } = await fetchPage('/kxyj/');
    const items = parseList($, url, limit);

    return {
        title: '中国信息通信研究院 - 科研能力',
        link: url,
        language: 'zh-cn',
        item: items,
    };
}

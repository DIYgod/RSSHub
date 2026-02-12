import type { Route } from '@/types';
import cache from '@/utils/cache';

import { getRollNewsList, parseArticle, parseRollNewsList } from '../utils';

export const route: Route = {
    path: '/finance/rollnews/:lid?',
    categories: ['new-media'],
    example: '/sina/finance/rollnews',
    parameters: { lid: '分区 id，见下表，默认为 `2519`' },
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
            source: ['finance.sina.com.cn/roll', 'finance.sina.com.cn/'],
            target: '/finance/rollnews',
        },
    ],
    name: '财经－滚动新闻',
    maintainers: ['betterandbetterii'],
    handler,
    url: 'finance.sina.com.cn/roll',
    description: `| 财经 | 股市 | 美股 | 中国概念股 | 港股 | 研究报告 | 全球市场 | 外汇 |
| ---- | ---- | ---- | ---------- | ---- | -------- | -------- | ---- |
| 2519 | 2671 | 2672 | 2673       | 2674 | 2675     | 2676     | 2487 |`,
};

async function handler(ctx) {
    const map = {
        2519: '财经',
        2671: '股市',
        2672: '美股',
        2673: '中国概念股',
        2674: '港股',
        2675: '研究报告',
        2676: '全球市场',
        2487: '外汇',
    };

    const pageid = '384';
    const { lid = '2519' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `新浪财经－${map[lid] ?? lid}滚动新闻`,
        link: `https://finance.sina.com.cn/roll/#pageid=${pageid}&lid=${lid}&k=&num=${limit}&page=1`,
        item: out,
    };
}

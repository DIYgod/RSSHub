import { Route } from '@/types';
import cache from '@/utils/cache';
import { getRollNewsList, parseRollNewsList, parseArticle } from '../utils';

export const route: Route = {
    path: '/finance/china/:lid?',
    categories: ['new-media'],
    example: '/sina/finance/china',
    parameters: { lid: '分区 id，见下表，默认为 `1686`' },
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
            source: ['finance.sina.com.cn/china', 'finance.sina.com.cn/'],
            target: '/finance/china',
        },
    ],
    name: '财经－国內',
    maintainers: ['yubinbai'],
    handler,
    url: 'finance.sina.com.cn/china',
    description: `| 国内滚动 | 宏观经济 | 金融新闻 | 地方经济 | 部委动态 | 今日财经 TOP10 |
  | -------- | -------- | -------- | -------- | -------- | -------------- |
  | 1686     | 1687     | 1690     | 1688     | 1689     | 3231           |`,
};

async function handler(ctx) {
    const map = {
        1686: '国内滚动',
        1687: '宏观经济',
        1690: '金融新闻',
        1688: '地方经济',
        1689: '部委动态',
        3231: '今日财经 TOP10',
    };
    const pageid = '155';
    const { lid = '1686' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `新浪财经－${map[lid]}`,
        link: 'http://finance.sina.com.cn/china/',
        item: out,
    };
}

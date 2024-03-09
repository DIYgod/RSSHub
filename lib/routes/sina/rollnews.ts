import { Route } from '@/types';
import cache from '@/utils/cache';
import { getRollNewsList, parseRollNewsList, parseArticle } from './utils';

export const route: Route = {
    path: '/rollnews/:lid?',
    categories: ['new-media'],
    example: '/sina/rollnews',
    parameters: { lid: '分区 id，可在 URL 中找到，默认为 `2509`' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '滚动新闻',
    maintainers: ['xyqfer'],
    handler,
    description: `| 全部 | 国内 | 国际 | 社会 | 体育 | 娱乐 | 军事 | 科技 | 财经 | 股市 | 美股 |
  | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
  | 2509 | 2510 | 2511 | 2669 | 2512 | 2513 | 2514 | 2515 | 2516 | 2517 | 2518 |`,
};

async function handler(ctx) {
    const map = {
        2509: '全部',
        2510: '国内',
        2511: '国际',
        2669: '社会',
        2512: '体育',
        2513: '娱乐',
        2514: '军事',
        2515: '科技',
        2516: '财经',
        2517: '股市',
        2518: '美股',
    };

    const pageid = '153';
    const { lid = '2509' } = ctx.req.param();
    const { limit = '50' } = ctx.req.query();
    const response = await getRollNewsList(pageid, lid, limit);
    const list = parseRollNewsList(response.data.result.data);

    const out = await Promise.all(list.map((item) => parseArticle(item, cache.tryGet)));

    return {
        title: `新浪${map[lid]}滚动新闻`,
        link: `https://news.sina.com.cn/roll/#pageid=${pageid}&lid=${lid}&k=&num=${limit}&page=1`,
        item: out,
    };
}

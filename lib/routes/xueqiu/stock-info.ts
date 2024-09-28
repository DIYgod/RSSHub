import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';
import sanitizeHtml from 'sanitize-html';
import { parseToken } from '@/routes/xueqiu/cookies';

export const route: Route = {
    path: '/stock_info/:id/:type?',
    categories: ['finance'],
    example: '/xueqiu/stock_info/SZ000002',
    parameters: { id: '股票代码（需要带上交易所）', type: '动态的类型, 不填则为股票公告' },
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
            source: ['xueqiu.com/S/:id', 'xueqiu.com/s/:id'],
            target: '/stock_info/:id',
        },
    ],
    name: '股票信息',
    maintainers: ['YuYang'],
    handler,
    description: `| 公告         | 新闻 | 研报     |
  | ------------ | ---- | -------- |
  | announcement | news | research |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 'announcement';
    const count = 10;
    const page = 1;
    const typename = {
        announcement: '公告',
        news: '自选股新闻',
        research: '研报',
        all: 'all',
    };
    const source = typename[type];

    const res1 = await got({
        method: 'get',
        url: `https://xueqiu.com/S/${id}`,
    });

    const token = await parseToken();
    const $ = load(res1.data); // 使用 cheerio 加载返回的 HTML
    const stock_name = $('.stock-name').text().split('(')[0];

    let query_url = 'https://xueqiu.com/statuses';
    query_url += source === 'all' ? '/search.json' : '/stock_timeline.json';

    const res2 = await got({
        method: 'get',
        url: query_url,
        searchParams: queryString.stringify({
            symbol_id: id,
            symbol: id,
            source,
            count,
            page,
            sort: 'alpha',
            comment: '0',
            hl: '0',
        }),
        headers: {
            Cookie: token,
            Referer: `https://xueqiu.com/u/${id}`,
        },
    });

    const data = res2.data.list;
    return {
        title: `${id} ${stock_name} - ${source}`,
        link: `https://xueqiu.com/S/${id}`,
        description: `${stock_name} - ${source}`,
        item: data.map((item) => ({
            title: item.title || sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} }),
            description: item.description,
            pubDate: parseDate(item.created_at),
            link: `https://xueqiu.com${item.target}`,
        })),
    };
}

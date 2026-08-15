import queryString from 'query-string';
import sanitizeHtml from 'sanitize-html';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import { parseToken } from '@/routes/xueqiu/cookies';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/stock_info/:id/:type?',
    categories: ['finance'],
    example: '/xueqiu/stock_info/SZ000002',
    parameters: { id: '股票代码（需要带上交易所）', type: '动态的类型, 不填则为股票公告' },
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
            source: ['xueqiu.com/S/:id', 'xueqiu.com/s/:id'],
            target: '/stock_info/:id',
        },
    ],
    name: '股票信息',
    maintainers: ['YuYang'],
    handler,
    description: `| 全部 | 讨论    | 交易  | 资讯 | 公告         |
| ---- | ------- | ----- | ---- | ------------ |
| all  | discuss | trans | news | announcement |`,
};

// The two endpoints below correspond to the tabs on the stock page (xueqiu.com/S/:id).
// `source` is the API query value; `label` is the human-readable name shown in the feed title.
// `all` / `discuss` / `trans` are served by the search endpoint; `news` / `announcement`
// are served by the timeline endpoint (the search endpoint ignores these two sources).
const typeMap = {
    all: { source: 'all', label: '全部', endpoint: 'search' },
    discuss: { source: 'user', label: '讨论', endpoint: 'search' },
    trans: { source: 'trans', label: '交易', endpoint: 'search' },
    news: { source: '自选股新闻', label: '资讯', endpoint: 'timeline' },
    announcement: { source: '公告', label: '公告', endpoint: 'timeline' },
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type') || 'announcement';
    if (!Object.hasOwn(typeMap, type)) {
        throw new InvalidParameterError(`Invalid type: ${type}. Supported types: ${Object.keys(typeMap).join(', ')}`);
    }
    const { source, label, endpoint } = typeMap[type];

    const link = `https://xueqiu.com/S/${id}`;
    const cookie = await parseToken(link);

    // Fetch the stock name from the lightweight quote API (the name is rendered
    // client-side on the page, so it cannot be scraped from the static HTML)
    const quoteRes = await got({
        method: 'get',
        url: 'https://stock.xueqiu.com/v5/stock/quote.json',
        searchParams: queryString.stringify({ symbol: id }),
        headers: {
            Cookie: cookie,
            Referer: link,
        },
    });
    const stock_name = quoteRes.data.data?.quote?.name || id;

    // Use the api.xueqiu.com domain; the WAF blocks these endpoints on xueqiu.com
    const query_url = endpoint === 'search' ? 'https://api.xueqiu.com/query/v1/symbol/search/status.json' : 'https://api.xueqiu.com/statuses/stock_timeline.json';

    const res2 = await got({
        method: 'get',
        url: query_url,
        searchParams: queryString.stringify({
            symbol_id: id,
            symbol: id,
            source,
            count: 10,
            page: 1,
            sort: endpoint === 'search' ? 'time' : 'alpha',
            comment: '0',
            hl: '0',
        }),
        headers: {
            Cookie: cookie,
            Referer: link,
        },
    });

    const data = res2.data.list;
    return {
        title: `${id} ${stock_name} - ${label}`,
        link,
        description: `${stock_name} - ${label}`,
        item: data.map((item) => ({
            title: item.title || sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} }),
            description: item.description,
            pubDate: parseDate(item.created_at),
            link: `https://xueqiu.com${item.target}`,
        })),
    };
}

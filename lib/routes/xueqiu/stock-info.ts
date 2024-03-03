// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import queryString from 'query-string';
import { parseDate } from '@/utils/parse-date';
const sanitizeHtml = require('sanitize-html');

export default async (ctx) => {
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
    const token = res1.headers['set-cookie'].find((s) => s.startsWith('xq_a_token=')).split(';')[0];

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
    ctx.set('data', {
        title: `${id} ${stock_name} - ${source}`,
        link: `https://xueqiu.com/S/${id}`,
        description: `${stock_name} - ${source}`,
        item: data.map((item) => {
            let link = `https://xueqiu.com${item.target}`;
            if (item.quote_cards) {
                link = item.quote_cards[0].target_url;
            }
            return {
                title: item.title || sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} }),
                description: item.description,
                pubDate: parseDate(item.created_at),
                link,
            };
        }),
    });
};

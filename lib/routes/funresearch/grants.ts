import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.funresearch.cn';
const listUrl = `${rootUrl}/grant/index`;

export const route: Route = {
    path: '/grants',
    name: '项目申报',
    categories: ['study'],
    example: '/funresearch/grants',
    maintainers: ['DIYgod'],
    description: '订阅公众版项目申报列表的首屏公告，提供标题、发布机构、官方发布日期，以及申报状态和资助区域分类。正文、原文链接及附件需要在源站使用自己的账号查看。可使用通用过滤参数筛选标题、发布机构或分类。',
    radar: [{ source: ['www.funresearch.cn/grant/index', 'www.funresearch.cn/grant/search'], target: '/grants' }],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const response = await ofetch(listUrl, { responseType: 'text' });
    const $ = load(response);
    const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '');
    const list = $('article.fun-table-row')
        .toArray()
        .map((element) => {
            const row = $(element);
            const cells = row.children('.fun-table-cell');
            const anchor = row.find('h6 a');
            const href = anchor.attr('href');
            if (!href || !href.startsWith('/grant/')) {
                throw new Error('Funresearch returned an unexpected project announcement link.');
            }
            return {
                title: anchor.text(),
                link: new URL(href, rootUrl).href,
                author: cells.eq(2).text(),
                date: row.find('time').first().attr('datetime'),
                category: [
                    cells
                        .eq(0)
                        .text()
                        .replaceAll(/^\[|\]$/g, ''),
                    ...cells
                        .eq(3)
                        .text()
                        .split(/[;；]/),
                ].filter(Boolean),
            };
        });
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : list.length;

    return {
        title: '泛研网 - 项目申报',
        link: listUrl,
        language: 'zh-CN',
        item: list.slice(0, limit).map((item) => ({
            title: item.title,
            link: item.link,
            author: item.author,
            pubDate: item.date ? parseDateInTimezone(item.date, 8) : undefined,
            category: item.category,
        })),
    };
}

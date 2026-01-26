import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';

import { fetchHtml, fetchItem, parseListDate, resolveUrl, rootUrl } from './utils';

export const route: Route = {
    path: '/sydwks',
    categories: ['government'],
    example: '/shanxirst/sydwks',
    radar: [
        {
            source: ['rst.shanxi.gov.cn/rsks/sydwks/index_1.shtml', 'rst.shanxi.gov.cn/rsks/sydwks/index.shtml'],
            target: '/sydwks',
        },
    ],
    name: '事业单位公开招聘',
    maintainers: ['tdcasual'],
    handler,
    url: 'rst.shanxi.gov.cn/rsks/sydwks/index_1.shtml',
    description: '山西省人力资源和社会保障厅「人事考试」- 事业单位考试（公开招聘）公告（仅抓取列表第一页）。',
};

async function handler(ctx) {
    const limitFromQuery = Number.parseInt(ctx.req.query('limit') ?? '', 10);
    const limit = Number.isFinite(limitFromQuery) && limitFromQuery > 0 ? limitFromQuery : 30;

    const listUrl = new URL('/rsks/sydwks/index_1.shtml', rootUrl).href;
    const response = await fetchHtml(listUrl);
    const $ = load(response);

    const pageTitle = $('.ztzl_dt_title mark').first().text().trim() || '事业单位考试';

    const items = $('.ztzl_dt_content ul.second_right_ul li')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const li = $(element);
            const a = li.find('a[href]').first();
            const link = resolveUrl(a.attr('href'), listUrl);
            if (!link) {
                return null;
            }

            return {
                title: a.attr('title') || a.text().trim(),
                link,
                pubDate: parseListDate(li.find('span.pull-right').first().text()),
            };
        })
        .filter((item): item is DataItem => Boolean(item));

    const fullItems = await pMap(items, (item) => fetchItem(item, listUrl), { concurrency: 2 });

    return {
        title: `山西人事考试 - ${pageTitle}`,
        link: listUrl,
        item: fullItems,
    };
}

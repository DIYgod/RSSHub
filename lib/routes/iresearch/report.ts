// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function processReport(item) {
    const apiUrl = `https://www.iresearch.com.cn/api/Detail/reportM?id=${item.NewsId}&isfree=0`;
    const pageUrl = 'https://www.iresearch.com.cn/m/report.shtml';

    const description = cache.tryGet(apiUrl, async () => {
        const response = await got({
            method: 'get',
            url: apiUrl,
            headers: {
                Referer: pageUrl,
                'Content-Type': 'application/json',
            },
        });
        const data = response.data.List[0];

        return art(path.join(__dirname, 'templates/report.art'), {
            data,
        });
    });

    return description;
}

export default async (ctx) => {
    const limit = isNaN(Number.parseInt(ctx.req.query('limit'))) ? 20 : Number.parseInt(ctx.req.query('limit'));
    const apiUrl = `https://www.iresearch.com.cn/api/products/GetReportList?fee=0&date=&lastId=&pageSize=${limit}`;
    const pageUrl = 'https://www.iresearch.com.cn/m/report.shtml';

    const resp = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
    });

    const list = resp.data.List;
    const items = await Promise.all(
        list.map(async (item) => ({
            title: item.Title,
            description: await processReport(item),
            pubDate: timezone(parseDate(item.Uptime), +8),
            link: item.VisitUrl,
        }))
    );

    ctx.set('data', {
        title: '艾瑞产业研究报告',
        link: pageUrl,
        description: '艾瑞产业研究报告',
        item: items,
    });
};

import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
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

export const route: Route = {
    path: '/report',
    categories: ['other'],
    example: '/iresearch/report',
    parameters: {},
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
            source: ['www.iresearch.com.cn/report.shtml'],
        },
    ],
    name: '产业研究报告',
    maintainers: ['brilon', 'Fatpandac'],
    handler,
    url: 'www.iresearch.com.cn/report.shtml',
};

async function handler(ctx) {
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

    return {
        title: '艾瑞产业研究报告',
        link: pageUrl,
        description: '艾瑞产业研究报告',
        item: items,
    };
}

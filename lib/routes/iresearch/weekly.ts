// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.iresearch.com.cn';
    const currentUrl = `${rootUrl}/report?type=3`;
    const apiUrl = `${rootUrl}/api/json/report/ireport.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = JSON.parse(response.data.slice(1))
        .filter((item) => (category ? item.classname === category : true))
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 200)
        .map((item) => ({
            title: item.reportname,
            pubDate: parseDate(item.addtime),
            link: `${rootUrl}/report/detail?id=${item.id}`,
            category: [item.classname, ...item.keywords.split(',')],
            description: art(path.join(__dirname, 'templates/weekly.art'), {
                id: item.id,
                cover: item.reportpic,
                content: item.shortcoutent,
                pages: item.PagesCount,
            }),
        }));

    ctx.set('data', {
        title: '艾瑞咨询 - 周度市场观察',
        link: currentUrl,
        item: items,
    });
};

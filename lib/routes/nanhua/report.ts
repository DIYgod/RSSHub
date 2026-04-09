import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/report/:type1/:type2',
    categories: ['finance'],
    example: '/nanhua/report/WEEK/WEEK_black',
    parameters: {
        type1: '一级分类代码，如 `WEEK`（周度报告）、`SEASON`（季年报告）、`HOT`（热点报告）等，需要使用 `encodeURIComponent` 编码',
        type2: '二级分类代码，如 `WEEK_black`（黑色）、`WEEK_enchem`（能化）等，需要使用 `encodeURIComponent` 编码',
    },
    radar: [
        {
            source: ['mall.nanhua.net/mall/r/w/reportNew/report-list.html'],
            target: (_, url) => {
                const params = new URL(url).searchParams;
                const type1 = params.get('type1');
                const type2 = params.get('type2');
                return type1 && type2 ? `/nanhua/report/${type1}/${type2}` : '';
            },
        },
    ],
    name: '研报',
    maintainers: ['TonyRL'],
    handler,
    url: 'mall.nanhua.net/mall/r/w/reportNew/report-list.html',
};

async function handler(ctx: Context) {
    const { type1, type2 } = ctx.req.param();
    const baseUrl = 'https://mall.nanhua.net';
    const apiBase = `${baseUrl}/mall/nh/api`;
    const link = `${baseUrl}/mall/r/w/reportNew/report-list.html?type1=${type1}&type2=${type2}`;

    const treeList = await cache.tryGet('nanhua:treeList', async () => {
        const response = await ofetch(`${apiBase}/reportType/getTreeList.json`, {
            method: 'POST',
            body: {},
        });
        return response.data;
    });

    const response = await ofetch(`${apiBase}/report/getPage.json`, {
        method: 'POST',
        body: {
            type1Code: type1,
            type2Code: type2,
            pageSize: ctx.req.query('limit') || '20',
        },
    });

    const parent = treeList.find((item) => item.type === type1);
    const child = parent?.children?.find((item) => item.type === type2);

    const items: DataItem[] = response.data.result.map((item) => ({
        title: item.title,
        description: item.content || item.summary || item.desc,
        link: item.fileName ? `${apiBase}/report/getReportFile?reportId=${item.id}&filetitle=${item.fileName}` : /^\d+$/.test(item.id) ? item.detailUrl : `${baseUrl}/mall/r/w/reportNew/report-list-page.html?id=${item.id}`,
        pubDate: timezone(parseDate(item.createTime), 8),
        author: item.personName,
        category: [item.type1Name, item.type2Name, item.typeName].filter(Boolean),
        image: item.iconUrl,
    }));

    return {
        title: `南华期货 - ${parent?.name ?? type1} - ${child?.name ?? type2}`,
        link,
        language: 'zh-CN' as const,
        image: `${baseUrl}/favicon.ico`,
        item: items,
    };
}

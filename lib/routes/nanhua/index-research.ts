import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.nanhua.net';

const categories = {
    daily: { type: 404205, name: '指数日报', page: 'index-daily' },
    weekly: { type: 404202, name: '指数周报', page: 'index-weekly' },
    quarterly: { type: 404204, name: '指数季报', page: 'seminar' },
};

export const route: Route = {
    path: '/index-research/:category?',
    categories: ['finance'],
    example: '/nanhua/index-research/daily',
    parameters: {
        category: { description: '报告类型', default: 'daily', options: Object.entries(categories).map(([value, { name }]) => ({ value, label: name })) },
    },
    radar: Object.entries(categories).map(([category, { name, page }]) => ({
        title: name,
        source: [`www.nanhua.net/subpage/research/nawaaindex/indexresearch/${page}.html`],
        target: `/index-research/${category}`,
    })),
    name: '南华指数研究',
    maintainers: ['pseudoyu'],
    handler,
    url: 'www.nanhua.net/subpage/research/nawaaindex/indexresearch/index-daily.html',
    description: '报告正文为 PDF，条目链接直接指向 PDF 文件。',
};

async function handler(ctx: Context) {
    const { category = 'daily' } = ctx.req.param();
    if (!Object.hasOwn(categories, category)) {
        throw new InvalidParameterError('Use daily, weekly or quarterly as the report type.');
    }
    const { type, name, page } = categories[category];

    const response = await ofetch(`${baseUrl}/jSearch/queryNewsListByTypeForJson.shtm`, {
        query: { site: 'newnanhua', type, start: 0, limit: getRouteLimit(ctx, 20) },
    });

    const items: DataItem[] = response.recordList.map((item) => ({
        title: item.subject,
        link: new URL(item.href, baseUrl).href,
        pubDate: timezone(parseDate(item.createTime), 8),
        author: item.author,
    }));

    return {
        title: `南华期货 - 南华指数 - ${name}`,
        link: `${baseUrl}/subpage/research/nawaaindex/indexresearch/${page}.html`,
        language: 'zh-CN' as const,
        item: items,
    };
}

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/display/offline-exhibit',
    categories: ['travel'],
    example: '/shanghaimuseum/display/offline-exhibit',
    parameters: {
        limit: '条数，默认为 16',
    },
    name: 'Shanghai Museum - Special Exhibitions',
    maintainers: ['magazian'],
    radar: [
        {
            source: ['www.shanghaimuseum.net/mu/frontend/pg/display/offline-exhibit'],
            target: '/display/offline-exhibit',
        },
    ],
    handler: async (ctx) => {
        const baseUrl = 'https://www.shanghaimuseum.net';
        const apiUrl = `${baseUrl}/mu/frontend/pg/display/search-exhibit`;

        const { limit = '16' } = ctx.req.query();

        const response = await got.post(apiUrl, {
            json: {
                limit: Number.parseInt(limit),
                page: 1,
                params: {
                    exhibitTypeCode: 'OFFLINE_EXHIBITION',
                    langCode: 'CHINESE',
                },
            },
        });

        const list = response.data.data || [];

        return {
            title: '上海博物馆 - 特别展览',
            link: `${baseUrl}/mu/frontend/pg/display/offline-exhibit`,
            language: 'zh-CN',
            item: list.map((item) => ({
                title: item.name,
                link: `${baseUrl}/mu/frontend/pg/article/id/${item.code}`,
                description: `
                    <img src='${baseUrl}/${item.picPath}'><br>
                    <p><b>地点：</b>${item.exhibitPlace}</p>
                    <p><b>展期：</b>${item.exhibitDateRange}</p>
                `.trim(),
                pubDate: parseDate(item.issueTime),
                category: [item.exhibitPlace],
            })),
        };
    },
};

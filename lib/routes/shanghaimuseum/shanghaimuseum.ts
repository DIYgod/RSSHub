import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/display/index',
    categories: ['travel'],
    example: '/shanghaimuseum/display/index',
    parameters: {
        limit: '条数，默认为 16',
    },
    name: '上海博物馆 - 展览',
    maintainers: ['magazian'],
    handler: async (ctx) => {
        const baseUrl = 'https://www.shanghaimuseum.net';
        const apiUrl = `${baseUrl}/mu/frontend/pg/display/search-exhibit`;

        const { limit = '16' } = ctx.req.query();

        const response = await got.post(apiUrl, {
            json: {
                limit: parseInt(limit),
                page: 1,
                params: {
                    exhibitTypeCode: 'OFFLINE_EXHIBITION',
                    langCode: 'CHINESE',
                },
            },
        });

        const list = response.data.data || [];

        return {
            title: '上海博物馆 - 展览',
            link: `${baseUrl}/mu/frontend/pg/display/index`,
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
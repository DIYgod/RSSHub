import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/newsletter',
    categories: ['programming'],
    example: '/bestblogs/newsletter',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '精选推送',
    maintainers: ['occam-7'],
    handler,
};

async function handler(ctx) {
    const pageSize = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const response = await ofetch('https://www.bestblogs.dev/api/proxy/newsletters', {
        method: 'GET',
        query: {
            page: 1,
            pageSize,
            language: 'zh',
        },
    });

    const list = response.data?.dataList ?? [];

    const items = list.map((item) => ({
        title: item.title,
        link: `https://www.bestblogs.dev/newsletter/${item.id}`,
        description: item.summary,
        pubDate: parseDate(item.createdTimestamp),
    }));

    return {
        title: 'Bestblogs.dev - 精选推送',
        link: 'https://www.bestblogs.dev/newsletter',
        item: items,
    };
}

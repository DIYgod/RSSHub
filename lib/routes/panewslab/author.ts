import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiBaseUrl, apiHeaders, getArticles, getLimit, processArticles, rootUrl } from './utils';

export const route: Route = {
    path: ['/author/:id', '/column/:id'],
    categories: ['new-media'],
    example: '/panewslab/author/166',
    parameters: { id: '专栏 id，可在地址栏 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['www.panewslab.com/zh/columns/:id'], target: '/author/:id' }],
    name: '专栏',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.panewslab.com/zh/columns/:id',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const column = await ofetch<{ name: string; desc: string; picture: string }>(`${apiBaseUrl}/columns/${id}`, { headers: apiHeaders });
    const articles = await getArticles({ columnId: id, take: getLimit(ctx.req.query('limit'), 25) });
    return {
        title: `PANews - ${column.name}`,
        description: column.desc,
        image: column.picture,
        link: `${rootUrl}/zh/columns/${id}`,
        item: await processArticles(articles),
    };
}

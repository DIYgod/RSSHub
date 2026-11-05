import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiBaseUrl, apiHeaders, getArticles, getLimit, processArticles, rootUrl } from './utils';

export const route: Route = {
    path: '/topic/:id',
    categories: ['new-media'],
    example: '/panewslab/topic/1629365774078402',
    parameters: { id: '专题 id，可在地址栏 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['www.panewslab.com/zh/series/:id'], target: '/topic/:id' }],
    name: '专题',
    maintainers: ['nczitzk'],
    handler,
    url: 'www.panewslab.com/zh/series/:id',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const series = await ofetch<{ name: string; desc: string; cover: string }>(`${apiBaseUrl}/series/${id}`, { headers: apiHeaders });
    const articles = await getArticles({ seriesId: id, take: getLimit(ctx.req.query('limit'), 25) });
    return {
        title: `PANews - ${series.name}`,
        description: series.desc,
        image: series.cover,
        link: `${rootUrl}/zh/series/${id}`,
        item: await processArticles(articles),
    };
}

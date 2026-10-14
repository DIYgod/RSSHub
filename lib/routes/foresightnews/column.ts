import type { Language, Route } from '@/types';

import { apiRootUrl, icon, image, processItems, rootUrl } from './util';

export const route: Route = {
    path: '/column/:id',
    categories: ['new-media'],
    example: '/foresightnews/column/1',
    parameters: { id: '专栏 id, 可在对应专栏页 URL 中找到' },
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
            source: ['foresightnews.pro/column/detail/:id'],
        },
    ],
    name: '专栏',
    maintainers: ['nczitzk'],
    handler,
    url: 'foresightnews.pro/',
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const apiUrl = new URL('v1/articles', apiRootUrl).href;
    const currentUrl = new URL(`column/detail/${id}`, rootUrl).href;

    const { items, info } = await processItems(apiUrl, ctx, {
        column_id: id,
    });

    const column = info.column;

    return {
        item: items,
        title: `Foresight News - ${column}`,
        link: currentUrl,
        description: `${column} - Foresight News`,
        language: 'zh-CN' as const satisfies Language,
        image,
        icon,
        logo: icon,
        author: 'Foresight News',
    };
}

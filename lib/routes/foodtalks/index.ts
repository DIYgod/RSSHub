import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';

import { namespace } from './namespace';
import { apiBaseUrl, baseUrl, parseList, processItems } from './utils';

export const route: Route = {
    path: '/',
    categories: namespace.categories,
    example: '/foodtalks',
    radar: [
        {
            source: ['www.foodtalks.cn'],
        },
    ],
    name: '最新资讯',
    maintainers: ['Geraldxm'],
    handler,
    url: 'www.foodtalks.cn',
};

async function handler(ctx) {
    const limit = Math.max(15, getRouteLimit(ctx, 15));
    const url = `${apiBaseUrl}/news/news/page?current=1&size=${limit}&isLatest=1&language=ZH`;
    const response = await ofetch(url, {
        headers: {
            referer: `${baseUrl}/`,
        },
    });
    const list = parseList(response.data.records);

    const items = await processItems(list, ctx);

    return {
        title: namespace.name,
        description: namespace.description,
        link: 'https://' + namespace.url,
        item: items,
        image: `${baseUrl}/favicon.ico`,
    };
}

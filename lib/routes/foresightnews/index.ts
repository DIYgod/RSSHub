import { Route } from '@/types';
import { rootUrl, apiRootUrl, processItems, icon, image } from './util';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['foresightnews.pro/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['nczitzk'],
    handler,
    url: 'foresightnews.pro/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const apiUrl = new URL(`v2/feed`, apiRootUrl).href;

    const { items } = await processItems(apiUrl, limit);

    return {
        item: items,
        title: 'Foresight News - 精选资讯',
        link: rootUrl,
        description: 'FN精选 - Foresight News',
        language: 'zh-cn',
        image,
        icon,
        logo: icon,
        subtitle: '精选资讯',
        author: 'Foresight News',
    };
}

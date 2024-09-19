import { Route, Data } from '@/types';
import { getCategoryBySlug, getPostsByCategory } from './utils';

export const route: Route = {
    path: '/category/:keyword',
    categories: ['multimedia'],
    example: '/chikubi/category/nipple-lesbian',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'Category',
            source: ['chikubi.jp/category/:keyword'],
            target: '/category/:keyword',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const baseUrl = 'https://chikubi.jp';
    const { keyword } = ctx.req.param();
    const { id, name } = await getCategoryBySlug(keyword);

    const items = await getPostsByCategory(id);

    return {
        title: `Category: ${name} - chikubi.jp`,
        link: `${baseUrl}/category/${keyword}`,
        item: items,
    };
}

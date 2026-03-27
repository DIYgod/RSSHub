import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:category/:search',
    categories: ['journal'],
    example: '/archdaily/search/projects/Urban Design',
    parameters: { category: 'The category to search in, including "all", "projects", "products", "images", "professionals", "folders", "articles"', search: 'The search query' },
    features: {
        requireConfig: false,
    },
    radar: [
        {
            source: ['www.archdaily.com/search/:category'],
            target: '/search/:category/:search',
        },
    ],
    name: 'Search',
    maintainers: ['Friday_Anubis'],
    handler,
};

async function handler(ctx) {
    const { category, search } = ctx.req.param();

    const baseUrl = 'https://www.archdaily.com';
    const allowedCategories = new Set(['all', 'projects', 'products', 'images', 'professionals', 'folders', 'articles']);
    const finalCategory = allowedCategories.has(category) ? category : 'all';

    const response = await ofetch<{ results?: any[] }>(`${baseUrl}/search/api/v1/us/${finalCategory}?q=${encodeURIComponent(search)}`);

    const items = (response?.results ?? []).map((item) => {
        const title = item?.title || item?.name;
        const link = item?.url;
        const image = item?.featured_images?.url_large || item?.featured_images?.url_medium || item?.featured_images?.url_small;
        const category = (item?.tags ?? []).map((tag) => tag?.name).filter(Boolean);

        return {
            title,
            link,
            description: `${image ? `<img src="${image}"><br>` : ''}${item?.meta_description ?? ''}`,
            pubDate: item?.publication_date ? parseDate(item.publication_date) : undefined,
            author: item?.author?.name,
            category,
        };
    });

    return {
        title: `ArchDaily - ${search}${finalCategory === 'all' ? '' : ` in ${finalCategory}`}`,
        link: `${baseUrl}/search/${finalCategory}?q=${encodeURIComponent(search)}`,
        description: `Search results for "${search}" on ArchDaily`,
        item: items,
    };
}

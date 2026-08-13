import sanitizeHtml from 'sanitize-html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    categories: ['blog'],
    example: '/itslizmiu/blog',
    radar: [{ source: ['www.itslizmiu.com/blog'] }],
    name: "Liz Miu's Blog",
    maintainers: ['apathriel'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.itslizmiu.com';
    const data = await ofetch(`${baseUrl}/blog?format=json`);

    const items = data.items.map((item) => ({
        title: item.title,
        link: `${baseUrl}${item.fullUrl}`,
        guid: item.id,
        description: sanitizeHtml(item.body, { allowedTags: [...sanitizeHtml.defaults.allowedTags.filter((tag) => tag !== 'div'), 'img'] }),
        image: item.assetUrl,
        pubDate: parseDate(item.publishOn),
        category: [...(item.tags ?? []), ...(item.categories ?? [])],
    }));

    return {
        title: "Liz Miu's Blog",
        link: `${baseUrl}/blog`,
        item: items,
    };
}

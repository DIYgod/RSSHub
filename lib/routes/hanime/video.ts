import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/video',
    categories: ['anime'],
    example: '/hanime/video',
    name: 'Recently updated',
    maintainers: ['EsuRt'],
    handler,
};

async function handler() {
    const response = await ofetch('https://guest.freeanimehentai.net/api/v11/search_hvs', {
        headers: {
            Referer: 'https://hanime.tv/',
        },
    });

    return {
        title: 'Hanime',
        link: 'https://hanime.tv/',
        item: response.map((item) => ({
            title: item.name,
            description: `<b>Name:</b> ${item.name}<br><b>Brand:</b> ${item.brand}<br><b>Tags:</b> ${item.tags.join(', ')}<br><b>Description:</b> ${item.description}<br><img src="${item.cover_url}"><br><img src="${item.poster_url}">`,
            link: `https://hanime.tv/videos/hentai/${item.slug}`,
            pubDate: parseDate(item.created_at_unix, 'X'),
            category: item.tags,
            author: item.brand,
        })),
    };
}

import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/models',
    categories: ['program-update'],
    example: '/civitai/models',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['civitai.com/'],
        },
    ],
    name: 'Latest models',
    maintainers: ['DIYgod'],
    handler,
    url: 'civitai.com/',
};

async function handler() {
    const { data } = await got(`https://civitai.com/api/v1/models`, {
        searchParams: {
            limit: 20,
            sort: 'Newest',
        },
    });

    const items = data.items.map((item) => ({
        title: item.name,
        link: `https://civitai.com/models/${item.id}`,
        description: `${item.modelVersions?.[0]?.images?.map((image) => `<image src="${image.url.replace(/width=\d+\//, `width=${image.width}/`)}">`).join('\n')}${item.description}`,
        pubDate: parseDate(item.lastVersionAt),
        author: item.creator?.username,
        category: item.tags,
    }));

    return {
        title: `Civitai latest models`,
        link: `https://civitai.com/`,
        item: items,
    };
}

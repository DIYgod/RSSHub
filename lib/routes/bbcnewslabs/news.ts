import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/bbcnewslabs/news',
    parameters: {},
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
            source: ['bbcnewslabs.co.uk/', 'www.bbc.co.uk/rdnewslabs/news/'],
        },
    ],
    name: 'News',
    maintainers: ['elxy'],
    handler,
    url: 'www.bbc.co.uk/rdnewslabs/news/',
};

async function handler() {
    const rootUrl = 'https://www.bbc.co.uk';
    const response = await ofetch('https://corporate.api.bbci.co.uk/api/search/ipages-live/_search', {
        query: {
            sort: 'originalDate:desc',
            q: 'projectId.keyword:ipages-newslabs AND tags.id.keyword:News',
            size: 10,
            from: 0,
        },
    });

    const items = response.hits.hits.map(({ _source: item }) => ({
        title: item.name,
        description: item.description,
        pubDate: item.originalDate ? parseDate(item.originalDate) : undefined,
        link: new URL(item.url, rootUrl).href,
        author: item.authors?.map((author) => author.name).join(', ') || undefined,
        category: item.tags?.map((tag) => tag.name),
        image: item.imageUrl ? `https://${item.imageUrl.replace('$recipe', '400x225')}` : undefined,
    }));

    return {
        title: 'News - BBC News Labs',
        link: `${rootUrl}/rdnewslabs/news`,
        item: items,
    };
}

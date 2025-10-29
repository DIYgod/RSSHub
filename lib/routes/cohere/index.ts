import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/blog'],
    name: 'Blog',
    url: 'cohere.com/blog',
    maintainers: ['Loongphy'],
    handler,
    example: '/cohere/blog',
    description: 'Cohere is a platform for building AI applications.',
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cohere.com'],
        },
    ],
};

async function handler() {
    const { posts: data } = await ofetch('https://cohere-ai.ghost.io/ghost/api/content/posts', {
        query: {
            key: '572d288a9364f8e4186af1d60a',
            limit: 'all',
            include: ['authors', 'tags'],
            filter: 'tag:-hash-hidden+tag:-llmu',
        },
    });

    const items = data.map((item) => ({
        title: item.title,
        link: 'https://cohere.com/blog/' + item.slug,
        description: item.excerpt,
        pubDate: parseDate(item.published_at),
        author: item.authors.map((author) => author.name).join(', '),
        category: item.tags.map((tag) => tag.name),
    }));

    return {
        title: 'The Cohere Blog',
        link: 'https://cohere.com/blog',
        item: items,
    };
}

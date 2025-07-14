import { Data, Route, ViewType } from '@/types';
import { fetchCollection, rootUrl } from './utils';

export const route: Route = {
    path: '/podcast/:category?',
    view: ViewType.Articles,
    categories: ['new-media'],
    example: '/newslaundry/podcast',
    parameters: { category: 'Podcast category, see below for details' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['newslaundry.com/podcast'],
            target: '/podcast',
        },
        {
            source: ['newslaundry.com/collection/nl-hafta-podcast'],
            target: '/podcast/nl-hafta',
        },
        {
            source: ['newslaundry.com/podcast/whats-your-ism'],
            target: '/podcast/whats-your-ism',
        },
    ],
    name: 'Podcast',
    description: `| Category | URL |
| -------- | --- |
| All Podcasts | [/podcast](https://rsshub.app/newslaundry/podcast) |
| NL Hafta | [/podcast/nl-hafta](https://rsshub.app/newslaundry/podcast/nl-hafta) |
| What's Your Ism? | [/podcast/whats-your-ism](https://rsshub.app/newslaundry/podcast/whats-your-ism) |`,
    maintainers: ['Rjnishant530'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const category = ctx.req.param('category');

    // Map category to collection slug and URL
    const categoryMap = {
        'nl-hafta': {
            slug: 'nl-hafta-podcast',
            url: `${rootUrl}/collection/nl-hafta-podcast`,
        },
        'whats-your-ism': {
            slug: 'whats-your-ism-podcast-newslaundry-hindi',
            url: `${rootUrl}/podcast/whats-your-ism`,
        },
    };

    // For main podcast route, skip the first item
    const skipFirstItem = !category;

    return category && categoryMap[category] ? await fetchCollection(categoryMap[category].slug, categoryMap[category].url) : await fetchCollection('podcast', undefined, skipFirstItem);
}

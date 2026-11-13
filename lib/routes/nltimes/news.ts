import type { Route } from '@/types';
import { fetchGoogleNews } from '@/utils/google-news';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

const categories = {
    'top-stories': 'Top Stories',
    health: 'Health',
    crime: 'Crime',
    politics: 'Politics',
    business: 'Business',
    tech: 'Tech',
    culture: 'Culture',
    sports: 'Sports',
    weird: 'Weird',
    '1-1-2': '1-1-2',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/nltimes/news/top-stories',
    parameters: { category: 'category' },
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
            source: ['nltimes.nl/categories/:category'],
            target: '/news/:category',
        },
    ],
    name: 'News',
    maintainers: ['Hivol'],
    handler,
    description: `| Top Stories (default) | Health | Crime | Politics | Business | Tech | Culture | Sports | Weird | 1-1-2 |
| --------------------- | ------ | ----- | -------- | -------- | ---- | ------- | ------ | ----- | ----- |
| top-stories           | health | crime | politics | business | tech | culture | sports | weird | 1-1-2 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'top-stories';
    const categoryName = categories[category];
    if (!categoryName) {
        throw new Error(`Unknown NL Times category: ${category}. Expected one of: ${Object.keys(categories).join(', ')}.`);
    }

    const feed = category === 'top-stories' ? await parser.parseURL('https://nltimes.nl/rss.xml') : await fetchGoogleNews(`site:nltimes.nl ${categoryName}`);

    return {
        title: `NL Times -- ${categoryName}`,
        language: 'en' as const,
        link: category === 'top-stories' ? 'https://nltimes.nl/' : `https://nltimes.nl/categories/${category}`,
        description: `NL Times -- ${categoryName}`,
        item: feed.items
            .map((item) => ({
                title: item.title ?? '',
                link: item.link,
                description: item.content ?? item.contentSnippet,
                pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
                category: item.categories,
            }))
            .filter((item) => item.title),
    };
}

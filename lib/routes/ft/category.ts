import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import parser from '@/utils/rss-parser';

const sections: Record<string, { title: string; feedPaths: string[] }> = {
    world: { title: 'World', feedPaths: ['world'] },
    'global-economy': { title: 'Global Economy', feedPaths: ['global-economy'] },
    uk: { title: 'UK', feedPaths: ['uk-politics-policy', 'uk-business-economy'] },
    us: { title: 'US', feedPaths: ['us'] },
    china: { title: 'China', feedPaths: ['china'] },
    africa: { title: 'Africa', feedPaths: ['africa'] },
    'asia-pacific': { title: 'Asia Pacific', feedPaths: ['asia-pacific'] },
    'emerging-markets': { title: 'Emerging Markets', feedPaths: ['emerging-markets'] },
    europe: { title: 'Europe', feedPaths: ['europe'] },
    americas: { title: 'Americas', feedPaths: ['americas'] },
    'middle-east-north-africa': { title: 'Middle East & North Africa', feedPaths: ['middle-east-north-africa'] },
};

export const route: Route = {
    path: '/category/:section',
    categories: ['traditional-media'],
    example: '/ft/category/china',
    parameters: {
        section: {
            description: 'Section ID',
            options: Object.entries(sections).map(([value, section]) => ({ value, label: section.title })),
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Category',
    maintainers: ['kargonerd'],
    handler,
    description: 'Financial Times section feeds. Article pages are not fetched because they can require a subscription.',
};

async function handler(ctx) {
    const sectionId = ctx.req.param('section');
    const section = sections[sectionId];
    if (!section) {
        throw new InvalidParameterError(`Unsupported Financial Times section: ${sectionId}`);
    }

    const feeds = await Promise.all(section.feedPaths.map((path) => parser.parseURL(`https://www.ft.com/rss/${path}`)));
    const items = new Map<string, DataItem>();
    for (const feed of feeds) {
        for (const item of feed.items) {
            if (!item.title || !item.link || items.has(item.link)) {
                continue;
            }
            items.set(item.link, {
                title: item.title,
                link: item.link,
                pubDate: item.isoDate ?? item.pubDate,
                description: item.content,
                author: item.creator,
                category: [...new Set([section.title, ...(item.categories ?? [])])],
            });
        }
    }

    return {
        title: `Financial Times - ${section.title}`,
        link: `https://www.ft.com/${sectionId}`,
        language: 'en' as const,
        item: items.values().toArray(),
    };
}

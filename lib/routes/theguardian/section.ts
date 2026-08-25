import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getFeed } from './utils';

const sections = {
    world: { title: 'World', path: 'world' },
    uk: { title: 'UK', path: 'uk-news' },
    us: { title: 'US', path: 'us-news' },
    'us-politics': { title: 'US Politics', path: 'us-news/us-politics' },
    australia: { title: 'Australia', path: 'australia-news' },
    europe: { title: 'Europe', path: 'world/europe-news' },
    'middle-east': { title: 'Middle East', path: 'world/middleeast' },
    'uk-politics': { title: 'UK Politics', path: 'politics' },
    business: { title: 'Business', path: 'business' },
};

export const route: Route = {
    path: '/section/:section',
    categories: ['traditional-media'],
    example: '/theguardian/section/world',
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
    name: 'Section',
    maintainers: ['kargonerd'],
    handler,
    description: 'Selected news sections with full article content.',
};

function handler(ctx) {
    const sectionId = ctx.req.param('section');
    const section = sections[sectionId];
    if (!section) {
        throw new InvalidParameterError(`Unsupported Guardian section: ${sectionId}`);
    }
    const link = `https://www.theguardian.com/${section.path}`;
    return getFeed({
        link,
        title: section.title,
        rss: `${link}/rss`,
    });
}

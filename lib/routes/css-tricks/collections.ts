import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, Route } from '@/types';
import { ViewType } from '@/types';

import { extractMiniCards, processWithWp, rootUrl } from './utils';

export const route: Route = {
    path: '/collections/:type',
    view: ViewType.Articles,
    categories: ['programming'],
    example: '/css-tricks/collections/2',
    parameters: {
        type: {
            description: 'Collection Type',
            options: [
                { value: '3', label: 'Latest CSS Guides' },
                { value: '2', label: 'Fresh From the Almanac' },
                { value: '4', label: 'Classic Tricks' },
            ],
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
    radar: [
        {
            title: 'Fresh From the Almanac',
            source: ['css-tricks.com/'],
            target: '/collections/2',
        },
        {
            title: 'CSS Guides',
            source: ['css-tricks.com/'],
            target: '/collections/3',
        },
        {
            title: 'Classic Tricks',
            source: ['css-tricks.com/'],
            target: '/collections/4',
        },
    ],
    name: 'CSS Guides',
    maintainers: ['Rjnishant530'],
    handler,
};

const WPTYPE = {
    '2': 'pages',
    '3': 'posts',
    '4': 'chapters',
};

async function handler(ctx): Promise<Data> {
    const paramType = ctx.req.param('type');
    const type = paramType === '1' ? '2' : paramType;
    if (!Object.hasOwn(WPTYPE, type)) {
        throw new InvalidParameterError(`Unknown collection type: ${paramType}. Use 2 (Almanac), 3 (CSS Guides), or 4 (Classic Tricks).`);
    }
    const baseSelector = `body > div.page-wrap > section.post-sliders > div:nth-child(${type})`;
    const titleSelector = `${baseSelector}>div.post-slider-header.header-card > h2`;
    const descSelector = `${baseSelector}>div.post-slider-header.header-card > p`;
    const cardselector = `${baseSelector} article.mini-card.module.module-article`;

    const { title, description, cards } = await extractMiniCards(cardselector, titleSelector, descSelector);
    const items = await processWithWp(cards, true, WPTYPE[type]);
    return {
        title: title || 'Fresh From the Almanac',
        description: description || 'Properties, selectors, rules, and functions!',
        link: rootUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/favicon.ico`,
        icon: `${rootUrl}/favicon.ico`,
    };
}

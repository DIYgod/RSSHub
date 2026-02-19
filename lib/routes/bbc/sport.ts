import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { extractInitialData, fetchBbcContent } from './utils';

export const route: Route = {
    path: '/sport/:sport',
    name: 'Sport',
    maintainers: ['TonyRL'],
    handler,
    example: '/bbc/sport/formula1',
    parameters: {
        sport: 'The sport to fetch news for, can be found in the URL.',
    },
    radar: [
        {
            source: ['www.bbc.com/sport/:sport'],
        },
    ],
    categories: ['traditional-media'],
};

async function handler(ctx) {
    const { sport } = ctx.req.param();
    const link = `https://www.bbc.com/sport/${sport}`;

    const response = await ofetch(link);
    const $ = load(response);

    const initialData = extractInitialData($);
    const { page } = initialData.stores.metadata;

    const list: DataItem[] = Object.values(initialData.data)
        .filter((d) => d.name === 'hierarchical-promo-collection' && d.props.title !== 'Elsewhere on the BBC')
        .flatMap((d) => d.data.promos)
        .map((item) => ({
            title: item.headline,
            description: item.description,
            link: `https://www.bbc.com${item.url}`,
            pubDate: item.lastPublished ? parseDate(item.lastPublished) : undefined,
            image: item.image?.src.replace('/480/', '/1536/'),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { category, description } = await fetchBbcContent(item.link!, item);

                item.category = category;
                item.description = description;

                return item;
            })
        )
    );

    return {
        title: page.title,
        description: page.description,
        link,
        image: 'https://www.bbc.com/favicon.ico',
        item: items,
    };
}

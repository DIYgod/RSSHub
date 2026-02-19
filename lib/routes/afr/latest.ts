import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { assetsConnectionByCriteriaQuery } from './query';
import { getItem } from './utils';

export const route: Route = {
    path: '/latest',
    categories: ['traditional-media'],
    example: '/afr/latest',
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
            source: ['www.afr.com/latest', 'www.afr.com/'],
        },
    ],
    name: 'Latest',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.afr.com/latest',
};

async function handler(ctx: Context) {
    const limit = Number.parseInt(ctx.req.query('limit') ?? '10');
    const response = await ofetch('https://api.afr.com/graphql', {
        query: {
            query: assetsConnectionByCriteriaQuery,
            operationName: 'assetsConnectionByCriteria',
            variables: {
                brand: 'afr',
                first: limit,
                render: 'web',
                types: ['article', 'bespoke', 'featureArticle', 'liveArticle', 'video'],
                after: '',
            },
        },
    });

    const list = response.data.assetsConnectionByCriteria.edges.map(({ node }) => ({
        title: node.asset.headlines.headline,
        description: node.asset.about,
        link: `https://www.afr.com${node.urls.published.afr.path}`,
        pubDate: parseDate(node.dates.firstPublished),
        updated: parseDate(node.dates.modified),
        author: node.asset.byline,
        category: [node.tags.primary.displayName, ...node.tags.secondary.map((tag) => tag.displayName)],
        image: node.featuredImages && `https://static.ffx.io/images/${node.featuredImages.landscape16x9.data.id}`,
    }));

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => getItem(item))));

    return {
        title: 'Latest | The Australian Financial Review | AFR',
        description: 'The latest news, events, analysis and opinion from The Australian Financial Review',
        image: 'https://www.afr.com/apple-touch-icon-1024x1024.png',
        link: 'https://www.afr.com/latest',
        item: items,
    };
}

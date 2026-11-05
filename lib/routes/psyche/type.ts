import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getData, getHtmlData } from './utils';

export const route: Route = {
    path: '/type/:type',
    categories: ['new-media'],
    example: '/psyche/type/ideas',
    parameters: { type: 'Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['psyche.co/ideas'], target: '/type/ideas' },
        { source: ['psyche.co/guides'], target: '/type/guides' },
        { source: ['psyche.co/films'], target: '/type/films' },
    ],
    name: 'Types',
    maintainers: ['emdoe'],
    handler,
    description: 'Supported types: Ideas, Guides, and Films.',
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const url = `https://psyche.co/${type}`;
    const response = await ofetch(url);
    const $ = load(response);

    const serialized = $('script#__NEXT_DATA__').text();
    if (!serialized) {
        return {
            title: $('head title').text(),
            link: $('link[rel="canonical"]').attr('href') ?? url,
            description: $('meta[name="description"]').attr('content'),
            item: await getHtmlData($),
        };
    }
    const data = JSON.parse(serialized);
    const prefix = `https://psyche.co/_next/data/${data.buildId}`;
    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        link: `${url}/${item.slug}`,
        json: `${prefix}/${type}/${item.slug}.json`,
    }));

    const items = await getData(list);

    return {
        title: `Psyche | ${capitalizedType}`,
        link: url,
        item: items,
    };
}

import { Route } from '@/types';
import { load } from 'cheerio';
import { getData } from './utils';
import { ofetch } from 'ofetch';

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
        {
            source: ['psyche.co/:type'],
        },
    ],
    name: 'Types',
    maintainers: ['emdoe'],
    handler,
    description: `Supported types: Ideas, Guides, and Films.`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const url = `https://psyche.co/${type}`;
    const response = await ofetch(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        link: `https://psyche.co/${type}/${item.slug}`,
    }));

    const items = await getData(ctx, list);

    return {
        title: `Psyche | ${capitalizedType}`,
        link: url,
        item: items,
    };
}

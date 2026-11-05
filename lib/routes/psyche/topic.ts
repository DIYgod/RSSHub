import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getData, getHtmlData } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media'],
    example: '/psyche/topic/therapeia',
    parameters: { topic: 'Topic' },
    radar: [
        { source: ['psyche.co/therapeia'], target: '/topic/therapeia' },
        { source: ['psyche.co/eudaimonia'], target: '/topic/eudaimonia' },
        { source: ['psyche.co/poiesis'], target: '/topic/poiesis' },
    ],
    name: 'Topics',
    maintainers: ['emdoe'],
    handler,
    description: 'Supported categories: Therapeia, Eudaimonia, and Poiesis.',
};

async function handler(ctx) {
    const url = `https://psyche.co/${ctx.req.param('topic')}`;
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
    const articles = data.props.pageProps.articles;
    const prefix = `https://psyche.co/_next/data/${data.buildId}`;
    const list = Object.keys(articles).flatMap((type) =>
        articles[type].edges.map((item) => ({
            title: item.node.title,
            link: `https://psyche.co/${type}/${item.node.slug}`,
            json: `${prefix}/${type}/${item.node.slug}.json`,
        }))
    );

    const items = await getData(list);

    return {
        title: `Psyche | ${data.props.pageProps.section.title}`,
        link: url,
        description: data.props.pageProps.section.metaDescription,
        item: items,
    };
}

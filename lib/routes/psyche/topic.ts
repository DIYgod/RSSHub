import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
import { getData } from './utils';

export const route: Route = {
    path: '/topic/:topic',
    categories: ['new-media', 'popular'],
    example: '/psyche/topic/therapeia',
    parameters: { topic: 'Topic' },
    radar: [
        {
            source: ['psyche.co/:topic'],
        },
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

    const data = JSON.parse($('script#__NEXT_DATA__').text());
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

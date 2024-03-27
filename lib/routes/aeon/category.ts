import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { getData } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['new-media'],
    example: '/aeon/category/philosophy',
    parameters: { category: 'Category' },
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
            source: ['aeon.aeon.co/:category'],
        },
    ],
    name: 'Categories',
    maintainers: ['emdoe'],
    handler,
    description: `Supported categories: Philosophy, Science, Psychology, Society, and Culture.`,
};

async function handler(ctx) {
    const url = `https://aeon.co/${ctx.req.param('category')}`;
    const { data: response } = await got(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.section.articles.edges.map((item) => ({
        title: item.node.title,
        author: item.node.authors.map((author) => author.displayName).join(', '),
        link: `https://aeon.co/${item.node.type.toLowerCase()}s/${item.node.slug}`,
    }));

    const items = await getData(ctx, list);

    return {
        title: `AEON | ${data.props.pageProps.section.title}`,
        link: url,
        description: data.props.pageProps.section.metaDescription,
        item: items,
    };
}

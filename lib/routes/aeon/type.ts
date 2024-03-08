import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { getData } from './utils';

export const route: Route = {
    path: '/:type',
    categories: ['traditional-media'],
    example: '/aeon/essays',
    parameters: { type: 'Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['aeon.aeon.co/:type'],
    },
    name: 'Types',
    maintainers: ['emdoe'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const binaryType = type === 'videos' ? 'videos' : 'essays';
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

    const url = `https://aeon.co/${type}`;
    const { data: response } = await got(url);
    const $ = load(response);

    const data = JSON.parse($('script#__NEXT_DATA__').text());

    const list = data.props.pageProps.articles.map((item) => ({
        title: item.title,
        link: `https://aeon.co/${binaryType}/${item.slug}`,
        pubDate: item.createdAt,
    }));

    const items = await getData(ctx, list);

    return {
        title: `AEON | ${capitalizedType}`,
        link: url,
        item: items,
    };
}

import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
const rootUrl = 'https://www.coindesk.com';

export const route: Route = {
    path: '/consensus-magazine',
    categories: ['new-media'],
    example: '/coindesk/consensus-magazine',
    parameters: {},
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
            source: ['coindesk.com/'],
        },
    ],
    name: '新闻周刊',
    maintainers: ['jameshih'],
    handler,
    url: 'coindesk.com/',
};

async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? 'consensus-magazine';

    const response = await got.get(`${rootUrl}/${channel}/`);
    const $ = load(response.data);
    const content = JSON.parse(
        $('#fusion-metadata')
            .text()
            .match(/Fusion\.contentCache=(.*?);Fusion\.layout/)[1]
    );

    const o1 = content['websked-collections'];
    // Object key names are different every week
    const articles = o1[Object.keys(o1)[2]];

    const list = articles.data;

    const items = list.map((item) => ({
        title: item.headlines.basic,
        link: rootUrl + item.canonical_url,
        description: item.subheadlines.basic,
        pubDate: item.display_date,
    }));

    return {
        title: 'CoinDesk Consensus Magazine',
        link: `${rootUrl}/${channel}`,
        item: items,
    };
}

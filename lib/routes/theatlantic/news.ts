import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { getArticleDetails } from './utils';
export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: '/theatlantic/latest',
    parameters: { category: 'category, see below' },
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
            source: ['www.theatlantic.com/:category'],
        },
    ],
    name: 'News',
    maintainers: ['EthanWng97', 'pseudoyu'],
    handler,
    description: `| Popular      | Latest | Politics | Technology | Business |
  | ------------ | ------ | -------- | ---------- | -------- |
  | most-popular | latest | politics | technology | business |

  More categories (except photo) can be found within the navigation bar at [https://www.theatlantic.com](https://www.theatlantic.com)`,
};

async function handler(ctx) {
    const host = 'https://www.theatlantic.com';
    const category = ctx.req.param('category');
    const url = `${host}/${category}/`;
    const response = await ofetch(url);
    const $ = load(response);
    const contents = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.urqlState;
    const keyWithContent = Object.keys(contents).filter((key) => contents[key].data.includes(category));
    const data = JSON.parse(contents[keyWithContent].data);
    let list = Object.values(data)[0].river.edges;
    list = list.filter((item) => !item.node.url.startsWith('https://www.theatlantic.com/photo'));
    list = list.map((item) => {
        const data = {};
        data.link = item.node.url;
        data.pubDate = item.node.datePublished;
        return data;
    });
    const items = await getArticleDetails(list);

    return {
        title: `The Atlantic - ${category.toUpperCase()}`,
        link: url,
        description: `The Atlantic - ${category.toUpperCase()}`,
        item: items,
    };
}

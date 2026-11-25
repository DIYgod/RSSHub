import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { getArticleDetails } from './utils';

export const route: Route = {
    path: '/author/:id',
    categories: ['traditional-media'],
    example: '/theatlantic/author/alan-taylor',
    parameters: { id: 'Author ID, can be found in the author page URL' },
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
            source: ['www.theatlantic.com/author/:id'],
            target: '/author/:id',
        },
    ],
    name: 'Author',
    maintainers: ['pseudoyu'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const url = `https://www.theatlantic.com/author/${id}/`;
    const init = await ofetch.raw(url, { minVersion: 'TLSv1.3', ignoreResponseError: true });
    const headers = {
        cookie: init.headers
            .getSetCookie()
            .find((c) => c.startsWith('__cf_bm='))!
            .split(';', 1)[0],
    };
    const response = init.ok ? init._data : await ofetch(url, { minVersion: 'TLSv1.3', headers });
    const $ = load(response);
    const contents = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.urqlState;
    const data = Object.values<any>(contents).map((content) => Object.values<any>(JSON.parse(content.data))[0]);
    const author = data.find((entry) => entry?.displayName);
    const list = data
        .find((entry) => entry?.river)
        .river.edges.filter((item) => !item.node.url.startsWith('https://www.theatlantic.com/photo/'))
        .map((item) => ({ link: item.node.url, pubDate: item.node.datePublished }));
    const items = await getArticleDetails(list, headers);

    return {
        title: `The Atlantic - ${author?.displayName ?? id}`,
        link: url,
        image: author?.headshot?.url,
        item: items,
    };
}

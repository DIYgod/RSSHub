import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import got from '@/utils/got';

import { baseUrl, cookieJar, getArticle, getArticleList } from './utils';

export const route: Route = {
    path: '/highlight/:journal?',
    categories: ['journal'],
    example: '/nature/highlight',
    parameters: { journal: 'short name for a journal, `nature` by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: true,
    },
    radar: [
        {
            source: ['nature.com/:journal/articles', 'nature.com/'],
            target: '/highlight/:journal?',
        },
    ],
    name: 'Research Highlight',
    maintainers: ['y9c', 'TonyRL'],
    handler,
    description: `::: warning
Only some journals are supported.
:::`,
};

async function handler(ctx) {
    const { journal = 'nature' } = ctx.req.param();
    const url = `${baseUrl}/${journal}/articles?type=research-highlight`;

    const res = await got(url, { cookieJar });
    const $ = load(res.data);

    let items = getArticleList($);

    items = await pMap(items, getArticle, { concurrency: 3 });

    return {
        title: $('title').text(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}

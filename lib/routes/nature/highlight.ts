import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { baseUrl, cookieJar, getArticleList, getArticle } from './utils';

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
            source: ['nature.com/:journal/articles', 'nature.com/:journal', 'nature.com/'],
            target: '/highlight/:journal',
        },
    ],
    name: 'Research Highlight',
    maintainers: [],
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

    items = await Promise.all(items.map((item) => getArticle(item)));

    return {
        title: $('title').text().trim(),
        description: $('meta[name=description]').attr('content'),
        link: url,
        item: items,
    };
}

import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    example: '/everia/search/日向坂46',
    parameters: { keyword: 'Keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    name: 'Search',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `${SUB_URL}?s=${keyword}`;

    const response = await got(url);
    const $ = load(response.body);
    const itemRaw = $('article.post').toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Search: ${keyword}`,
        link: url,
        item: await Promise.all(
            itemRaw.map((e) => {
                const item = $(e);
                const link = item.find('h2.entry-title a').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}

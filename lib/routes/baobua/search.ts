import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['picture'],
    example: '/baobua/search/cos',
    parameters: { keyword: 'Keyword' },
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
            source: ['baobua.com/search'],
            target: '/search/:keyword',
        },
    ],
    name: 'Search',
    maintainers: ['AiraNadih'],
    handler,
    url: 'baobua.com/',
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `${SUB_URL}search?q=${keyword}`;

    const response = await got(url);
    const $ = load(response.body);
    const itemRaw = $('.thcovering-video').toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Search: ${keyword}`,
        link: url,
        item: await Promise.all(
            itemRaw
                .map((e) => {
                    const item = $(e);
                    let link = item.find('a').attr('href');
                    if (!link) {
                        return null;
                    }
                    if (link.startsWith('/')) {
                        link = new URL(link, SUB_URL).href;
                    }
                    return cache.tryGet(link, () => loadArticle(link));
                })
                .filter(Boolean)
        ),
    };
}

import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/baobua',
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
            source: ['baobua.com/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['AiraNadih'],
    handler,
    url: 'baobua.com/',
};

async function handler() {
    const response = await got(SUB_URL);
    const $ = load(response.body);
    const itemRaw = $('.thcovering-video').toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Latest`,
        link: SUB_URL,
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

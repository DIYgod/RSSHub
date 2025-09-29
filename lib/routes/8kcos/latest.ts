import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';
const url = SUB_URL;

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/8kcos/',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['8kcosplay.com/'],
            target: '',
        },
    ],
    name: '最新',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const response = await got(url);
    const itemRaw = load(response.body)('ul.post-loop li.item').toArray();
    return {
        title: `${SUB_NAME_PREFIX}-最新`,
        link: url,
        item:
            response.body &&
            (await Promise.all(
                (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                    const { href } = load(e)('h2 > a')[0].attribs;
                    return cache.tryGet(href, () => loadArticle(href));
                })
            )),
    };
}

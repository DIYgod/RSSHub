import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';
export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/8kcos/tag/cosplay',
    parameters: { tag: '标签名' },
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
            source: ['8kcosplay.com/tag/:tag'],
        },
    ],
    name: '标签',
    maintainers: ['KotoriK'],
    handler,
    url: '8kcosplay.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit'));
    const tag = ctx.req.param('tag');
    const url = `${SUB_URL}tag/${tag}/`;
    const resp = await got(url);
    const $ = load(resp.body);
    const itemRaw = $('li.item').toArray();

    return {
        title: `${SUB_NAME_PREFIX}-${$('span[property=name]:not(.hide)').text()}`,
        link: url,
        item: await Promise.all(
            (limit ? itemRaw.slice(0, limit) : itemRaw).map((e) => {
                const { href } = load(e)('h2 > a')[0].attribs;
                return cache.tryGet(href, () => loadArticle(href));
            })
        ),
    };
}

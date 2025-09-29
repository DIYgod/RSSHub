import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/',
    categories: ['picture'],
    example: '/everia',
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
            source: ['everia.club/'],
            target: '',
        },
    ],
    name: 'Latest',
    maintainers: ['KTachibanaM', 'AiraNadih'],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const response = await got(SUB_URL);
    const $ = load(response.body);
    const itemRaw = $('article.blog-entry').slice(0, limit).toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Latest`,
        link: SUB_URL,
        item: await Promise.all(
            itemRaw.map((e) => {
                const item = $(e);
                const link = item.find('h2.entry-title a').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}

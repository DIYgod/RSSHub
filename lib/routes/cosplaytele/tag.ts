import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/cosplaytele/tag/aqua',
    parameters: { tag: 'Tag' },
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
            source: ['cosplaytele.com/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['AiraNadih'],
    handler,
    url: 'cosplaytele.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const tag = ctx.req.param('tag');
    const tagUrl = `${SUB_URL}tag/${tag}/`;

    const response = await got(tagUrl);
    const $ = load(response.body);
    const itemRaw = $('#content .post-item').slice(0, limit).toArray();

    return {
        title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
        link: tagUrl,
        item: await Promise.all(
            itemRaw.map((e) => {
                const item = $(e);
                const link = item.find('h5.post-title a').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}

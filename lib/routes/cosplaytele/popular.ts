import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';

export const route: Route = {
    path: '/popular/:period',
    categories: ['picture'],
    example: '/cosplaytele/popular/3',
    parameters: { period: 'Days' },
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
            source: ['cosplaytele.com/:period'],
            target: '/popular/:period',
        },
    ],
    name: 'Popular',
    maintainers: ['AiraNadih'],
    handler,
    url: 'cosplaytele.com/',
};

function getPeriodConfig(period) {
    if (period === '1') {
        return {
            url: `${SUB_URL}24-hours/`,
            range: 'daily',
            title: `${SUB_NAME_PREFIX} - Top views in 24 hours`,
        };
    }
    return {
        url: `${SUB_URL}${period}-day/`,
        range: `last${period}days`,
        title: `${SUB_NAME_PREFIX} - Top views in ${period} days`,
    };
}

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const period = ctx.req.param('period');

    const { url, range, title } = getPeriodConfig(period);

    const { data } = await got.post(`${SUB_URL}wp-json/wordpress-popular-posts/v2/widget`, {
        json: {
            limit,
            range,
            order_by: 'views',
        },
    });

    const $ = load(data.widget);
    const links = $('.wpp-list li')
        .toArray()
        .map((post) => $(post).find('.wpp-post-title').attr('href'))
        .filter((link) => link !== undefined);

    return {
        title,
        link: url,
        item: await Promise.all(links.map((link) => cache.tryGet(link, () => loadArticle(link)))),
    };
}

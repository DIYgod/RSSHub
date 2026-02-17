import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';

import loadArticle from './article';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import type { WPPost } from './types';

export const route: Route = {
    path: '/popular/:period',
    categories: ['picture'],
    example: '/4kup/popular/7',
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
            source: ['4kup.net/:period'],
            target: '/popular/:period',
        },
    ],
    name: 'Popular',
    maintainers: ['AiraNadih'],
    handler,
    url: '4kup.net/',
};

function getPeriodConfig(period) {
    if (period === '7') {
        return {
            url: `${SUB_URL}hot-of-week/`,
            range: 'last7days',
            title: `${SUB_NAME_PREFIX} - Top views in 7 days`,
        };
    } else if (period === '30') {
        return {
            url: `${SUB_URL}hot-of-month/`,
            range: 'last30days',
            title: `${SUB_NAME_PREFIX} - Top views in 30 days`,
        };
    }
    return {
        url: `${SUB_URL}most-view/`,
        range: `all`,
        title: `${SUB_NAME_PREFIX} - Most views`,
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
    const slugs = links.map((link) => link.split('/').findLast(Boolean));
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?slug=${slugs.join(',')}&per_page=${limit}`);

    return {
        title,
        link: url,
        item: posts.map((post) => loadArticle(post as WPPost)),
    };
}

import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';

export const route: Route = {
    path: '/popular/:period',
    categories: ['picture', 'popular'],
    example: '/4kup/popular/7',
    parameters: { period: 'Days' },
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
    const posts = $('.wpp-list li').toArray();

    return {
        title,
        link: url,
        item: await Promise.all(
            posts.map((post) => {
                const link = $(post).find('.wpp-post-title').attr('href');
                return cache.tryGet(link, () => loadArticle(link));
            })
        ),
    };
}

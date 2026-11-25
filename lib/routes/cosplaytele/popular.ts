import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { compareDates, parseDate } from '@/utils/time';

import { loadArticle } from './article';
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
            source: ['cosplaytele.com/3-day'],
            target: '/popular/3',
        },
        {
            source: ['cosplaytele.com/7-day'],
            target: '/popular/7',
        },
        {
            source: ['cosplaytele.com/24-hours'],
            target: '/popular/1',
        },
    ],
    name: 'Popular',
    maintainers: ['AiraNadih'],
    handler,
    url: 'cosplaytele.com/',
};

function getPeriodConfig(period: string) {
    if (period === '1') {
        return {
            url: `${SUB_URL}24-hours/`,
            rangeConfig: { range: 'daily' },
            title: `${SUB_NAME_PREFIX} - Top views in 24 hours`,
        };
    }
    return {
        url: `${SUB_URL}${period}-day/`,
        rangeConfig: { range: 'custom', time_quantity: Number(period), time_unit: 'day' },
        title: `${SUB_NAME_PREFIX} - Top views in ${period} days`,
    };
}

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 20);
    const sorted = ctx.req.query('sorted') !== 'false';
    const period = ctx.req.param('period');

    const { url, rangeConfig, title } = getPeriodConfig(period);

    const { data } = await got.post(`${SUB_URL}wp-json/wordpress-popular-posts/v2/widget`, {
        json: {
            limit: sorted ? Math.max(20, limit) : limit,
            ...rangeConfig,
            order_by: 'views',
            stats_tag: { date: { active: true, format: 'c' } },
        },
    });

    const $ = load(data.widget);
    const posts = $('.wpp-list li')
        .toArray()
        .map((post) => ({
            link: $(post).find('.wpp-post-title').attr('href'),
            pubDate: parseDate($(post).find('.wpp-date').text().replace('posted on ', '')),
        }));
    if (sorted) {
        posts.sort((a, b) => compareDates(b.pubDate, a.pubDate));
    }

    return {
        title,
        link: url,
        item: await pMap(posts.slice(0, limit), (post) => cache.tryGet(post.link!, () => loadArticle(post.link)), { concurrency: 3 }),
    };
}

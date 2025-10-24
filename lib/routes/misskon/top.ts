import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { getPosts } from './utils';

export const route: Route = {
    path: '/top/:k',
    categories: ['picture'],
    example: '/misskon/top/60',
    parameters: { k: 'Top k days, can be 3, 7, 30 or 60' },
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
            title: 'Top 3 days',
            source: ['misskon.com/top3/'],
            target: '/top/3',
        },
        {
            title: 'Top 7 days',
            source: ['misskon.com/top7/'],
            target: '/top/7',
        },
        {
            title: 'Top 30 days',
            source: ['misskon.com/top30/'],
            target: '/top/30',
        },
        {
            title: 'Top 60 days',
            source: ['misskon.com/top60/'],
            target: '/top/60',
        },
    ],
    name: 'Top k days',
    maintainers: ['Urabartin'],
    handler: async (ctx) => {
        const { k } = ctx.req.param();
        if (!['3', '7', '30', '60'].includes(k)) {
            throw new Error(`Invalid k: k=${k}`);
        }
        const topLink = `https://misskon.com/top${k}/`;
        const response = await ofetch(topLink);
        const $ = load(response);

        const feedTitle = $('.page-title').text();
        const feedDesc = $('.content > p').first().text();
        const itemSlugs = $('#main-content article.item-list > h2 a')
            .toArray()
            .map((link) => new URL($(link).attr('href') || '').pathname.slice(1, -1));
        const searchParams = new URLSearchParams();
        searchParams.set('slug', itemSlugs.join(','));
        searchParams.set('per_page', itemSlugs.length.toString());
        return {
            title: `MissKON - ${feedTitle}`,
            link: topLink,
            description: feedDesc,
            item: await getPosts(searchParams),
        };
    },
};

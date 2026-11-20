import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { getHeaders } from './utils';

export const route: Route = {
    path: '/article/:uid',
    categories: ['shopping'],
    example: '/smzdm/article/6902738986',
    parameters: { uid: '用户 id，网址上直接可以看到' },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['zhiyou.smzdm.com/member/:uid/article'],
        },
    ],
    name: '用户文章',
    maintainers: ['salviox'],
    handler,
};

async function handler(ctx) {
    const link = `https://zhiyou.smzdm.com/member/${ctx.req.param('uid')}/article/`;

    const response = await ofetch.raw(link, {
        headers: getHeaders(),
    });
    const cookie = getHeaders().cookie || [...response.headers.getSetCookie().map((c) => c.split(';', 1)[0]), `x-waf-captcha-referer=${link}`].join('; ');
    const $ = load(response._data);
    const title = $('.user-profile-card__name').text();

    const list = $('.feed-article-card')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.feed-article-card__title-link');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
                image: $item.find('.feed-card-image__img').attr('src'),
            };
        });

    const out = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!, {
                    headers: {
                        cookie,
                    },
                });
                const $ = load(response);
                const description = $('article.J_article').html() ?? undefined;
                const ldJson = JSON.parse($('script[type="application/ld+json"]:contains("datePublished")').text() || '{}');
                const releaseDate = $('meta[property="og:release_date"]').attr('content');
                const pubDate = releaseDate ? parseDate(releaseDate, 'YYYY-MM-DD HH:mm:ss', 8) : undefined;
                const author = ldJson.author?.name;
                const category = [...(ldJson.about?.map((a) => a.name) || []), ...(ldJson.mentions?.map((m) => m.name) || [])];

                return { description, pubDate, author, category };
            });
            return { ...item, ...detail, description: detail.description ?? item.description, pubDate: detail.pubDate ?? item.pubDate };
        },
        { concurrency: 3 }
    );

    return {
        title: `${title}-什么值得买`,
        description: $('.user-profile-card__bio').text(),
        image: $('.user-profile-card__avatar').attr('src'),
        link,
        item: out,
    };
}

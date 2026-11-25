import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

import { getHeaders } from './utils';

export const route: Route = {
    path: '/baoliao/:uid',
    categories: ['shopping'],
    example: '/smzdm/baoliao/7367111021',
    parameters: { uid: '用户id，网址上直接可以看到' },
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
            source: ['zhiyou.smzdm.com/member/:uid/baoliao'],
        },
    ],
    name: '用户爆料',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const link = `https://zhiyou.smzdm.com/member/${ctx.req.param('uid')}/baoliao/`;

    const response = await ofetch.raw(link, {
        headers: getHeaders(),
    });
    const cookie = getHeaders().cookie || [...response.headers.getSetCookie().map((c) => c.split(';', 1)[0]), `x-waf-captcha-referer=${link}`].join('; ');
    const $ = load(response._data);
    const title = $('.user-profile-card__name').text();

    const list = $('.feed-horizontal-card')
        .toArray()
        .map((item): DataItem => {
            const a = $(item).find('.feed-horizontal-card__title-link');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
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
                const description = $('.detail-article-body__content').html();
                const published = $('meta[name="weibo:webpage:create_at"]').attr('content');
                const pubDate = published && /^\d{4}-\d{2}-\d{2}/.test(published) ? parseDate(published) : undefined;

                return { description, pubDate };
            });
            return { ...item, ...detail, pubDate: detail.pubDate || item.pubDate, author: title };
        },
        { concurrency: 3 }
    );

    return {
        title: `${title}的爆料 - 什么值得买`,
        description: $('.user-profile-card__bio').text(),
        image: $('.user-profile-card__avatar').attr('src'),
        link,
        item: out,
    };
}

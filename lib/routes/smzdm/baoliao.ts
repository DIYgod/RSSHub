import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const title = $('.info-stuff-nickname').text();

    const list = $('.pandect-content-stuff')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const published = $item.find('.pandect-content-time').text();
            return {
                title: $item.find('.pandect-content-title a').text(),
                link: $item.find('.pandect-content-title a').attr('href'),
                pubDate: published ? timezone(parseDate(published, ['YYYY-MM-DD', 'MM-DD HH:mm']), 8) : undefined,
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
                const description = $('article.txt-detail').html();
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
        description: $('.info-stuff-words div').text(),
        image: `https:${$('.avatar-img').attr('src')}`,
        link,
        item: out,
    };
}

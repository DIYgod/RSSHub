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
            return {
                title: $item.find('.pandect-content-title a').text(),
                link: $item.find('.pandect-content-title a').attr('href'),
                pubDate: timezone(parseDate($item.find('.pandect-content-time').text(), ['YYYY-MM-DD', 'MM-DD HH:mm']), 8),
            };
        });

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!, {
                    headers: {
                        cookie,
                    },
                });
                const $ = load(response);
                item.description = $('article.txt-detail').html();
                item.pubDate = timezone(parseDate($('.time').text().replace('更新时间：', '')), 8);
                item.author = title;

                return item;
            }),
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

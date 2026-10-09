import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const title = $('.info-stuff-nickname a').text();

    const list = $('.pandect-content-common')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('.pandect-content-title a');
            return {
                title: a.text(),
                description: $item.find('.pandect-content-detail').text(),
                link: a.attr('href'),
                pubDate: timezone(parseDate($item.find('.pandect-content-time').text(), ['YYYY-MM-DD', 'MM-DD HH:mm']), 8),
                image: $item.find('.pandect-content-img img').attr('src'),
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
                const article = $('.m-contant article');
                article.find('h1, .recommend-tab, input, .the-end').remove();
                item.description = article.html() ?? item.description;
                const ldJson = JSON.parse($('script[type="application/ld+json"]:contains("datePublished")').text() || '{}');
                item.pubDate = $('meta[property="og:release_date"]').length ? timezone(parseDate($('meta[property="og:release_date"]').attr('content')!, 'YYYY-MM-DD HH:mm:ss'), 8) : item.pubDate;
                item.author = ldJson.author?.name;
                item.category = [...(ldJson.about?.map((a) => a.name) || []), ...(ldJson.mentions?.map((m) => m.name) || [])];

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `${title}-什么值得买`,
        description: $('.info-stuff-words div').text(),
        image: `https:${$('.avatar-img').attr('src')}`,
        link,
        item: out,
    };
}

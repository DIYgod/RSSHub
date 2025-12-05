import * as url from 'node:url';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const host = 'http://jhsjk.people.cn';

export const route: Route = {
    path: '/xjpjh/:keyword?/:year?',
    categories: ['traditional-media'],
    example: '/people/xjpjh',
    parameters: { keyword: '关键词，默认不填', year: '年份，默认 all' },
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
            source: ['people.com.cn/'],
            target: '/:site?/:category?',
        },
    ],
    name: '习近平系列重要讲话',
    maintainers: [],
    handler,
    url: 'people.com.cn/',
};

async function handler(ctx) {
    let keyword = ctx.req.param('keyword') || 'all';
    let year = ctx.req.param('year') || 0;

    let title = '习近平系列重要讲话';
    title = title + '-' + keyword;
    if (keyword === 'all') {
        keyword = '';
    }
    if (year === 0) {
        title = title + '-all';
    } else {
        title = title + '-' + year;
        year = year - 1811;
    }

    const link = `http://jhsjk.people.cn/result?keywords=${keyword}&year=${year}`;
    const response = await got.get(link);

    const $ = load(response.data);

    const list = $('ul.list_14.p1_2.clearfix li')
        .slice(0, 10)
        .toArray()
        .map((element) => {
            const info = {
                title: $(element).find('a').text(),
                link: $(element).find('a').attr('href'),
            };
            return info;
        });

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const itemUrl = url.resolve(host, info.link);

            const cacheIn = await cache.get(itemUrl);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            const response = await got.get(itemUrl);
            const $ = load(response.data);
            const description = $('div.d2txt_con.clearfix').html().trim();

            const single = {
                title,
                link: itemUrl,
                description,
            };
            cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );

    return {
        title,
        link,
        item: out,
    };
}

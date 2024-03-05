// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
const url = require('url');

const host = 'http://jhsjk.people.cn';

export default async (ctx) => {
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
        .map(function () {
            const info = {
                title: $(this).find('a').text(),
                link: $(this).find('a').attr('href'),
            };
            return info;
        })
        .get();

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

    ctx.set('data', {
        title,
        link,
        item: out,
    });
};

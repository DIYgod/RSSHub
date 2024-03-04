// @ts-nocheck
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';

const fetch = require('./fetch-article');

export default async (ctx) => {
    const url = 'https://www.twreporter.org';
    const res = await got(url);
    const $ = load(res.data);
    const list = $('.gKMjSz').get();

    const out = await Promise.all(
        list.map((item) => {
            const $ = load(item);
            const address = url + $('a').attr('href');
            const title = $('.latest-section__Title-hzxpx3-6').text();
            return cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                return single;
            });
        })
    );
    ctx.set('data', {
        title: `報導者 | 最新`,
        link: url,
        item: out,
    });
};

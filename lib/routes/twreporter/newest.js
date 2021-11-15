import cheerio from 'cheerio';
import got from '~/utils/got.js';

import fetch from './fetch_article.js';

export default async (ctx) => {
    const url = 'https://www.twreporter.org';
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.gKMjSz').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const address = url + $('a').attr('href');
            const title = $('.dpNivU').text();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }

            const single = await fetch(address);
            single.title = title;

            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: `報導者 | 最新`,
        link: url,
        item: out,
    };
};

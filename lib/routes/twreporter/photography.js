import cheerio from 'cheerio';
import got from '~/utils/got.js';

import fetch from './fetch_article.js';

export default async (ctx) => {
    const baseURL = 'https://www.twreporter.org';
    const url = baseURL + `/photography`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const coverList = $('.WPJvn').get();
    const commonList = $('.eVNsZf').get();

    const coverView = await Promise.all(
        coverList.map(async (item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.gRCDdm').text();

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

    const listView = await Promise.all(
        commonList.map(async (item) => {
            const $ = cheerio.load(item);
            const address = baseURL + $('li > a').attr('href');
            const title = $('.etJLWI').text();

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
        title: `報導者 | 影像`,
        link: url,
        item: coverView.concat(listView),
    };
};

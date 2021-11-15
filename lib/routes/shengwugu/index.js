import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const url = `http://news.bioon.com/${ctx.params.uid}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.cntx').get();

    const out = await Promise.all(
        list.slice(0, 3).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.cntx h4 a').text();
            const address = $('.cntx h4 a').attr('href');
            const time = $('.fl huise').text();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            const contents = get('.text3').html();
            const single = {
                title,
                pubDate: time,
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};

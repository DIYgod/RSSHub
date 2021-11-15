import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const url = `http://www.xwlb.net.cn/video.html`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.post_body').get();

    const out = await Promise.all(
        list.slice(0, 2).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h2 a').attr('title');
            const address = $('h2 a').attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);

            const contents = get('.content').html();
            const single = {
                title,
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

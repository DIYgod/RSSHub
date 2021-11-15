import cheerio from 'cheerio';
import got from '~/utils/got.js';

export default async (ctx) => {
    const url = `http://${ctx.params.column}.bio1000.com/${ctx.params.id}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.excerpt-1').get();

    const out = await Promise.all(
        list.slice(0, 5).map(async (item) => {
            const $ = cheerio.load(item);
            const time = $('.meta').text();
            const title = $('header h2 a').attr('title');
            const address = $('header h2 a').attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }
            const res = await got.get(address);
            const get = cheerio.load(res.data);
            const contents = get('.article-content').html();
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
        title: '生物帮',
        link: url,
        item: out,
    };
};

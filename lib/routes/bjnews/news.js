import cheerio from 'cheerio';
import date from '~/utils/date.js';
import got from '~/utils/got.js';

export default async (ctx) => {
    const url = `http://www.bjnews.com.cn/${ctx.params.cat}`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('#waterfall-container .pin_demo > a').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('.pin_tit').text();
            const itemUrl = $('a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }

            const responses = await got.get(itemUrl);
            const $d = cheerio.load(responses.data);
            $d('img').each((i, e) => $(e).attr('referrerpolicy', 'no-referrer'));

            const single = {
                title,
                pubDate: date($d('.left-info .timer').text(), +8),
                author: $d('.left-info .reporter').text(),
                link: itemUrl,
                guid: itemUrl,
                description: $d('#contentStr').html(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};

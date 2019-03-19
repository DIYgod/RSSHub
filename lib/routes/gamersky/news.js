const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'https://www.gamersky.com/news/';
    const res = await axios({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(res.data);
    const list = $('.Mid2L_con li')
        .slice(0, 10)
        .get();
    const out = await Promise.all(
        list.map(async (i) => {
            const item = $(i);
            const itemUrl = $(item)
                .find('.tt')
                .attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const title = $(item)
                .find('.tt')
                .text();
            const content = $(item)
                .find('.txt')
                .text();
            const pageInfo = $(item)
                .find('.time')
                .text();
            const regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
            const regRes = regex.exec(pageInfo);
            const time = regRes === null ? new Date() : new Date(regRes[0]);
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);
            const single = {
                title: title,
                description: content,
                pubDate: time.toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: '游民星空-今日推荐',
        link: url,
        item: out,
    };
};

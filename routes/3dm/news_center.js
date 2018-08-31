const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'http://www.3dmgame.com/news/';
    const res = await axios({
        method: 'get',
        url: url,
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.news_list .list li')
        .slice(0, 10)
        .get();
    const out = await Promise.all(
        list.map(async (i) => {
            const item = $(i);
            const itemUrl = $(item)
                .find('.selectarcpost')
                .attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const title = $(item)
                .find('.bt')
                .text();
            const content = $(item)
                .find('p')
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
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: out,
    };
};

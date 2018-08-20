const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'http://www.3dmgame.com/news/';
    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
        },
    });
    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.news_list .list li');
    const out = [];

    for (let i = 0; i < Math.min(list.length, 10); i++) {
        const $ = cheerio.load(data);
        const item = list[i];
        const itemUrl = $(item)
            .find('.selectarcpost')
            .attr('href');
        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
            out.push(JSON.parse(cache));
            continue;
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
        out.push(single);

        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
    }
    ctx.state.data = {
        title: $('title')
            .text()
            .split('_')[0],
        link: url,
        item: out,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

const sourceTimezoneOffset = -8;
module.exports = async (ctx) => {
    const url = 'http://www.3dmgame.com/news/';
    const res = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(res.data);
    const list = $('.Revision_list .selectpost').get();
    const out = await Promise.all(
        list.map(async (i) => {
            const item = $(i);
            const itemUrl = $(item).find('.text').find('a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const title = $(item).find('.text').find('.bt').text();

            const category = $(item).find('.text').find('.bq').find('a').text();

            const itemReponse = await got.get(itemUrl);
            const itemElement = cheerio.load(itemReponse.data);
            const description = itemElement('.news_warp_center').html();

            const pageInfo = $(item).find('.time').text();
            const regex = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
            const regRes = regex.exec(pageInfo);
            const time = regRes === null ? new Date() : new Date(regRes[0]);
            time.setTime(time.getTime() + (sourceTimezoneOffset - time.getTimezoneOffset() / 60) * 60 * 60 * 1000);

            const single = {
                title,
                category,
                description,
                pubDate: time.toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };

            ctx.cache.set(itemUrl, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '3DM - ' + $('title').text().split('_')[0],
        link: url,
        item: out,
    };
};

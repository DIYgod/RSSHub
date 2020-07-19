const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const host = 'http://news.paidai.com/';

module.exports = async (ctx) => {
    const link = host;
    const response = await got({
        method: 'get',
        url: link,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    });

    const $ = cheerio.load(response.data);

    const list = $('.news_list ul.list>li')
        .slice(0, 11)
        .map(function () {
            const info = {
                title: $(this).find('h3 a').attr('title'),
                link: $(this).find('h3').find('a').attr('href'),
                date: $(this).find('.post_info').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const link = info.link;
            return await ctx.cache.tryGet(link, async () => await utils.ProcessFeed(info));
        })
    );

    ctx.state.data = {
        title: `商道-派代`,
        link: link,
        item: out,
    };
};

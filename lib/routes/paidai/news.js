const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

const host = 'http://www.paidai.com/';

module.exports = async (ctx) => {
    const link = host;
    const response = await got({
        method: 'get',
        url: link,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    });

    const $ = cheerio.load(response.data);

    const list = $('#topic_list ul li.topic')
        .slice(0, 11)
        .map(function () {
            const info = {
                title: $('.li_1 a.i_title', this).attr('title'),
                link: $('.li_1 a.i_title', this).attr('href'),
                date: $('.li_2 .li_s', this).text(),
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

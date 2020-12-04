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

    const list = $('#topic_list ul li')
        .slice(0, 11)
        .map(function () {
            const info = {
                title: $(this).find('a.i_title').attr('title'),
                link: $(this).find('div.li_1').find('a.i_title').attr('href'),
                date: $(this).find('em.li_s').text(),
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
        title: `首页-派代`,
        link: link,
        item: out,
    };
};

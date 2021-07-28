const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const util = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const host = `http://www.aisixiang.com/data/search.php?lanmu=${id}`;

    const response = await got.get(host, {
        responseType: 'buffer',
    });

    response.data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(response.data);

    const list = $('.search_list > ul > li > a:nth-child(2)').slice(0, 10).get();

    const columnName = $('.search_list > ul > li:nth-child(1) > a:nth-child(1)').text();

    const items = await Promise.all(
        list.map(async (e) => {
            const link = $(e).attr('href');
            return await ctx.cache.tryGet(link, async () => await util.ProcessFeed(link));
        })
    );

    ctx.state.data = {
        title: `爱思想栏目 - ${columnName}`,
        link: host,
        description: `爱思想栏目 - ${columnName}`,
        item: items,
    };
};

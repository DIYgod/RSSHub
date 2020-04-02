const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const util = require('./utils');

module.exports = async (ctx) => {
    const { type = 1, range = 1 } = ctx.params;

    const host = `http://www.aisixiang.com/toplist/index.php?id=${type}&period=${range}`;

    const response = await got.get(host, {
        responseType: 'buffer',
    });

    response.data = iconv.decode(response.data, 'gbk');

    const $ = cheerio.load(response.data);

    const list = $('.tops_list > .tips > a').slice(0, 10).get();

    const columnName = $('.tops_text > h3')[0].firstChild.nodeValue;

    const items = await Promise.all(
        list.map(async (e) => {
            const link = $(e).attr('href');
            return await ctx.cache.tryGet(link, async () => await util.ProcessFeed(link));
        })
    );

    ctx.state.data = {
        title: `爱思想 - ${columnName}`,
        link: host,
        description: `爱思想 - ${columnName}`,
        item: items,
    };
};

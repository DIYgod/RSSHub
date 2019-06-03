const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const link = `https://www.jianshu.com/trending/${ctx.params.timeframe}`;
    const response = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li').get();

    const result = await util.ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `简书 ${ctx.params.timeframe === 'weekly' ? '7' : '30'} 日热门`,
        link,
        description: `简书 ${ctx.params.timeframe === 'weekly' ? '7' : '30'} 日热门`,
        item: result,
    };
};

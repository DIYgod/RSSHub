const got = require('@/utils/got');
const cheerio = require('cheerio');
const { host, acw_sc__v2, parseList, parseItems } = require('./utils');

module.exports = async (ctx) => {
    const { name } = ctx.params;

    const link = `${host}/channel/${name}`;
    const { data: pageResponse } = await got(link);
    const { data: apiResponse } = await got(`${host}/gateway/articles`, {
        searchParams: {
            query: 'channel',
            slug: name,
            offset: 0,
            size: ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20,
            mode: 'scrollLoad',
        },
    });

    const $ = cheerio.load(pageResponse);
    const channelName = $('#leftNav > a.active').text();

    const list = parseList(apiResponse.rows);

    const acwScV2Cookie = await acw_sc__v2(list[0].link, ctx.cache.tryGet);

    const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `segmentfault - ${channelName}`,
        link,
        item: items,
    };
};

const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const link_base = 'https://pianyuan.org/';
    const description = '搜索';
    // 适配jackett 搜索api, eg: https://rsshub.app/pianyuan/indexers/pianyuan/results/search/api?t=test&q=halo
    const searchKey = ctx.originalUrl.split('&q=')[1];
    const link = link_base + `search?q=${searchKey}`;

    const response = await utils.request(link, ctx.cache);
    const $ = cheerio.load(response.data);
    // 只获取第一页的搜索结果
    const searchLinks = $('.nomt > a')
        .get()
        .map((a) => $(a).attr('href'));
    if (searchLinks.length === 0) {
        throw 'pianyuan 搜索失败';
    }

    const detailLinks = [];

    await Promise.all(
        searchLinks.map(async (e) => {
            const link = new URL(e, link_base).href;
            const single = await ctx.cache.tryGet(link, async () => {
                const res = await utils.request(link, ctx.cache);
                const content = cheerio.load(res.data);
                content('.ico.ico_bt')
                    .get()
                    .map((a) => detailLinks.push($(a).attr('href')));
            });
            return single;
        })
    );

    const items = await utils.ProcessFeed(detailLinks, ctx.cache);

    ctx.state.data = {
        title: '片源网',
        description,
        link: link_base,
        item: items,
    };
};

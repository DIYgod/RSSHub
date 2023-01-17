const utils = require('./utils');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const base = utils.urlBase(ctx.params.caty, ctx.params.id);
    const res = await got.get(base);
    const info = utils.fetchAllArticles(res.data);
    const $ = cheerio.load(res.data);

    const details = await Promise.all(info.map((e) => utils.detailPage(e.link, ctx.cache)));

    ctx.state.json = {
        info,
    };

    ctx.state.data = {
        title: '大数据专家委员会 - ' + $('.position a:last-child').text(),
        link: base,
        item: info.map((e, i) => ({
            title: e.title,
            description: utils.renderDesc(details[i].description),
            link: e.link,
        })),
    };
};

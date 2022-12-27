const utils = require('./utils');
const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const base = utils.urlBase(ctx.params.caty, ctx.params.id);
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllArticles(res.data, base);

    const details = await Promise.all(info.map((e) => utils.detailPage(e.link, ctx.cache)));

    ctx.state.json = {
        info,
    };

    ctx.state.data = {
        title: '大数据专家委员会 - ' + utils.configs[ctx.params.caty].child[ctx.params.id].title,
        link: base,
        item: info.map((e, i) => ({
            title: e.title,
            description: utils.renderDesc(details[i].description),
            pubDate: details[i].pubDate || dateParser(new Date().toISOString()), // No Time for now
            link: e.link,
        })),
    };
};

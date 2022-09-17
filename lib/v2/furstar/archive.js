const utils = require('./utils');
const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const base = utils.langBase(ctx.params.lang);
    const url = `${base}/archive.php`;
    const res = await got.get(url, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllCharacters(res.data, base);

    ctx.state.data = {
        title: 'Furstar 已出售角色',
        link: 'https://furstar.jp',
        description: 'Furstar 已经出售或预订的角色列表',
        language: ctx.params.lang,
        item: info.map((e) => ({
            title: e.title,
            author: e.author.name,
            description: `<img src="${e.headImage}"/> ${utils.renderAuthor(e.author)}`,
            pubDate: dateParser(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    };
};

const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const base = utils.langBase(ctx.params.lang);
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const $ = cheerio.load(res.data);
    const artists = $('.filter-item')
        .map((i, e) => utils.authorDetail(e))
        .get();
    artists.shift(); // the first one is "show all"

    ctx.state.data = {
        title: 'furstar 所有画家',
        link: 'https://furstar.jp',
        description: 'Furstar 所有画家列表',
        language: ctx.params.lang,
        item: artists.map((e) => ({
            title: e.name,
            author: e.name,
            description: `<img src="${e.avatar}"/><a href="${base}/${e.link}">${e.name}</a>`,
            pubDate: dateParser(new Date().toISOString()), // No Time for now
            link: `${base}/${e.link}`,
        })),
    };
};

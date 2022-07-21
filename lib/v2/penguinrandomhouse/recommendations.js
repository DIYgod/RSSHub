const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const dateParser = require('@/utils/dateParser');

module.exports = async (ctx) => {
    const base = 'https://www.penguinrandomhouse.com/content-archive/';
    const res = await got.get(base);
    const $ = cheerio.load(res.data);

    const itemArray = $('.archive-module-half-container,.archive-module-third-container')
        .map(function () {
            return {
                url: $(this).find('a').attr('href'),
                title: $(this).find('.archive-module-text').first().text(),
                pubDate: dateParser(new Date().toISOString()),
            };
        })
        .get();

    const out = await utils.parseList(itemArray, ctx);

    ctx.state.data = {
        title: 'Penguin Random House Recommendations',
        link: 'https://www.penguinrandomhouse.com/content-archive/',
        description: 'Browse through lists, essays, author interviews, and articles. Find something for every reader.',
        language: ctx.params.lang,
        item: out,
    };
};

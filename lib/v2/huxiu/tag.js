const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${utils.baseUrl}/tags/${id}.html`;
    const { data } = await got(link, {
        https: {
            rejectUnauthorized: false,
        },
    });

    const $ = cheerio.load(data);
    const list = $('.related-article li')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('a');
            return {
                title: a.text(),
                link: `${utils.baseUrl}${a.attr('href')}`,
                pubDate: timezone(parseDate(e.find('.time').text()), 8),
            };
        });

    const items = await utils.ProcessFeed(list, ctx.cache);

    const info = `虎嗅 - ${$('h1').text()}`;
    ctx.state.data = {
        title: info,
        link,
        description: info,
        item: items,
    };
};

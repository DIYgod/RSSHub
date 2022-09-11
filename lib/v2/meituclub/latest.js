const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const HOME_URL = 'https://www.meituclub.com/';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: HOME_URL,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#index-tab-main .posts-item.card');

    ctx.state.data = {
        title: '妹图社 - 最新',
        link: HOME_URL,
        item: list
            .map((index, item) => {
                item = $(item);
                const img = item.find('.item-thumbnail').find('img');
                return {
                    title: item.find('.item-heading').find('a').text(),
                    description: `<img src="${img.attr('data-src')}" alt="${img.attr('alt')}" />`,
                    link: item.find('.item-heading').find('a').attr('href'),
                    pubDate: timezone(parseDate(item.find('.item-meta').find('.icon-circle').attr('title'), 'YYYY-MM-DD'), +8),
                };
            })
            .get(),
    };
};

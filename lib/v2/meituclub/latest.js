const path = require('path');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const { art } = require('@/utils/render');
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
                const heading = item.find('.item-heading').find('a');
                return {
                    title: heading.text(),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        src: img.attr('data-src'),
                        alt: img.attr('alt'),
                    }),
                    link: heading.attr('href'),
                    pubDate: timezone(parseDate(item.find('.item-meta').find('.icon-circle').attr('title'), 'YYYY-MM-DD HH:mm:ss'), +8),
                };
            })
            .get(),
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://my.qidian.com';
    const currentUrl = `${rootUrl}/author/${id}/`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const authorName = $('.header-msg h1').contents().first().text().trim();
    const items = $('.author-work .author-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const messageItem = item.find('.author-item-msg');
            const updatedDate = messageItem.find('.author-item-update span').text().replace('·', '').trim();

            return {
                title: messageItem.find('.author-item-title').text().trim(),
                author: authorName,
                category: messageItem.find('.author-item-exp a').first().text().trim(),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    description: messageItem.find('.author-item-update a').attr('title'),
                    image: item.find('a img').attr('src'),
                }),
                pubDate: timezone(/(今|昨)/.test(updatedDate) ? parseRelativeDate(updatedDate) : parseDate(updatedDate, 'YYYY-MM-DD HH:mm'), +8),
                link: messageItem.find('.author-item-update a').attr('href'),
            };
        });

    ctx.state.data = {
        title: `${authorName} - 起点中文网`,
        description: $('.header-msg-desc').text().trim(),
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://www.peopo.org';

module.exports = async (ctx) => {
    const { topicId = '159' } = ctx.params;
    const url = `${baseUrl}/topic/${topicId}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('.view-list-title')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').text(),
                link: new URL(item.find('a').attr('href'), baseUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                item.author = $('#user-info h3').text();
                item.category = $('#node-terms .inline li')
                    .toArray()
                    .map((item) => $(item).find('a').text());
                item.pubDate = timezone(parseDate($('.submitted span').text()), +8);
                item.description = ($('.field-name-field-video-id .field-items').text() ? $('.field-name-field-video-id input').attr('value') : '') + $('.post_text_s .field-items').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        language: 'zh-TW',
        item: items,
    };
};

const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const { data } = await axios.get(`https://t.me/s/${username}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap');

    ctx.state.data = {
        title: $('.tgme_channel_info_header_title').text() + ' - Telegram 频道',
        description: $('.tgme_channel_info_description').text(),
        link: `https://t.me/${username}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    let preview = '';
                    if (item.find('.link_preview_image').length) {
                        preview = `<img referrerpolicy="no-referrer" src="${
                            item
                                .find('.link_preview_image')
                                .css('background-image')
                                .match(/url\('(.*)'\)/)[1]
                        }">`;
                    }

                    return {
                        title: item
                            .find('.tgme_widget_message_text')
                            .text()
                            .slice(0, 50),
                        description: item.find('.tgme_widget_message_text').html() + '<br><br>' + preview,
                        pubDate: new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString(),
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),
                    };
                })
                .get(),
    };
};

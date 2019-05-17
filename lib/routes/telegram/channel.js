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
        link: `https://t.me/s/${username}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    let img = '';
                    const generateImg = (selector) => {
                        if (item.find(selector).length) {
                            return `<img referrerpolicy="no-referrer" src="${
                                item
                                    .find(selector)
                                    .css('background-image')
                                    .match(/url\('(.*)'\)/)[1]
                            }">`;
                        }
                        return '';
                    };
                    img += generateImg('.tgme_widget_message_photo_wrap');
                    img += generateImg('.link_preview_image');

                    let video = '';
                    if (item.find('.tgme_widget_message_video').length) {
                        video += `<video src="${item.find('.tgme_widget_message_video').attr('src')}" controls="controls" poster="${
                            item
                                .find('.tgme_widget_message_video_thumb')
                                .css('background-image')
                                .match(/url\('(.*)'\)/)[1]
                        }" style="width: 100%"></video>`;
                    }

                    return {
                        title: item.find('.tgme_widget_message_text').length ? item.find('.tgme_widget_message_text').text() : '无题',
                        description: (item.find('.tgme_widget_message_text').length ? item.find('.tgme_widget_message_text').html() + '<br><br>' : '') + img + video,
                        pubDate: new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString(),
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),
                    };
                })
                .get(),
    };
};

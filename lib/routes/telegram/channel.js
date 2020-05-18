const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;

    const { data } = await got.get(`https://t.me/s/${username}`);
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

                    /* "Forwarded From" tag */

                    let fwdFrom;
                    const fwdFromNameObject = item.find('.tgme_widget_message_forwarded_from_name');
                    if (fwdFromNameObject.length) {
                        if (fwdFromNameObject.attr('href') !== undefined) {
                            fwdFrom = `Forwarded From <b><a href="${fwdFromNameObject.attr('href')}">
                                                        ${fwdFromNameObject.text()}</a></b><br><br>`;
                        } else {
                            fwdFrom = `Forwarded From <b>${fwdFromNameObject.text()}</b><br><br>`;
                        }
                    } else {
                        fwdFrom = '';
                    }

                    /* images */

                    const generateImg = (selector) => {
                        let tag_images = '';
                        if (item.find(selector).length) {
                            item.find(selector).each(function () {
                                tag_images += `<img src="${
                                    $(this)
                                        .css('background-image')
                                        .match(/url\('(.*)'\)/)[1]
                                }">`;
                            });
                            return tag_images;
                        } else {
                            return '';
                        }
                    };
                    const messageImgs = generateImg('.tgme_widget_message_photo_wrap');

                    /* videos */

                    let messageVideos = '';
                    if (item.find('.tgme_widget_message_video_player').length) {
                        item.find('.tgme_widget_message_video_player').each(function () {
                            messageVideos += `<video src="${$(this).find('.tgme_widget_message_video').attr('src')}"
                            controls="controls" 
                            poster="${
                                $(this)
                                    .find('.tgme_widget_message_video_thumb')
                                    .css('background-image')
                                    .match(/url\('(.*)'\)/)[1]
                            }"
                            style="width: 100%"></video>`;
                        });
                    }

                    /* link preview */

                    const linkPreviewSite = item.find('.link_preview_site_name').length ? `<b>${item.find('.link_preview_site_name').text()}</b><br>` : '';
                    let linkPreviewTitle;
                    if (item.find('.link_preview_title').length) {
                        linkPreviewTitle = `<b><a href="${item.find('.tgme_widget_message_link_preview').attr('href')}">
                        ${item.find('.link_preview_title').text()}</a></b><br>`;
                    } else {
                        linkPreviewTitle = '';
                    }
                    const linkPreviewDescription = item.find('.link_preview_description').length ? item.find('.link_preview_description').html() : '';
                    const linkPreviewImage = generateImg('.link_preview_image') + generateImg('.link_preview_right_image');

                    let linkPreview;
                    if (linkPreviewSite.length > 0 || linkPreviewTitle.length > 0 || linkPreviewDescription.length > 0 || linkPreviewImage.length > 0) {
                        linkPreview = `<blockquote>` + linkPreviewSite + linkPreviewTitle + linkPreviewDescription + linkPreviewImage + `</blockquote>`;
                    } else {
                        linkPreview = '';
                    }

                    /* message text */
                    const messageText = item.find('.tgme_widget_message_text').length ? item.find('.tgme_widget_message_text').html() + '<br><br>' : '';

                    return {
                        title: messageText !== '' ? item.find('.tgme_widget_message_text').text() : '无题',
                        description: fwdFrom + messageText + linkPreview + messageImgs + messageVideos,
                        pubDate: new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString(),
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),
                    };
                })
                .get()
                .reverse(),
    };
};

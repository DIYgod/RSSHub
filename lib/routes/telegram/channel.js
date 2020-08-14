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

                    /* media tag */

                    const mediaTag = () => {
                        let mediaTag = '';
                        if (item.find('.tgme_widget_message_photo').length > 0) {
                            mediaTag += '🖼';
                        }
                        if (item.find('.tgme_widget_message_video').length > 0) {
                            mediaTag += '📹';
                        }
                        if (item.find('.tgme_widget_message_poll').length > 0) {
                            mediaTag += '📊';
                        }
                        if (item.find('.tgme_widget_message_voice').length > 0) {
                            mediaTag += '🎤';
                        }
                        if (item.find('.tgme_widget_message_document').length > 0) {
                            mediaTag += '📎';
                        }
                        if (item.find('.tgme_widget_message_location').length > 0) {
                            mediaTag += '📍';
                        }
                        return mediaTag;
                    };

                    /* "Forwarded From" tag */
                    const fwdFrom = () => {
                        const fwdFromNameObject = item.find('.tgme_widget_message_forwarded_from_name');
                        if (fwdFromNameObject.length) {
                            if (fwdFromNameObject.attr('href') !== undefined) {
                                return `<p>Forwarded From <b><a href="${fwdFromNameObject.attr('href')}">
                                                        ${fwdFromNameObject.text()}</a></b></p>`;
                            } else {
                                return `<p>Forwarded From <b>${fwdFromNameObject.text()}</b></p>`;
                            }
                        } else {
                            return '';
                        }
                    };

                    /* reply */
                    const replyContent = () => {
                        if (item.find('.tgme_widget_message_reply').length !== 0) {
                            const replyObject = item.find('.tgme_widget_message_reply');

                            const replyAuthor = replyObject.find('.tgme_widget_message_author_name').length ? replyObject.find('.tgme_widget_message_author_name').text() : '';
                            const replyLink = replyObject.attr('href').length ? replyObject.attr('href') : '';
                            const replyMetatext = replyObject.find('.tgme_widget_message_metatext').length ? replyObject.find('tgme_widget_message_metatext').html() : '';
                            const replyText = replyObject.find('.tgme_widget_message_text').length ? replyObject.find('.tgme_widget_message_text').html() : '';

                            if (replyLink !== '') {
                                return `<blockquote>
                                    <p><a href='${replyLink}'><strong>${replyAuthor}</strong>:</a></p>
                                    <p><small>${replyMetatext}</small></p>
                                    <p>${replyText}</p>
                                </blockquote>`;
                            } else {
                                return `<blockquote>
                                    <p><strong>${replyAuthor}</strong>:</p>
                                    <p><small>${replyMetatext}</small></p>
                                    <p>${replyText}</p>
                                </blockquote>`;
                            }
                        } else {
                            return '';
                        }
                    };

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
                    const messageVideos = () => {
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
                        return messageVideos;
                    };

                    /* link preview */
                    const linkPreview = () => {
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

                        if (linkPreviewSite.length > 0 || linkPreviewTitle.length > 0 || linkPreviewDescription.length > 0 || linkPreviewImage.length > 0) {
                            return `<blockquote>${linkPreviewSite}${linkPreviewTitle}<p>${linkPreviewDescription}</p>${linkPreviewImage}</blockquote>`;
                        } else {
                            return '';
                        }
                    };

                    /* poll */
                    const pollQuestion = item.find('.tgme_widget_message_poll_question').length ? item.find('.tgme_widget_message_poll_question').text() : '';

                    /* message text & title */
                    const messageTextObject = item.find('.tgme_widget_message_bubble > .tgme_widget_message_text');
                    let messageText = '',
                        messageTitle = '';
                    if (messageTextObject.length > 0) {
                        messageTitle = messageTextObject.text();
                        messageText = `<p>${messageTextObject.html()}</p>`;
                    } else {
                        messageText = '';
                        if (pollQuestion !== '') {
                            messageTitle = pollQuestion;
                        } else {
                            messageTitle = '无题';
                        }
                    }

                    return {
                        title: mediaTag() + messageTitle,
                        description: fwdFrom() + replyContent() + messageText + linkPreview() + messageImgs + messageVideos(),
                        pubDate: new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString(),
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),
                    };
                })
                .get()
                .reverse(),
    };
};

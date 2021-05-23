const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const searchQuery = ctx.params.searchQuery;
    const resourceUrl = searchQuery ? `https://t.me/s/${username}?q=${encodeURIComponent(searchQuery)}` : `https://t.me/s/${username}`;

    const { data } = await got.get(resourceUrl);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap');

    if (list.length === 0 && $('.tgme_channel_history').length === 0) {
        throw `Unable to fetch message feed from this channel. Please check this URL to see if you can view the message preview: https://t.me/s/${username}`;
    }

    const feedTitle = searchQuery ? `「${searchQuery}」- ` + $('.tgme_channel_info_header_title').text() + ' - Telegram 频道' : $('.tgme_channel_info_header_title').text() + ' - Telegram 频道';

    ctx.state.data = {
        title: feedTitle,
        description: $('.tgme_channel_info_description').text(),
        link: resourceUrl,
        allowEmpty: true,

        itunes_author: $('.tgme_channel_info_header_title').text(),
        image: $('.tgme_page_photo_image > img').attr('src'),

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
                        if (item.find('.tgme_widget_message_sticker').length > 0) {
                            mediaTag += '[Sticker]';
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
                            const replyMetatext = replyObject.find('.tgme_widget_message_metatext').length ? `<p><small>${replyObject.find('.tgme_widget_message_metatext').html()}</small></p>` : '';
                            const replyText = replyObject.find('.tgme_widget_message_text').length ? `<p>${replyObject.find('.tgme_widget_message_text').html()}</p>` : '';

                            if (replyLink !== '') {
                                return `<blockquote>
                                    <p><a href='${replyLink}'><strong>${replyAuthor}</strong>:</a></p>
                                    ${replyMetatext}
                                    ${replyText}
                                </blockquote>`;
                            } else {
                                return `<blockquote>
                                    <p><strong>${replyAuthor}</strong>:</p>
                                    ${replyMetatext}
                                    ${replyText}
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

                    /* audio */
                    const messageAudioUrl = item.find('audio.tgme_widget_message_voice').length ? item.find('audio.tgme_widget_message_voice').attr('src') : '';
                    const messageAudioText = item.find('audio.tgme_widget_message_voice').length ? `<audio src="${item.find('audio.tgme_widget_message_voice').attr('src')}"></audio>` : '';
                    const messageAudioDuration = () => {
                        if (item.find('.tgme_widget_message_voice_duration').length) {
                            const durationInMmss = item.find('.tgme_widget_message_voice_duration').text();
                            const p = durationInMmss.split(':');

                            let second = 0,
                                minute = 1;
                            while (p.length > 0) {
                                second += minute * parseInt(p.pop(), 10);
                                minute *= 60;
                            }
                            return second.toString();
                        } else {
                            return '';
                        }
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
                        const linkPreviewDescription = item.find('.link_preview_description').length ? `<p>${item.find('.link_preview_description').html()}</p>` : '';
                        const linkPreviewImage = generateImg('.link_preview_image') + generateImg('.link_preview_right_image');

                        if (linkPreviewSite.length > 0 || linkPreviewTitle.length > 0 || linkPreviewDescription.length > 0 || linkPreviewImage.length > 0) {
                            return `<blockquote>${linkPreviewSite}${linkPreviewTitle}${linkPreviewDescription}${linkPreviewImage}</blockquote>`;
                        } else {
                            return '';
                        }
                    };

                    /* poll */
                    const pollQuestion = item.find('.tgme_widget_message_poll_question').length ? item.find('.tgme_widget_message_poll_question').text() : '';

                    /* attachment */
                    const attachmentTitle = item.find('.tgme_widget_message_document_title').length ? item.find('.tgme_widget_message_document_title').text() + ' / ' + item.find('.tgme_widget_message_document_extra').text() : '';

                    /* pubDate */
                    const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();

                    /* message text & title */
                    const messageTextObject = item.find('.tgme_widget_message_bubble > .tgme_widget_message_text');
                    let messageText = '',
                        messageTitle = '';

                    if (messageTextObject.length > 0) {
                        messageText = `<p>${messageTextObject.html()}</p>`;
                    }

                    if (pollQuestion !== '') {
                        messageTitle = pollQuestion;
                    } else if (attachmentTitle !== '') {
                        messageTitle = attachmentTitle;
                    } else if (messageTextObject.length > 0) {
                        messageTitle = messageTextObject.text();
                    } else {
                        messageTitle = pubDate;
                    }

                    return {
                        title: mediaTag() + messageTitle,
                        description: fwdFrom() + replyContent() + messageAudioText + messageText + linkPreview() + messageImgs + messageVideos(),
                        pubDate: pubDate,
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),

                        enclosure_url: messageAudioUrl,
                        enclosure_length: messageAudioDuration(),
                        enclosure_type: 'audio/ogg',
                    };
                })
                .get()
                .reverse(),
    };
};

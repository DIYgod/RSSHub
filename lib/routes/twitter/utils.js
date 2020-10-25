const URL = require('url');
const config = require('@/config').value;
const Twit = require('twit');
const { fallback, queryToBoolean, queryToInteger } = require('@/utils/readable-social');

const ProcessFeed = (ctx, { data = [] }, params = {}) => {
    const newParams = {
        readable: fallback(params.readable, queryToBoolean(ctx.query.readable), false),
        authorNameBold: fallback(params.authorNameBold, queryToBoolean(ctx.query.authorNameBold), false),
        showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(ctx.query.showAuthorInTitle), false),
        showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(ctx.query.showAuthorInDesc), false),
        showQuotedAuthorAvatarInDesc: fallback(params.showQuotedAuthorAvatarInDesc, queryToBoolean(ctx.query.showQuotedAuthorAvatarInDesc), false),
        showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(ctx.query.showAuthorAvatarInDesc), false),
        showEmojiForRetweetAndReply: fallback(params.showEmojiForRetweetAndReply, queryToBoolean(ctx.query.showEmojiForRetweetAndReply), false),
        showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(ctx.query.showRetweetTextInTitle), true),
        addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(ctx.query.addLinkForPics), false),
        showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(ctx.query.showTimestampInDescription), false),
        showQuotedInTitle: fallback(params.showQuotedInTitle, queryToBoolean(ctx.query.showQuotedInTitle), false),

        heightOfPics: fallback(params.heightOfPics, queryToInteger(ctx.query.heightOfPics), -1),
        heightOfAuthorAvatar: fallback(params.heightOfAuthorAvatar, queryToInteger(ctx.query.heightOfAuthorAvatar), 48),
        heightOfQuotedAuthorAvatar: fallback(params.heightOfQuotedAuthorAvatar, queryToInteger(ctx.query.heightOfQuotedAuthorAvatar), 24),
    };

    params = newParams;

    const {
        readable,
        authorNameBold,
        showAuthorInTitle,
        showAuthorInDesc,
        showQuotedAuthorAvatarInDesc,
        showAuthorAvatarInDesc,
        showEmojiForRetweetAndReply,
        showRetweetTextInTitle,
        addLinkForPics,
        showTimestampInDescription,
        showQuotedInTitle,

        heightOfPics,
        heightOfAuthorAvatar,
        heightOfQuotedAuthorAvatar,
    } = params;

    const getQueryParams = (url) => URL.parse(url, true).query;
    const getOriginalImg = (url) => {
        // https://greasyfork.org/zh-CN/scripts/2312-resize-image-on-open-image-in-new-tab/code#n150
        let m = null;
        if ((m = url.match(/^(https?:\/\/\w+\.twimg\.com\/media\/[^/:]+)\.(jpg|jpeg|gif|png|bmp|webp)(:\w+)?$/i))) {
            let format = m[2];
            if (m[2] === 'jpeg') {
                format = 'jpg';
            }
            return `${m[1]}?format=${format}&name=orig`;
        } else if ((m = url.match(/^(https?:\/\/\w+\.twimg\.com\/.+)(\?.+)$/i))) {
            const pars = getQueryParams(url);
            if (!pars.format || !pars.name) {
                return url;
            }
            if (pars.name === 'orig') {
                return url;
            }
            return m[1] + '?format=' + pars.format + '&name=orig';
        } else {
            return url;
        }
    };

    const replaceBreak = (text) => text.replace(/<br><br>|<br>/g, ' ');
    const formatText = (text) =>
        text
            .replace(/https:\/\/t\.co(.*)/g, '')
            .trim()
            .replace(/\n/g, '<br>');
    const formatTextToPlain = (text) => text.replace(/https:\/\/t\.co(.*)/g, '').trim();
    const formatVideo = (media, extraAttrs = '') => {
        let content = '';
        const video = media.video_info.variants.reduce((video, item) => {
            if ((item.bitrate || 0) > (video.bitrate || -Infinity)) {
                video = item;
            }
            return video;
        }, {});

        if (video.url) {
            const gifAutoPlayAttr = media.type === 'animated_gif' ? `autoplay loop muted webkit-playsinline playsinline` : '';
            if (!readable) {
                content += '<br>';
            }
            content += `<video src="${video.url}" ${gifAutoPlayAttr} controls="controls" poster="${getOriginalImg(media.media_url_https)}" ${extraAttrs}></video>`;
        }

        return content;
    };

    const formatMedia = (item) => {
        let img = '';
        item.extended_entities &&
            item.extended_entities.media.forEach((item) => {
                // https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
                let content = '';
                let originalImg;
                switch (item.type) {
                    case 'animated_gif':
                    case 'video':
                        content = formatVideo(item);
                        break;

                    case 'photo':
                    default:
                        originalImg = getOriginalImg(item.media_url_https);
                        if (!readable) {
                            content += `<br>`;
                        }
                        if (addLinkForPics) {
                            content += `<a href="${originalImg}" target="_blank" rel="noopener noreferrer">`;
                        }
                        content += `<img `;
                        if (heightOfPics > 0) {
                            content += `height="${heightOfPics}" `;
                        }
                        content += `${readable ? 'hspace="4" vspace="8"' : ''} src="${originalImg}">`;
                        if (addLinkForPics) {
                            content += `</a>`;
                        }
                        break;
                }

                img += content;
            });

        if (readable && img) {
            img = `<br clear="both" /><div style="clear: both"></div>` + img;
        }
        return img;
    };
    const generatePicsPrefix = (item) => {
        // When author avatar is shown, generate invisible <img> for inner images at the beginning of HTML
        // to please some RSS readers
        let picsPrefix = '';
        item.extended_entities &&
            item.extended_entities.media.forEach((item) => {
                let content;
                let originalImg;
                switch (item.type) {
                    case 'video':
                        content = formatVideo(item, `width="0" height="0"`);
                        break;

                    case 'photo':
                    default:
                        originalImg = getOriginalImg(item.media_url_https);
                        content = `<img width="0" height="0" hidden="true" src="${originalImg}">`;
                        break;
                }

                picsPrefix += content;
            });
        return picsPrefix;
    };
    const formatUrl = (item) => {
        let url = '';
        item.entities.urls.forEach((u) => {
            if (readable) {
                url += '<br>';
            }
            url += `<a href="${u.expanded_url}" target="_blank" rel="noopener noreferrer">${u.expanded_url}</a>`;
        });

        return url;
    };

    return data.map((item) => {
        const originalItem = item;
        item = item.retweeted_status || item;
        item.full_text = formatText(item.full_text);
        const img = formatMedia(item);
        let picsPrefix = generatePicsPrefix(item);
        let url = '';
        let quote = '';
        let quoteInTitle = '';

        if (item.is_quote_status) {
            const quoteData = item.quoted_status;

            if (quoteData) {
                const author = quoteData.user;
                if (readable) {
                    quote += `<br clear="both" /><div style="clear: both"></div>`;
                    quote += `<blockquote>`;
                } else {
                    quote += `<br><br>`;
                }

                if (readable) {
                    quote += `<a href="https://twitter.com/${author.screen_name}" target="_blank" rel="noopener noreferrer">`;
                }

                if (showQuotedAuthorAvatarInDesc) {
                    quote += `<img height="${heightOfQuotedAuthorAvatar}" src="${author.profile_image_url_https}" ${readable ? 'hspace="8" vspace="8" align="left"' : ''}>`;
                }

                if (authorNameBold) {
                    quote += `<strong>`;
                }

                quote += author.name;

                if (authorNameBold) {
                    quote += `</strong>`;
                }

                if (readable) {
                    quote += `</a>`;
                }

                quote += `:&nbsp;&nbsp;`;
                quote += formatText(quoteData.full_text);

                if (!readable) {
                    quote += '<br>';
                }
                quote += formatMedia(quoteData);
                picsPrefix += generatePicsPrefix(quoteData);
                quote += formatUrl(quoteData);
                quoteInTitle += showEmojiForRetweetAndReply ? '💬 ' : 'Rt ';
                quoteInTitle += `${author.name}: ${formatTextToPlain(quoteData.full_text)}`;

                if (readable) {
                    quote += `<br><small>Link: <a href="https://twitter.com/${author.screen_name}/status/${quoteData.id_str}" target="_blank" rel="noopener noreferrer">https://twitter.com/${author.screen_name}/status/${quoteData.id_str}</a></small>`;
                }
                if (showTimestampInDescription) {
                    quote += '<br><small>' + new Date(quoteData.created_at).toLocaleString();
                    quote += `</small>`;
                    if (readable) {
                        quote += `<br clear="both" /><div style="clear: both"></div>`;
                    }
                }

                if (readable) {
                    quote += `</blockquote>`;
                }
            } else {
                url = formatUrl(item);
            }
        } else {
            url = formatUrl(item);
        }

        let title = '';
        if (showAuthorInTitle) {
            title += originalItem.user.name + ': ';
        }
        if (item.in_reply_to_screen_name) {
            title += showEmojiForRetweetAndReply ? '↩️ ' : 'Re ';
        }
        if ((originalItem === item && !item.is_quote_status) || showRetweetTextInTitle) {
            title += replaceBreak(originalItem.full_text);
        }
        if (originalItem !== item) {
            title += showEmojiForRetweetAndReply ? ' 🔁 ' : ' Rt: ';
            title += item.user.name + ': ';
        }
        if (originalItem !== item) {
            title += replaceBreak(item.full_text);
        }

        if (showQuotedInTitle) {
            title += quoteInTitle;
        }

        const author = originalItem.user.name;

        let description = '';
        if (showAuthorInDesc && showAuthorAvatarInDesc) {
            description += picsPrefix;
        }
        if (showAuthorInDesc) {
            if (readable) {
                description += `<a href="https://twitter.com/${item.user.screen_name}" target="_blank" rel="noopener noreferrer">`;
            }

            if (showAuthorAvatarInDesc) {
                description += `<img height="${heightOfAuthorAvatar}" src="${item.user.profile_image_url_https}" ${readable ? 'hspace="8" vspace="8" align="left"' : ''}>`;
            }
            if (authorNameBold) {
                description += `<strong>`;
            }
            description += item.user.name;
            if (authorNameBold) {
                description += `</strong>`;
            }
            if (readable) {
                description += `</a>`;
            }
            description += `:&nbsp;&nbsp;`;
        }
        if (item.in_reply_to_screen_name) {
            description += showEmojiForRetweetAndReply ? '↩️ ' : 'Re ';
        }

        description += item.full_text;
        description += url;
        description += img;
        description += quote;

        if (readable) {
            description += `<br clear="both" /><div style="clear: both"></div><hr>`;
        }

        if (showTimestampInDescription) {
            description += `<small>${new Date(item.created_at).toLocaleString()}</small>`;
        }

        return {
            title: title,
            author: author,
            description: description,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`,
        };
    });
};

let getTwit = () => null;
if (config.twitter.consumer_key && config.twitter.consumer_secret) {
    const consumer_keys = config.twitter.consumer_key.split(',');
    const consumer_secrets = config.twitter.consumer_secret.split(',');
    const T = {};
    let count = 0;
    let index = -1;

    consumer_keys.forEach((consumer_key, index) => {
        const consumer_secret = consumer_secrets[index];
        if (consumer_key && consumer_secret) {
            T[index] = new Twit({
                consumer_key,
                consumer_secret,
                app_only_auth: true,
            });
            count = index + 1;
        }
    });

    getTwit = () => {
        index++;
        return T[index % count];
    };
}

module.exports = {
    ProcessFeed,
    getTwit,
};

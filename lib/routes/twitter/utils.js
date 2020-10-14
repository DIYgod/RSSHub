const URL = require('url');
const config = require('@/config').value;
const Twit = require('twit');

const ProcessFeed = ({ data = [] }, showAuthor = false, showAuthorInTitle = false) => {
    const getQueryParams = (url) => URL.parse(url, true).query;
    const getOrigionImg = (url) => {
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
    const formatVideo = (media) => {
        let content = '';
        const video = media.video_info.variants.reduce((video, item) => {
            if ((item.bitrate || 0) > (video.bitrate || -Infinity)) {
                video = item;
            }
            return video;
        }, {});

        if (video.url) {
            const gifAutoPlayAttr = media.type === 'animated_gif' ? `autoplay loop muted webkit-playsinline playsinline` : '';
            content = `<video src="${video.url}" ${gifAutoPlayAttr} controls="controls" poster="${getOrigionImg(media.media_url_https)}" style="width: 100%"></video>`;
        }

        return content;
    };

    const formatMedia = (item) => {
        let img = '';
        item.extended_entities &&
            item.extended_entities.media.forEach((item) => {
                // https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
                let content = '';
                let originImg;
                switch (item.type) {
                    case 'animated_gif':
                    case 'video':
                        content = formatVideo(item);
                        break;

                    case 'photo':
                    default:
                        originImg = getOrigionImg(item.media_url_https);
                        content = `<a href="${originImg}"><img hspace="4" vspace="8" src="${originImg}"></a>`;
                        break;
                }

                img += content;
            });

        if (img) {
            img = `<br clear="both" /><div style="clear: both"></div>` + img;
        }
        return img;
    };
    const formatUrl = (item) => {
        let url = '';
        item.entities.urls.forEach((u) => {
            url += `<br><a href="${u.expanded_url}" target="_blank" rel="noopener noreferrer">${u.expanded_url}</a>`;
        });

        return url;
    };

    return data.map((item) => {
        const originalItem = item;
        item = item.retweeted_status || item;
        item.full_text = formatText(item.full_text);
        const img = formatMedia(item);
        let url = '';
        let quote = '';
        let quoteOnTitle = '';

        if (item.is_quote_status) {
            const quoteData = item.quoted_status;

            if (quoteData) {
                const author = quoteData.user;
                quote += `<br clear="both" /><div style="clear: both"></div><blockquote><a href="https://twitter.com/${author.screen_name}"><img align="left" src="${author.profile_image_url_https}" hspace="8" vspace="8"><strong>${author.name}</strong></a>:&nbsp;&nbsp;`;
                quote += `${formatText(quoteData.full_text)}`;
                quote += formatMedia(quoteData);
                quote += formatUrl(quoteData);
                quoteOnTitle += `| ${author.name}: ${formatTextToPlain(quoteData.full_text)}`;

                quote += `<br><small>Source: <a href="https://twitter.com/${author.screen_name}/status/${quoteData.id_str}" target="_blank" rel="noopener noreferrer">https://twitter.com/${author.screen_name}/status/${quoteData.id_str}</a></small>`;
                quote += '<br><small>' + new Date(quoteData.created_at).toLocaleString();
                quote += `</small><br clear="both" /><div style="clear: both"></div></blockquote>`;
            } else {
                url = formatUrl(item);
            }
        } else {
            url = formatUrl(item);
        }

        return {
            title:
                originalItem.user.name +
                `: ${originalItem === item ? '' : '🔁 '}${showAuthorInTitle || originalItem !== item ? item.user.name + ': ' : ''}${item.in_reply_to_screen_name ? '↩️ ' : ''}${replaceBreak(item.full_text)}${quoteOnTitle}`,
            author: originalItem.user.name,
            description: `${
                showAuthor ? `<a href="https://twitter.com/${item.user.screen_name}"><img align="left" src="${item.user.profile_image_url_https}" hspace="8" vspace="8"><strong>${item.user.name}</strong></a>:&nbsp;&nbsp;` : ''
            }${item.in_reply_to_screen_name ? '🔁 ' : ''}${item.full_text}${url}${img}${quote}<hr><small>${new Date(item.created_at).toLocaleString()}</small>`,
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

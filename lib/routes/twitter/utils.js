const URL = require('url');

const ProcessFeed = ({ data = [] }) => {
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

    const formatText = (text) => text.replace(/https:\/\/t\.co(.*)/g, '').replace(/\n/g, '<br>');
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
            content = `<br><video src="${video.url}" ${gifAutoPlayAttr} controls="controls" poster="${getOrigionImg(media.media_url_https)}" style="width: 100%"></video>`;
        }

        return content;
    };

    const formatMedia = (item) => {
        let img = '';
        item.extended_entities &&
            item.extended_entities.media.forEach((item) => {
                // https://developer.twitter.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
                let content = '';
                switch (item.type) {
                    case 'animated_gif':
                    case 'video':
                        content = formatVideo(item);
                        break;

                    case 'photo':
                    default:
                        content = `<br><img referrerpolicy="no-referrer" src="${getOrigionImg(item.media_url_https)}">`;
                        break;
                }

                img += content;
            });

        return img;
    };
    const formatUrl = (item) => {
        let url = '';
        item.entities.urls.forEach((u) => {
            url += `<a href="${u.expanded_url}" target="_blank">${u.expanded_url}</a>`;
        });

        return url;
    };

    return data.map((item) => {
        item = item.retweeted_status || item;
        item.full_text = formatText(item.full_text);
        const img = formatMedia(item);
        let url = '';
        let quote = '';

        if (item.is_quote_status) {
            const quoteData = item.quoted_status;

            if (quoteData) {
                const author = quoteData.user;
                quote += `<br><br>${author.name}: ${formatText(quoteData.full_text)}<br>`;
                quote += formatMedia(quoteData);
                quote += formatUrl(quoteData);
            } else {
                url = formatUrl(item);
            }
        } else {
            url = formatUrl(item);
        }

        return {
            title: `${item.in_reply_to_screen_name ? 'Re ' : ''}${formatText(item.full_text)}`,
            description: `${item.in_reply_to_screen_name ? 'Re ' : ''}${formatText(item.full_text)}${url}${img}${quote}`,
            pubDate: new Date(item.created_at).toUTCString(),
            link: `https://twitter.com/${item.user.screen_name}/status/${item.id_str}`,
        };
    });
};

module.exports = {
    ProcessFeed,
};

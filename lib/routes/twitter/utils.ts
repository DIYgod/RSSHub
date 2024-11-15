import URL from 'url';
import { config } from '@/config';
import { TwitterApi } from 'twitter-api-v2';
import { fallback, queryToBoolean, queryToInteger } from '@/utils/readable-social';
import { parseDate } from '@/utils/parse-date';

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
const replaceBreak = (text) => text.replaceAll(/<br><br>|<br>/g, ' ');

const formatText = (item) => {
    let text = item.full_text;
    const id_str = item.id_str || item.conversation_id_str;
    const urls = item.entities.urls || [];
    for (const url of urls) {
        // trim link pointing to the tweet itself (usually appears when the tweet is truncated)
        text = text.replaceAll(url.url, url.expanded_url?.endsWith(id_str) ? '' : url.expanded_url);
    }
    const media = item.extended_entities?.media || [];
    for (const m of media) {
        text = text.replaceAll(m.url, '');
    }
    return text.trim().replaceAll('\n', '<br>');
};

const ProcessFeed = (ctx, { data = [] }, params = {}) => {
    // undefined and strings like "exclude_rts_replies" is also safely parsed, so no if branch is needed
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));

    const mergedParams = {
        readable: fallback(params.readable, queryToBoolean(routeParams.get('readable')), false),
        authorNameBold: fallback(params.authorNameBold, queryToBoolean(routeParams.get('authorNameBold')), false),
        showAuthorInTitle: fallback(params.showAuthorInTitle, queryToBoolean(routeParams.get('showAuthorInTitle')), false),
        showAuthorInDesc: fallback(params.showAuthorInDesc, queryToBoolean(routeParams.get('showAuthorInDesc')), false),
        showQuotedAuthorAvatarInDesc: fallback(params.showQuotedAuthorAvatarInDesc, queryToBoolean(routeParams.get('showQuotedAuthorAvatarInDesc')), false),
        showAuthorAvatarInDesc: fallback(params.showAuthorAvatarInDesc, queryToBoolean(routeParams.get('showAuthorAvatarInDesc')), false),
        showEmojiForRetweetAndReply: fallback(params.showEmojiForRetweetAndReply, queryToBoolean(routeParams.get('showEmojiForRetweetAndReply')), false),
        showSymbolForRetweetAndReply: fallback(params.showSymbolForRetweetAndReply, queryToBoolean(routeParams.get('showSymbolForRetweetAndReply')), true),
        showRetweetTextInTitle: fallback(params.showRetweetTextInTitle, queryToBoolean(routeParams.get('showRetweetTextInTitle')), true),
        addLinkForPics: fallback(params.addLinkForPics, queryToBoolean(routeParams.get('addLinkForPics')), false),
        showTimestampInDescription: fallback(params.showTimestampInDescription, queryToBoolean(routeParams.get('showTimestampInDescription')), false),
        showQuotedInTitle: fallback(params.showQuotedInTitle, queryToBoolean(routeParams.get('showQuotedInTitle')), false),

        widthOfPics: fallback(params.widthOfPics, queryToInteger(routeParams.get('widthOfPics')), -1),
        heightOfPics: fallback(params.heightOfPics, queryToInteger(routeParams.get('heightOfPics')), -1),
        sizeOfAuthorAvatar: fallback(params.sizeOfAuthorAvatar, queryToInteger(routeParams.get('sizeOfAuthorAvatar')), 48),
        sizeOfQuotedAuthorAvatar: fallback(params.sizeOfQuotedAuthorAvatar, queryToInteger(routeParams.get('sizeOfQuotedAuthorAvatar')), 24),
    };

    params = mergedParams;

    const {
        readable,
        authorNameBold,
        showAuthorInTitle,
        showAuthorInDesc,
        showQuotedAuthorAvatarInDesc,
        showAuthorAvatarInDesc,
        showEmojiForRetweetAndReply,
        showSymbolForRetweetAndReply,
        showRetweetTextInTitle,
        addLinkForPics,
        showTimestampInDescription,
        showQuotedInTitle,

        widthOfPics,
        heightOfPics,
        sizeOfAuthorAvatar,
        sizeOfQuotedAuthorAvatar,
    } = params;

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
            content += `<video width="${media.sizes.large.w}" height="${media.sizes.large.h}" src='${video.url}' ${gifAutoPlayAttr} controls='controls' poster='${getOriginalImg(media.media_url_https)}' ${extraAttrs}></video>`;
        }

        return content;
    };

    const formatMedia = (item) => {
        let img = '';
        if (item.extended_entities) {
            for (const media of item.extended_entities.media) {
                // https://developer.x.com/en/docs/tweets/data-dictionary/overview/extended-entities-object
                let content = '';
                let style = '';
                let originalImg;
                switch (media.type) {
                    case 'animated_gif':
                    case 'video':
                        content = formatVideo(media);
                        break;

                    case 'photo':
                    default:
                        originalImg = getOriginalImg(media.media_url_https);
                        if (!readable) {
                            content += `<br>`;
                        }
                        if (addLinkForPics) {
                            content += `<a href='${originalImg}' target='_blank' rel='noopener noreferrer'>`;
                        }
                        content += `<img `;
                        if (widthOfPics >= 0) {
                            content += ` width="${widthOfPics}"`;
                            style += `width: ${widthOfPics}px;`;
                        }
                        if (heightOfPics > 0) {
                            content += `height="${heightOfPics}" `;
                            style += `height: ${heightOfPics}px;`;
                        }
                        if (widthOfPics <= 0 && heightOfPics <= 0) {
                            content += `width="${media.sizes.large.w}" height="${media.sizes.large.h}" `;
                        }
                        content += ` style="${style}" ` + `${readable ? 'hspace="4" vspace="8"' : ''} src="${originalImg}">`;
                        if (addLinkForPics) {
                            content += `</a>`;
                        }
                        break;
                }

                img += content;
            }
        }

        if (readable && img) {
            img = `<br clear='both' /><div style='clear: both'></div>` + img;
        }
        return img;
    };

    const generatePicsPrefix = (item) => {
        // When author avatar is shown, generate invisible <img> for inner images at the beginning of HTML
        // to please some RSS readers
        let picsPrefix = '';
        if (item.extended_entities) {
            for (const media of item.extended_entities.media) {
                let content;
                let originalImg;
                switch (media.type) {
                    case 'video':
                        content = formatVideo(media, `width="0" height="0"`);
                        break;

                    case 'photo':
                    default:
                        originalImg = getOriginalImg(media.media_url_https);
                        content = `<img width='0' height='0' hidden='true' src='${originalImg}'>`;
                        break;
                }

                picsPrefix += content;
            }
        }
        return picsPrefix;
    };

    return data.map((item) => {
        const originalItem = item;
        item = item.retweeted_status || item;
        item.full_text = item.full_text || item.text;
        item.full_text = formatText(item);
        const img = formatMedia(item);
        let picsPrefix = generatePicsPrefix(item);
        let quote = '';
        let quoteInTitle = '';

        // Make quote in description
        if (item.is_quote_status) {
            const quoteData = item.quoted_status;

            if (quoteData) {
                quoteData.full_text = quoteData.full_text || quoteData.text;
                const author = quoteData.user;
                quote += '<div class="rsshub-quote">';
                if (readable) {
                    quote += `<br clear='both' /><div style='clear: both'></div>`;
                    quote += `<blockquote style='background: #80808010;border-top:1px solid #80808030;border-bottom:1px solid #80808030;margin:0;padding:5px 20px;'>`;
                } else {
                    quote += `<br><br>`;
                }

                if (readable) {
                    quote += `<a href='https://x.com/${author.screen_name}' target='_blank' rel='noopener noreferrer'>`;
                }

                if (showQuotedAuthorAvatarInDesc) {
                    quote += `<img width='${sizeOfQuotedAuthorAvatar}' height='${sizeOfQuotedAuthorAvatar}' src='${author.profile_image_url_https}' ${readable ? 'hspace="8" vspace="8" align="left"' : ''}>`;
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

                quote += `:&ensp;`;
                quote += formatText(quoteData);

                if (!readable) {
                    quote += '<br>';
                }
                quote += formatMedia(quoteData);
                picsPrefix += generatePicsPrefix(quoteData);
                quoteInTitle += showEmojiForRetweetAndReply ? ' 💬 ' : showSymbolForRetweetAndReply ? ' RT ' : '';
                quoteInTitle += `${author.name}: ${formatText(quoteData)}`;

                if (readable) {
                    quote += `<br><small>Link: <a href='https://x.com/${author.screen_name}/status/${quoteData.id_str || quoteData.conversation_id_str}' target='_blank' rel='noopener noreferrer'>https://x.com/${
                        author.screen_name
                    }/status/${quoteData.id_str || quoteData.conversation_id_str}</a></small>`;
                }
                if (showTimestampInDescription) {
                    quote += '<br><small>' + parseDate(quoteData.created_at);
                    quote += `</small>`;
                    if (readable) {
                        quote += `<br clear='both' /><div style='clear: both'></div>`;
                    }
                }

                if (readable) {
                    quote += `</blockquote>`;
                }
                quote += '</div>';
            }
        }

        // Make title
        let title = '';
        if (showAuthorInTitle) {
            title += originalItem.user.name + ': ';
        }
        const isRetweet = originalItem !== item;
        const isQuote = item.is_quote_status;
        if (!isRetweet && (!isQuote || showRetweetTextInTitle)) {
            if (item.in_reply_to_screen_name) {
                title += showEmojiForRetweetAndReply ? '↩️ ' : showSymbolForRetweetAndReply ? 'Re ' : '';
            }
            title += replaceBreak(originalItem.full_text);
        }
        if (isRetweet) {
            title += showEmojiForRetweetAndReply ? '🔁 ' : showSymbolForRetweetAndReply ? 'RT ' : '';
            title += item.user.name + ': ';
            if (item.in_reply_to_screen_name) {
                title += showEmojiForRetweetAndReply ? ' ↩️ ' : showSymbolForRetweetAndReply ? ' Re ' : '';
            }
            title += replaceBreak(item.full_text);
        }

        if (showQuotedInTitle) {
            title += quoteInTitle;
        }

        // Make description
        let description = '';
        if (showAuthorInDesc && showAuthorAvatarInDesc) {
            description += picsPrefix;
        }
        if (isRetweet) {
            if (showAuthorInDesc) {
                if (readable) {
                    description += '<small>';
                    description += `<a href='https://x.com/${originalItem.user.screen_name}' target='_blank' rel='noopener noreferrer'>`;
                }
                if (authorNameBold) {
                    description += `<strong>`;
                }
                description += originalItem.user.name;
                if (authorNameBold) {
                    description += `</strong>`;
                }
                if (readable) {
                    description += '</a>';
                }
                description += '&ensp;';
            }
            description += showEmojiForRetweetAndReply ? '🔁' : showSymbolForRetweetAndReply ? 'RT' : '';
            if (!showAuthorInDesc) {
                description += '&ensp;';
                if (readable) {
                    description += `<a href='https://x.com/${item.user.screen_name}' target='_blank' rel='noopener noreferrer'>`;
                }
                if (authorNameBold) {
                    description += `<strong>`;
                }
                description += item.user.name;
                if (authorNameBold) {
                    description += `</strong>`;
                }
                if (readable) {
                    description += '</a>';
                }
            }
            if (readable) {
                description += '</small>';
            }
            description += '<br>';
        }
        if (showAuthorInDesc) {
            if (readable) {
                description += `<a href='https://x.com/${item.user.screen_name}' target='_blank' rel='noopener noreferrer'>`;
            }

            if (showAuthorAvatarInDesc) {
                description += `<img width='${sizeOfAuthorAvatar}' height='${sizeOfAuthorAvatar}' src='${item.user.profile_image_url_https}' ${readable ? 'hspace="8" vspace="8" align="left"' : ''}>`;
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
            description += `:&ensp;`;
        }
        if (item.in_reply_to_screen_name) {
            description += showEmojiForRetweetAndReply ? '↩️ ' : showSymbolForRetweetAndReply ? 'Re ' : '';
        }

        description += item.full_text;
        // 从 description 提取 话题作为 category，放在此处是为了避免 匹配到 quote 中的 # 80808030 颜色字符
        const category = description.match(/(\s)?(#[^\s;<]+)/g)?.map((e) => e?.match(/#([^\s<]+)/)?.[1]);
        description += img;
        description += quote;
        if (readable) {
            description += `<br clear='both' /><div style='clear: both'></div>`;
        }

        if (showTimestampInDescription) {
            if (readable) {
                description += `<hr>`;
            }
            description += `<small>${parseDate(item.created_at)}</small>`;
        }

        const link =
            originalItem.user.screen_name && (originalItem.id_str || originalItem.conversation_id_str)
                ? `https://x.com/${originalItem.user.screen_name}/status/${originalItem.id_str || originalItem.conversation_id_str}`
                : `https://x.com/${item.user.screen_name}/status/${item.id_str || item.conversation_id_str}`;
        return {
            title,
            author: [
                {
                    name: originalItem.user.name,
                    url: `https://x.com/${originalItem.user.screen_name}`,
                    avatar: originalItem.user.profile_image_url_https,
                },
            ],
            description,
            pubDate: parseDate(item.created_at),
            link,
            guid: link.replace('x.com', 'twitter.com'),
            category,
            _extra:
                (isRetweet && {
                    links: [
                        {
                            type: 'repost',
                        },
                    ],
                }) ||
                (item.is_quote_status && {
                    links: [
                        {
                            url: `https://x.com/${item.quoted_status?.user?.screen_name}/status/${item.quoted_status?.id_str || item.quoted_status?.conversation_id_str}`,
                            type: 'quote',
                        },
                    ],
                }) ||
                (item.in_reply_to_screen_name &&
                    item.in_reply_to_status_id_str && {
                        links: [
                            {
                                url: `https://x.com/${item.in_reply_to_screen_name}/status/${item.in_reply_to_status_id_str}`,
                                type: 'reply',
                            },
                        ],
                    }),
        };
    });
};

let getAppClient = () => null;

if (config.twitter.consumer_key && config.twitter.consumer_secret) {
    const consumer_keys = config.twitter.consumer_key.split(',');
    const consumer_secrets = config.twitter.consumer_secret.split(',');
    const T = {};
    let count = 0;
    let index = -1;

    for (const [i, consumer_key] of consumer_keys.entries()) {
        const consumer_secret = consumer_secrets[i];
        if (consumer_key && consumer_secret) {
            T[i] = new TwitterApi({
                appKey: consumer_key,
                appSecret: consumer_secret,
            }).readOnly;
            count = i + 1;
        }
    }

    getAppClient = () => {
        index++;
        return T[index % count].appLogin();
    };
}

const parseRouteParams = (routeParams) => {
    let count, exclude_replies, include_rts, only_media;
    let force_web_api = false;
    switch (routeParams) {
        case 'exclude_rts_replies':
        case 'exclude_replies_rts':
            exclude_replies = true;
            include_rts = false;

            break;

        case 'exclude_replies':
            exclude_replies = true;
            include_rts = true;

            break;

        case 'exclude_rts':
            exclude_replies = false;
            include_rts = false;

            break;

        default: {
            const parsed = new URLSearchParams(routeParams);
            count = fallback(undefined, queryToInteger(parsed.get('count')));
            exclude_replies = fallback(undefined, queryToBoolean(parsed.get('excludeReplies')), false);
            include_rts = fallback(undefined, queryToBoolean(parsed.get('includeRts')), true);
            force_web_api = fallback(undefined, queryToBoolean(parsed.get('forceWebApi')), false);
            only_media = fallback(undefined, queryToBoolean(parsed.get('onlyMedia')), false);
        }
    }
    return { count, exclude_replies, include_rts, force_web_api, only_media };
};

export const excludeRetweet = function (tweets) {
    const excluded = [];
    for (const t of tweets) {
        if (t.retweeted_status) {
            continue;
        }
        excluded.push(t);
    }
    return excluded;
};

export const keepOnlyMedia = function (tweets) {
    const excluded = tweets.filter((t) => t.extended_entities && t.extended_entities.media);
    return excluded;
};

export default { ProcessFeed, getAppClient, parseRouteParams, excludeRetweet, keepOnlyMedia };

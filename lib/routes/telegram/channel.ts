import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
import cache from '@/utils/cache';
import { config } from '@/config';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';
import querystring from 'querystring';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import tglibchannel from './tglib/channel';

const __dirname = getCurrentPath(import.meta.url);

/* message types */
const REPLY = 'REPLY';
const FORWARDED = 'FORWARDED';
const SERVICE = 'SERVICE';
const VIA_BOT = 'VIA_BOT';
const VIDEO = 'VIDEO';
const GIF = 'GIF';
const PHOTO = 'PHOTO';
const POLL = 'POLL';
const VOICE = 'VOICE';
const MUSIC = 'MUSIC';
const DOCUMENT = 'DOCUMENT';
const LOCATION = 'LOCATION';
const CONTACT = 'CONTACT';
const STICKER = 'STICKER';
const ANIMATED_STICKER = 'ANIMATED_STICKER';
const VIDEO_STICKER = 'VIDEO_STICKER';
const UNSUPPORTED = 'UNSUPPORTED';
const PARTIALLY_UNSUPPORTED = 'PARTIALLY_UNSUPPORTED';

/* message media tag dict */
const mediaTagDict = {
    REPLY: ['[Reply]', '↩️'],
    FORWARDED: ['[Forwarded]', '🔁'],
    SERVICE: ['[Service]', '🔧'],
    VIA_BOT: ['[Via bot]', '🤖'],
    VIDEO: ['[Video]', '🎬'],
    GIF: ['[GIF]', '[GIF]'],
    PHOTO: ['[Photo]', '🖼'],
    POLL: ['[Poll]', '📊'],
    VOICE: ['[Voice]', '🎙'],
    MUSIC: ['[Music]', '🎵'],
    DOCUMENT: ['[Document]', '📄'],
    LOCATION: ['[Location]', '📍'],
    CONTACT: ['[Contact]', '📱'],
    STICKER: ['[Sticker]', '[Sticker]'],
    ANIMATED_STICKER: ['[Animated Sticker]', '[Animated Sticker]'],
    VIDEO_STICKER: ['[Video Sticker]', '[Video Sticker]'],
    UNSUPPORTED: ['[Unsupported]', '🚫'],
    PARTIALLY_UNSUPPORTED: ['', ''],
};

export const route: Route = {
    path: '/channel/:username/:routeParams?',
    categories: ['social-media', 'popular'],
    example: '/telegram/channel/awesomeRSSHub',
    parameters: {
        username: 'channel username',
        routeParams: `extra parameters, see the table below
| Key                    | Description                                                           | Accepts                                            | Defaults to  |
| :--------------------: | :-------------------------------------------------------------------: | :------------------------------------------------: | :----------: |
| showLinkPreview        | Show the link preview from Telegram                                   | 0/1/true/false                                     | true         |
| showViaBot             | For messages sent via bot, show the bot                               | 0/1/true/false                                     | true         |
| showReplyTo            | For reply messages, show the target of the reply                      | 0/1/true/false                                     | true         |
| showFwdFrom            | For forwarded messages, show the forwarding source                    | 0/1/true/false                                     | true         |
| showFwdFromAuthor      | For forwarded messages, show the author of the forwarding source      | 0/1/true/false                                     | true         |
| showInlineButtons      | Show inline buttons                                                   | 0/1/true/false                                     | false        |
| showMediaTagInTitle    | Show media tags in the title                                          | 0/1/true/false                                     | true         |
| showMediaTagAsEmoji    | Show media tags as emoji                                              | 0/1/true/false                                     | true         |
| showHashtagAsHyperlink | Show hashtags as hyperlinks (\`https://t.me/s/channel?q=%23hashtag\`) | 0/1/true/false                                     | true         |
| includeFwd             | Include forwarded messages                                            | 0/1/true/false                                     | true         |
| includeReply           | Include reply messages                                                | 0/1/true/false                                     | true         |
| includeServiceMsg      | Include service messages (e.g. message pinned, channel photo updated) | 0/1/true/false                                     | true         |
| includeUnsupportedMsg  | Include messages unsupported by t.me                                  | 0/1/true/false                                     | false        |
| searchQuery            | search query                                                          | keywords; replace \`#hashtag\` with \`%23hashtag\` | (no keyword) |

Specify different option values than default values can meet different needs, URL

\`\`\`
https://rsshub.app/telegram/channel/NewlearnerChannel/showLinkPreview=0&showViaBot=0&showReplyTo=0&showFwdFrom=0&showFwdFromAuthor=0&showInlineButtons=0&showMediaTagInTitle=1&showMediaTagAsEmoji=1&includeFwd=0&includeReply=1&includeServiceMsg=0&includeUnsupportedMsg=0
\`\`\`

generates an RSS without any link previews and annoying metadata, with emoji media tags in the title, without forwarded messages (but with reply messages), and without messages you don't care about (service messages and unsupported messages), for people who prefer pure subscriptions.

For backward compatibility reasons, invalid \`routeParams\` will be treated as \`searchQuery\` .
`,
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['t.me/s/:username'],
            target: '/channel/:username',
        },
    ],
    name: 'Channel',
    maintainers: ['DIYgod', 'Rongronggg9'],
    handler,
    description: `
  :::tip
  Due to Telegram restrictions, some channels involving pornography, copyright, and politics cannot be subscribed. You can confirm by visiting \`https://t.me/s/:username\`.
  :::`,
};

async function handler(ctx) {
    const useWeb = ctx.req.param('routeParams') || !config.telegram.session;
    if (!useWeb) {
        return tglibchannel(ctx);
    }

    const username = ctx.req.param('username');
    let routeParams = ctx.req.param('routeParams');
    let showLinkPreview = true;
    let showViaBot = true;
    let showReplyTo = true;
    let showFwdFrom = true;
    let showFwdFromAuthor = true;
    let showInlineButtons = false;
    let showMediaTagInTitle = true;
    let showMediaTagAsEmoji = true;
    let showHashtagAsHyperlink = true;
    let includeFwd = true;
    let includeReply = true;
    let includeServiceMsg = true;
    let includeUnsupportedMsg = false;
    let searchQuery = routeParams; // for backward compatibility
    if (routeParams && routeParams.search(/(^|&)(show(LinkPreview|ViaBot|ReplyTo|FwdFrom(Author)?|InlineButtons|MediaTag(InTitle|AsEmoji)|HashtagAsHyperlink)|include(Fwd|Reply|(Service|Unsupported)Msg)|searchQuery)=/) !== -1) {
        routeParams = querystring.parse(ctx.req.param('routeParams'));
        showLinkPreview = !!fallback(undefined, queryToBoolean(routeParams.showLinkPreview), showLinkPreview);
        showViaBot = !!fallback(undefined, queryToBoolean(routeParams.showViaBot), showViaBot);
        showReplyTo = !!fallback(undefined, queryToBoolean(routeParams.showReplyTo), showReplyTo);
        showFwdFrom = !!fallback(undefined, queryToBoolean(routeParams.showFwdFrom), showFwdFrom);
        showFwdFromAuthor = !!fallback(undefined, queryToBoolean(routeParams.showFwdFromAuthor), showFwdFromAuthor);
        showInlineButtons = !!fallback(undefined, queryToBoolean(routeParams.showInlineButtons), showInlineButtons);
        showMediaTagInTitle = !!fallback(undefined, queryToBoolean(routeParams.showMediaTagInTitle), showMediaTagInTitle);
        showMediaTagAsEmoji = !!fallback(undefined, queryToBoolean(routeParams.showMediaTagAsEmoji), showMediaTagAsEmoji);
        showHashtagAsHyperlink = !!fallback(undefined, queryToBoolean(routeParams.showHashtagAsHyperlink), showHashtagAsHyperlink);
        includeFwd = !!fallback(undefined, queryToBoolean(routeParams.includeFwd), includeFwd);
        includeReply = !!fallback(undefined, queryToBoolean(routeParams.includeReply), includeReply);
        includeServiceMsg = !!fallback(undefined, queryToBoolean(routeParams.includeServiceMsg), includeServiceMsg);
        includeUnsupportedMsg = !!fallback(undefined, queryToBoolean(routeParams.includeUnsupportedMsg), includeUnsupportedMsg);
        searchQuery = fallback(undefined, routeParams.searchQuery, null);
    }

    const resourceUrl = searchQuery ? `https://t.me/s/${username}?q=${encodeURIComponent(searchQuery)}` : `https://t.me/s/${username}`;

    const data = await cache.tryGet(
        resourceUrl,
        async () => {
            const _r = await got(resourceUrl);
            return _r.data;
        },
        config.cache.routeExpire,
        false
    );

    const $ = load(data);

    /*
     * Since 2024/4/20, t.me/s/ mistakenly have every '&' in **hyperlinks** replaced by '&amp;'.
     * The characteristic of a hyperlink is [onclick] (pop-up confirmation), which is not present in ordinary links.
     * This is a workaround to fix the issue until Telegram fixes it.
     */
    $('a[onclick][href]').each((_, elem) => {
        const $elem = $(elem);
        const href = $elem.attr('href');
        href && $elem.attr('href', href.replaceAll('&amp;', '&'));
    });

    !showHashtagAsHyperlink &&
        $('a[href^="?q=%23"]').each((_, elem) => {
            const $elem = $(elem);
            $elem.replaceWith($elem.text());
        });

    const list = includeServiceMsg
        ? $('.tgme_widget_message_wrap:not(.tgme_widget_message_wrap:has(.tme_no_messages_found))') // exclude 'no posts found' messages
        : $('.tgme_widget_message_wrap:not(.tgme_widget_message_wrap:has(.service_message,.tme_no_messages_found))'); // also exclude service messages

    if (list.length === 0 && $('.tgme_channel_history').length === 0) {
        throw new Error(`Unable to fetch message feed from this channel. Please check this URL to see if you can view the message preview: ${resourceUrl}`);
    }

    const channelName = $('.tgme_channel_info_header_title').text();
    const feedTitle = (searchQuery ? `"${searchQuery}" - ` : '') + channelName + ' - Telegram Channel';

    return {
        title: feedTitle,
        description: $('.tgme_channel_info_description').text(),
        link: resourceUrl,
        allowEmpty: true,

        itunes_author: channelName,
        image: $('.tgme_page_photo_image > img').attr('src'),

        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let extra = null;

                    /* message types */
                    let msgTypes = [];
                    if (item.find('.service_message').length) {
                        // service message can have an image (avatar changed)
                        msgTypes.push(SERVICE);
                    }
                    // if (item.find('.tgme_widget_message_video').length) {  // fail if video too big
                    if (item.find('.tgme_widget_message_video_player').length) {
                        // video and gif cannot be mixed, it's safe to do that
                        msgTypes.push(item.find('.message_video_play').length ? VIDEO : GIF);
                    }
                    if (item.find('.tgme_widget_message_photo,.tgme_widget_message_service_photo').length) {
                        // video and photo can be mixed
                        msgTypes.push(PHOTO);
                    }
                    // all other types below cannot be mixed
                    if (item.find('.tgme_widget_message_poll').length) {
                        msgTypes.push(POLL);
                    }
                    if (item.find('.tgme_widget_message_voice').length) {
                        msgTypes.push(VOICE);
                    }
                    if (item.find('.tgme_widget_message_document').length) {
                        // music and document cannot be mixed, it's safe to do that
                        msgTypes.push(item.find('.audio').length ? MUSIC : DOCUMENT);
                    }
                    if (item.find('.tgme_widget_message_location').length) {
                        msgTypes.push(LOCATION);
                    }
                    if (item.find('.tgme_widget_message_contact').length) {
                        msgTypes.push(CONTACT);
                    }
                    if (item.find('.tgme_widget_message_sticker').length) {
                        msgTypes.push(STICKER);
                    }
                    if (item.find('.tgme_widget_message_tgsticker').length) {
                        msgTypes.push(ANIMATED_STICKER);
                    }
                    if (item.find('.tgme_widget_message_videosticker').length) {
                        msgTypes.push(VIDEO_STICKER);
                    }
                    if (item.find('.message_media_not_supported').length) {
                        if (item.find('.media_supported_cont').length) {
                            msgTypes.unshift(PARTIALLY_UNSUPPORTED);
                        } else {
                            if (msgTypes.length === 0 && !includeUnsupportedMsg) {
                                return null; // drop unsupported message
                            }
                            msgTypes.unshift(UNSUPPORTED);
                        }
                    }
                    // all other types above cannot be mixed
                    if (item.find('.tgme_widget_message_author .tgme_widget_message_via_bot,.tgme_widget_message_forwarded_from .tgme_widget_message_via_bot').length) {
                        // can be mixed with other types, excluding service messages
                        msgTypes.unshift(VIA_BOT);
                    }
                    if (item.find('.tgme_widget_message_forwarded_from').length) {
                        // can be mixed with other types, excluding service messages and reply messages
                        msgTypes.unshift(FORWARDED);
                        if (!includeFwd) {
                            return null; // drop forwarded message
                        }
                    }
                    if (item.find('.tgme_widget_message_reply').length) {
                        // can be mixed with other types, excluding service messages and forwarded messages
                        msgTypes.unshift(REPLY);
                        if (!includeReply) {
                            return null; // drop reply message
                        }
                    }

                    /* fix emoji */
                    item.find('.emoji').each((_, emoji) => {
                        emoji = $(emoji);
                        emoji.replaceWith(`<span class="emoji">${emoji.text()}</span>`);
                    });

                    /* "Forwarded From" tag */
                    const fwdFrom = () => {
                        let fwdFrom = '';
                        const fwdFromNameObj = item.find('.tgme_widget_message_forwarded_from_name');
                        if (fwdFromNameObj.length) {
                            const userLink = fwdFromNameObj.attr('href');
                            const userHtml = userLink ? `<a href="${userLink}">${fwdFromNameObj.text()}</a>` : fwdFromNameObj.text();
                            fwdFrom += `<p>Forwarded From <b>${userHtml}</b>`;
                            const fwdFromAuthorObj = item.find('.tgme_widget_message_forwarded_from_author');
                            if (fwdFromAuthorObj.length && showFwdFromAuthor) {
                                fwdFrom += ` (${fwdFromAuthorObj.text()})`;
                            }
                            fwdFrom += '</p>';

                            extra = {
                                links: [
                                    {
                                        type: 'repost',
                                        url: userLink,
                                    },
                                ],
                            };
                        }
                        return fwdFrom;
                    };

                    /* reply */
                    const replyContent = () => {
                        const replyObj = item.find('.tgme_widget_message_reply');
                        if (replyObj.length === 0) {
                            return '';
                        } else {
                            const replyAuthorObj = replyObj.find('.tgme_widget_message_author_name');
                            const replyAuthor = replyAuthorObj.length ? replyAuthorObj.text() : '';
                            const viaBotObj = replyObj.find('.tgme_widget_message_via_bot');
                            const viaBotText = viaBotObj.length ? ` via <b>${viaBotObj.text()}</b>` : '';
                            const replyLinkHref = replyObj.attr('href');
                            const replyLink = replyLinkHref.length ? replyLinkHref : '';
                            const replyMetaTextObj = replyObj.find('.tgme_widget_message_metatext');
                            const replyMetaText = replyMetaTextObj.length ? `<p><small>${replyMetaTextObj.html()}</small></p>` : '';
                            const replyTextObj = replyObj.find('.tgme_widget_message_text');
                            const replyText = replyTextObj.length ? `<p>${replyTextObj.html()}</p>` : '';

                            extra = {
                                links: [
                                    {
                                        type: 'reply',
                                        url: replyLink,
                                    },
                                ],
                            };
                            return replyLink === ''
                                ? `<div class="rsshub-quote"><blockquote>
                                    <p><b>${replyAuthor}</b>${viaBotText}:</p>
                                    ${replyMetaText}
                                    ${replyText}
                                </blockquote></div>`
                                : `<div class="rsshub-quote"><blockquote>
                                    <p><a href='${replyLink}'><b>${replyAuthor}</b>${viaBotText}:</a></p>
                                    ${replyMetaText}
                                    ${replyText}
                                </blockquote></div>`;
                        }
                    };

                    /* via bot */
                    const viaBot = () => {
                        const viaBotObj = item.find('.tgme_widget_message_author .tgme_widget_message_via_bot,.tgme_widget_message_forwarded_from .tgme_widget_message_via_bot');
                        if (viaBotObj.length) {
                            const userLink = viaBotObj.attr('href');
                            const userHtml = userLink ? `<a href="${userLink}">${viaBotObj.text()}</a>` : viaBotObj.text();
                            return `<p>via <b>${userHtml}</b></p>`;
                        } else {
                            return '';
                        }
                    };

                    /* images and videos */
                    const generateMedia = (selector) => {
                        const nodes = item.find(selector);
                        if (!nodes.length) {
                            return '';
                        }
                        let tag_media_all = '';
                        const pictureNodes = nodes.find('picture');
                        const imgNodes = nodes.find('img');
                        nodes.each((_, node) => {
                            const $node = $(node);
                            let tag_media = '';
                            if (node.attribs && node.attribs.class && node.attribs.class.search(/(^|\s)tgme_widget_message_video_player(\s|$)/) !== -1) {
                                // video
                                const videoLink = $node.find('.tgme_widget_message_video').attr('src');
                                const thumbBackground = $node.find('.tgme_widget_message_video_thumb').css('background-image');
                                const thumbBackgroundUrl = thumbBackground && thumbBackground.match(/url\('(.*)'\)/);
                                const thumbBackgroundUrlSrc = thumbBackgroundUrl && thumbBackgroundUrl[1];
                                tag_media += art(path.join(__dirname, 'templates/video.art'), {
                                    source: videoLink,
                                    poster: thumbBackgroundUrlSrc,
                                });
                            } else if ($node.attr('data-webp')) {
                                // sticker
                                tag_media += `<img src="${$node.attr('data-webp')}">`;
                            } else if (node.name === 'picture') {
                                // animated sticker
                                tag_media += '<picture>';
                                $node.find('source,img').each((_, source) => {
                                    tag_media += $(source).toString();
                                });
                                tag_media += '</picture>';
                            } else if (node.attribs && node.attribs.class && node.attribs.class.search(/(^|\s)tgme_widget_message_videosticker(\s|$)/) !== -1) {
                                // video sticker
                                const videoLink = $node.find('.js-videosticker_video').attr('src');
                                tag_media += art(path.join(__dirname, 'templates/video.art'), {
                                    source: videoLink,
                                });
                            } else if (node.name === 'img') {
                                // unknown
                                tag_media += $node.toString();
                            } else if (pictureNodes.length) {
                                // unknown
                                pictureNodes.each((_, picture) => {
                                    tag_media += '<picture>';
                                    $(picture)
                                        .find('source,img')
                                        .each((_, source) => {
                                            tag_media += $(source).toString();
                                        });
                                    tag_media += '</picture>';
                                });
                            } else if (imgNodes.length) {
                                // service message
                                imgNodes.each((_, img) => {
                                    tag_media += $(img).toString();
                                });
                            } else {
                                // image message, location
                                const background = $node.css('background-image');
                                const backgroundUrl = background && background.match(/url\('(.*)'\)/);
                                const backgroundUrlSrc = backgroundUrl && backgroundUrl[1];
                                tag_media += backgroundUrlSrc ? `<img src="${backgroundUrlSrc}">` : '';
                            }
                            if (tag_media) {
                                tag_media_all += tag_media;
                                $node.find('.message_media_not_supported').remove();
                            }
                        });
                        return tag_media_all;
                    };
                    // ordinary message photos, service message photos, stickers, animated stickers, video
                    const messageMedia = generateMedia(
                        '.tgme_widget_message_photo_wrap,.tgme_widget_message_service_photo,.tgme_widget_message_sticker,.tgme_widget_message_tgsticker,.tgme_widget_message_videosticker,.tgme_widget_message_video_player'
                    );

                    /* location */
                    const location = () => {
                        const locationObj = item.find('.tgme_widget_message_location_wrap');
                        if (locationObj.length) {
                            const locationLink = locationObj.attr('href');
                            const mapBackground = locationObj.find('.tgme_widget_message_location').css('background-image');
                            const mapBackgroundUrl = mapBackground && mapBackground.match(/url\('(.*)'\)/);
                            const mapBackgroundUrlSrc = mapBackgroundUrl && mapBackgroundUrl[1];
                            const mapImgHtml = mapBackgroundUrlSrc ? `<img src="${mapBackgroundUrlSrc}">` : showMediaTagAsEmoji ? mediaTagDict[LOCATION][1] : mediaTagDict[LOCATION][0];
                            return locationLink ? `<a href="${locationLink}">${mapImgHtml}</a>` : mapImgHtml;
                        } else {
                            return '';
                        }
                    };

                    /* voice */
                    const voiceObj = item.find('audio.tgme_widget_message_voice');
                    const durationObj = item.find('.tgme_widget_message_voice_duration');
                    const durationInMmss = durationObj.text();
                    const voiceUrl = voiceObj.length ? voiceObj.attr('src') : '';
                    let voiceTitle = '';
                    let voiceHtml = '';
                    if (voiceUrl) {
                        if (showMediaTagInTitle) {
                            voiceTitle = durationInMmss ? `(${durationInMmss})` : '';
                        }
                        voiceHtml += '<p><b>';
                        voiceHtml += showMediaTagAsEmoji ? mediaTagDict[VOICE][1] : mediaTagDict[VOICE][0];
                        voiceHtml += durationInMmss ? ` (${durationInMmss})` : '';
                        voiceHtml += '</b></p>';
                        voiceHtml += `<audio src="${voiceUrl}"></audio>`;
                    }
                    const voiceDuration = () => {
                        if (durationObj.length) {
                            const p = durationInMmss.split(':');
                            let second = 0,
                                minute = 1;
                            while (p.length > 0) {
                                second += minute * Number.parseInt(p.pop(), 10);
                                minute *= 60;
                            }
                            return second.toString();
                        } else {
                            return '';
                        }
                    };

                    /* link preview */
                    const linkPreview = () => {
                        const linkPreviewSiteObj = item.find('.link_preview_site_name');
                        const linkPreviewSite = linkPreviewSiteObj.length ? `<b>${linkPreviewSiteObj.text()}</b><br>` : '';
                        const linkPreviewTitleObj = item.find('.link_preview_title');
                        const linkPreviewTitle = linkPreviewTitleObj.length ? `<b><a href="${item.find('.tgme_widget_message_link_preview').attr('href')}">${linkPreviewTitleObj.text()}</a></b><br>` : '';
                        const linkPreviewDescriptionObj = item.find('.link_preview_description');
                        const linkPreviewDescription = linkPreviewDescriptionObj.length ? `<p>${linkPreviewDescriptionObj.html()}</p>` : '';
                        const linkPreviewImage = generateMedia('.link_preview_image') + generateMedia('.link_preview_right_image');

                        return linkPreviewSite.length > 0 || linkPreviewTitle.length > 0 || linkPreviewDescription.length > 0 || linkPreviewImage.length > 0
                            ? `<blockquote>${linkPreviewSite}${linkPreviewTitle}${linkPreviewDescription}${linkPreviewImage}</blockquote>`
                            : '';
                    };

                    /* poll */
                    const pollQuestionObj = item.find('.tgme_widget_message_poll_question');
                    const pollQuestion = pollQuestionObj.length ? pollQuestionObj.text() : '';
                    const poll = () => {
                        let pollHtml = '';
                        const pollTypeObj = item.find('.tgme_widget_message_poll_type');
                        const pollType = pollTypeObj.length ? pollTypeObj.text() : '';
                        const pollOptions = item.find('.tgme_widget_message_poll_option');
                        if (pollQuestion && pollType.length > 0 && pollOptions.length > 0) {
                            pollHtml += `<p><b>${pollQuestion}</b></p>`;
                            pollHtml += `<p><small>${pollType}</small></p>`;
                            pollOptions.each((_, option) => {
                                const $option = $(option);
                                const percentObj = $option.find('.tgme_widget_message_poll_option_percent');
                                const percent = percentObj.length ? percentObj.text() : '';
                                const textObj = $option.find('.tgme_widget_message_poll_option_text');
                                const text = textObj.length ? textObj.text() : '';
                                if (percent && text) {
                                    pollHtml += `<p><b>${percent}</b> - ${text}</p>`;
                                }
                            });
                        }
                        return pollHtml ? `<blockquote>${pollHtml}</blockquote>` : '';
                    };

                    /* attachment (document or music) */
                    const documentWrapObj = item.find('.tgme_widget_message_document_wrap');
                    let attachmentTitle = '';
                    let attachmentHtml = '';
                    if (documentWrapObj.length) {
                        documentWrapObj.each((_, wrap) => {
                            // a message may have multiple attachments
                            const $wrap = $(wrap);
                            const documentTitleObj = $wrap.find('.tgme_widget_message_document_title');
                            const documentExtraObj = $wrap.find('.tgme_widget_message_document_extra');
                            const documentTitle = documentTitleObj.length ? documentTitleObj.text() : '';
                            const documentExtra = documentExtraObj.length ? documentExtraObj.text() : '';
                            const _attachmentTitle = `${documentTitle}${documentTitle && documentExtra ? ' - ' : ''}${documentExtra}`;
                            const _attachmentHtml = (documentTitle ? `<p><b>${documentTitle}</b></p>` : '') + (documentExtra ? `<p><small>${documentExtra}</small></p>` : '');
                            attachmentTitle += attachmentTitle && _attachmentTitle ? ' | ' : '';
                            attachmentTitle += _attachmentTitle;
                            attachmentHtml += _attachmentHtml ? `<blockquote>${_attachmentHtml}</blockquote>` : '';
                            const wrapNext = $wrap.next('.tgme_widget_message_text');
                            if (wrapNext.length) {
                                const captionHtml = wrapNext.html();
                                if (captionHtml.length) {
                                    attachmentHtml += `<p>${captionHtml}</p>`;
                                }
                                // remove them, avoid being duplicated
                                wrapNext.each((_, caption) => {
                                    $(caption).remove();
                                });
                            }
                        });
                    }

                    /* contact */
                    const contactNameObj = item.find('.tgme_widget_message_contact_name');
                    const contactName = contactNameObj.length ? contactNameObj.text() : '';
                    const contactNameHtml = contactName ? `<b>${contactName}</b>` : '';
                    const contactPhoneObj = item.find('.tgme_widget_message_contact_phone');
                    const contactPhone = contactPhoneObj.length ? contactPhoneObj.text() : '';
                    const contactPhoneHtml = contactPhone ? `<a href="tel:${contactPhone.replace(' ', '')}">${contactPhone}</a>` : '';
                    const contactTitle = contactName + (contactName && contactPhone ? ': ' : '') + contactPhone;
                    const contactHtml = contactNameHtml || contactPhoneHtml ? `<p>${contactNameHtml}${contactName && contactPhone ? ': ' : ''}${contactPhoneHtml}</p>` : '';

                    /* inline buttons */
                    let inlineButtons = '';
                    const inlineButtonNodes = item.find('.tgme_widget_message_inline_button_text');
                    if (showInlineButtons && inlineButtonNodes.length) {
                        inlineButtons += '<table style="width: 100%"><tbody><tr>';
                        inlineButtonNodes.each((_, button) => {
                            const $button = $(button);
                            const buttonText = $button.text();
                            inlineButtons += `<td style="border: 2px solid;text-align: center"><b>${buttonText}</b></td>`;
                        });
                        inlineButtons += '</tr></tbody></table>';
                    }

                    /* unsupported */
                    let unsupportedHtml = '';
                    let unsupportedTitle = '';
                    const unsupportedNodes = item.find('.message_media_not_supported');
                    if (msgTypes.includes(UNSUPPORTED)) {
                        if (unsupportedNodes.length) {
                            unsupportedHtml += '<blockquote>';
                            unsupportedNodes.find('.message_media_not_supported_label').each(function () {
                                const $this = $(this);
                                unsupportedTitle += $this.text();
                                unsupportedHtml += `<p>${$this.text()}</p>`;
                            });
                            unsupportedNodes.find('.message_media_view_in_telegram').each(function () {
                                const $this = $(this);
                                unsupportedHtml += $this.attr('href') ? `<p><a href="${$this.attr('href')}">${$this.text()}</a></p>` : `<p>${$this.text()}</p>`;
                            });
                            unsupportedHtml += '</blockquote>';
                        } else {
                            // remove unsupported type, previous parsing has proved that it is not unsupported
                            msgTypes = msgTypes.filter((type) => type !== UNSUPPORTED);
                        }
                    }

                    /* pubDate */
                    const pubDate = parseDate(item.find('.tgme_widget_message_date time').attr('datetime'));

                    /* ----- finished parsing ----- */

                    /* media tag */
                    let mediaTag = '';
                    if (showMediaTagInTitle) {
                        for (const type of msgTypes) {
                            if (type !== REPLY || type !== FORWARDED || type !== VIA_BOT || (type === REPLY && showReplyTo) || (type === FORWARDED && showFwdFrom) || (type === VIA_BOT && showViaBot)) {
                                mediaTag += showMediaTagAsEmoji ? mediaTagDict[type][1] : mediaTagDict[type][0];
                            }
                        }
                    }

                    /* message text & title */
                    const messageTextObj = item.find(`.${msgTypes.includes(PARTIALLY_UNSUPPORTED) ? 'media_supported_cont' : 'tgme_widget_message_bubble'} > .tgme_widget_message_text`);
                    let messageHtml = '',
                        messageTitle = '';

                    if (messageTextObj.length > 0) {
                        messageHtml = `<p>${messageTextObj.html()}</p>`;
                    }

                    let titleCompleteFlag = false;
                    if (pollQuestion) {
                        messageTitle = pollQuestion;
                        titleCompleteFlag = true;
                    } else if (attachmentTitle) {
                        messageTitle = attachmentTitle;
                        titleCompleteFlag = true;
                    } else if (contactTitle) {
                        messageTitle = contactTitle;
                        titleCompleteFlag = true;
                    } else if (voiceTitle) {
                        messageTitle = voiceTitle;
                    } else if (unsupportedTitle) {
                        messageTitle = unsupportedTitle;
                        titleCompleteFlag = true;
                    }

                    if (messageTextObj.length > 0 && !titleCompleteFlag) {
                        const _messageTextObj = $(messageTextObj.toString());
                        _messageTextObj.find('br').replaceWith('\n');
                        const trimmedTitleText = _messageTextObj.text().replaceAll('\n', ' ').trim();
                        messageTitle += (messageTitle && trimmedTitleText ? ': ' : '') + trimmedTitleText;
                    }

                    messageTitle = messageTitle === '' ? mediaTag || pubDate.toUTCString() : `${mediaTag}${mediaTag ? ' ' : ''}${messageTitle}`;

                    let description = '';
                    if (showFwdFrom) {
                        description += fwdFrom();
                    }
                    if (showReplyTo) {
                        description += replyContent();
                    }
                    if (showViaBot) {
                        description += viaBot();
                    }
                    description += location() + poll() + contactHtml + voiceHtml + attachmentHtml + messageHtml + unsupportedHtml;
                    if (showLinkPreview) {
                        description += linkPreview();
                    }
                    description += inlineButtons + messageMedia;

                    return {
                        title: messageTitle,
                        description,
                        pubDate,
                        link: item.find('.tgme_widget_message_date').attr('href'),
                        author: item.find('.tgme_widget_message_from_author').text(),

                        enclosure_url: voiceUrl,
                        itunes_duration: voiceDuration(),
                        enclosure_type: 'audio/ogg',

                        _extra: extra,
                    };
                })
                .get()
                .filter(Boolean)
                .reverse(),
    };
}

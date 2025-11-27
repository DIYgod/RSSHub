import path from 'node:path';

import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const domain = 'huxiu.com';
const rootUrl = `https://www.${domain}`;

const apiArticleRootUrl = `https://api-article.${domain}`;
const apiBriefRootUrl = `https://api-brief.${domain}`;
const apiMemberRootUrl = `https://api-account.${domain}`;
const apiMomentRootUrl = `https://moment-api.${domain}`;
const apiSearchRootUrl = `https://search-api.${domain}`;

/**
 * Cleans up HTML data by removing specific elements and attributes.
 *
 * @param {string} data - The HTML data to clean up.
 * @returns {string} - The cleaned up HTML data.
 */
const cleanUpHTML = (data) => {
    const $ = load(data);

    $('div.neirong-shouquan').remove();
    $('em.vote__bar, div.vote__btn, div.vote__time').remove();
    $('p img').each((_, e) => {
        e = $(e);
        if ((e.prop('src') ?? e.prop('_src')) !== undefined) {
            e.parent().replaceWith(
                art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: (e.prop('src') ?? e.prop('_src')).split(/\?/)[0],
                        width: e.prop('data-w'),
                        height: e.prop('data-h'),
                    },
                })
            );
        }
    });
    $('p, span').each((_, e) => {
        e = $(e);
        if (e.contents().length === 1 && /^\s*$/.test(e.text())) {
            e.remove();
        } else {
            e.removeClass();
            e.removeAttr('data-check-id label class');
        }
    });
    $('.text-big-title').each((_, e) => {
        e.tagName = 'h3';
        e = $(e);
        e.removeClass();
        e.removeAttr('class');
    });
    $('.text-sm-title').each((_, e) => {
        e.tagName = 'h4';
        e = $(e);
        e.removeClass();
        e.removeAttr('class');
    });

    return $.html();
};

/**
 * Fetch brief column data for the specified ID.
 *
 * @param {string} url - The ID of the brief column to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchBriefColumnData = async (id) => {
    const apiBriefColumnUrl = new URL('briefColumn/detail', apiBriefRootUrl).href;

    const {
        data: { data },
    } = await got.post(apiBriefColumnUrl, {
        form: {
            platform: 'www',
            brief_column_id: id,
        },
    });

    const currentUrl = new URL(`club/${data.club_id}.html`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const subtitle = `${data.name}-${data.sub_name}`;
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = $('meta[name="author"]').prop('content');

    return {
        title: `${subtitle}-${author}`,
        link: currentUrl,
        description: data.summary,
        language: $('html').prop('lang'),
        image: data.head_img,
        icon,
        logo: icon,
        subtitle,
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
    };
};

/**
 * Fetches club data for the specified ID and the ID of the default brief column.
 *
 * @param {string} id - The ID of the club to fetch data from.
 * @returns {Promise<Object>} data - A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 * @returns {string} id - the ID of the default brief column.
 */
const fetchClubData = async (id) => {
    const currentUrl = new URL(`club/${id}.html`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = $('meta[name="author"]').prop('content');

    return {
        data: {
            title,
            link: currentUrl,
            description: $('ul.content-item li.content').text().trim(),
            language: $('html').prop('lang'),
            image: $('div.header img.img').prop('data-src')?.split(/\?/)[0] ?? undefined,
            icon,
            logo: icon,
            subtitle: title.split(/-/)[0],
            author,
            itunes_author: author,
            itunes_category: 'News',
            allowEmpty: true,
        },
        briefColumnId: currentResponse.match(/"brief_column_id":"(\d+)",/)[1],
    };
};

/**
 * Fetch data from the specified URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchData = async (url) => {
    const { data: response } = await got(url);

    const $ = load(response);

    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href'), rootUrl).href;
    const author = $('meta[name="author"]').prop('content');

    return {
        title: $('title').text(),
        link: url,
        description: $('div.tag-content').text() || $('span.author-intro').text() || $('p.collection__intro').text() || $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        icon,
        logo: icon,
        subtitle: $('title').text().split(/-/)[0],
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
    };
};

/**
 * Fetches item data.
 *
 * @param {Object} item - The item to fetch data for.
 * @returns {Promise<Object>} The fetched item data object.
 */
const fetchItem = async (item) => {
    const { data: detailResponse } = await got(item.link);

    const state = parseInitialState(detailResponse);
    const data = state?.briefStoreModule?.brief_detail.brief ?? state?.articleDetail?.articleDetail ?? undefined;

    if (!data) {
        return item;
    }

    const { processed: audio, processedItem: audioItem = {} } = processAudioInfo(data.audio_info);

    if (Object.keys(audioItem).length !== 0) {
        audioItem.itunes_item_image = data.pic_path ?? data.share_info?.share_img ?? undefined;
    }

    const { processed: video, processedItem: videoItem = {} } = processVideoInfo(data.video_info);

    item.title = data.title ?? item.title;
    item.description = art(path.join(__dirname, 'templates/description.art'), {
        image: {
            src: data.pic_path,
        },
        video,
        audio,
        preface: cleanUpHTML(data.content_preface ?? data.preface),
        summary: data.ai_summary,
        description: cleanUpHTML(data.content),
    });
    item.author = data.user_info?.username ?? item.author;
    item.category = [data.video_article_tag, data.brief_column?.name ?? undefined, data.club_info?.name ?? undefined, ...(data.tags_info?.map((c) => c.name) ?? []), ...(data.relation_info?.channel?.map((c) => c.name) ?? [])].filter(
        Boolean
    );
    item.pubDate = parseDate(data.dateline ?? data.publish_time, 'X');
    item.upvote = data.agreenum ?? item.upvote;
    item.comments = data.commentnum ?? data.total_comment_num ?? item.comments;

    item.upvote = Number.parseInt(item.upvote, 10);
    item.comments = Number.parseInt(item.comments, 10);

    return {
        ...audioItem,
        ...videoItem,
        ...item,
    };
};

/**
 * Generates a random nonce string.
 *
 * @returns {string} The generated nonce string.
 */
const generateNonce = () => {
    let nonce = '';
    const e = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const t = 16;
    for (let i = 0; i < t; i++) {
        nonce += e.charAt(Math.floor(Math.random() * e.length));
    }
    return nonce;
};

/**
 * Generates a signature object containing a nonce, timestamp, and signature value.
 *
 * @returns {string} nonce - The generated nonce.
 * @returns {string} timestamp - The timestamp.
 * @returns {string} signature - The calculated signature value.
 */
const generateSignature = () => {
    const timestamp = Math.round(Date.now() / 1000).toString();

    const appSecret = 'hUzaABtNfDE-6UiyaYhfsmjW-8dnoyVc';
    const nonce = generateNonce();
    const r = [appSecret, timestamp, nonce].toSorted();
    return {
        nonce,
        timestamp,
        signature: CryptoJS.SHA1(r[0] + r[1] + r[2]).toString(),
    };
};

/**
 * Parses the initial state from the provided data.
 *
 * @param {string} data - The data to parse the initial state from.
 * @returns {Object|undefined} - The parsed initial state object, or undefined if not found.
 */
const parseInitialState = (data) => {
    const matches = data.match(/window\.__INITIAL_STATE__=({.*?});\(function\(\)/);
    if (matches) {
        return JSON.parse(matches[1]);
    }
    return;
};

const audioQualities = ['', 'low'];

/**
 * Processes the audio information and returns the processed data.
 *
 * @param {Object} info - The audio information to process.
 * @returns {Object} - An object containing the processed audio data.
 */
const processAudioInfo = (info) => {
    const quality = info ? audioQualities.find((quality) => Object.hasOwn(info, `audio_${quality === '' ? '' : `${quality}_`}path`)) : undefined;

    if (quality === undefined) {
        return {
            processed: undefined,
            processedItem: {},
        };
    }

    const linkKey = `audio_${quality}path`;
    const sizeKey = `audio_${quality}size`;

    const processed = {
        duration: info.format_length_new ?? info.format_length,
        size: Object.hasOwn(info, sizeKey) ? info[sizeKey] : undefined,
        src: info[linkKey],
        type: `audio/${info[linkKey].split(/\./).pop()}`,
    };

    const processedItem = {
        itunes_duration: processed.duration,
        enclosure_url: processed.src,
        enclosure_length: processed.size,
        enclosure_type: processed.type,
    };

    return {
        processed,
        processedItem,
    };
};

/**
 * Process the item list and return the resulting array.
 *
 * @param {Object[]} items - The items to process.
 * @param {number} limit - The maximum number of items to process.
 * @param {Function} tryGet   - The tryGet function that handles the retrieval process.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of processed items.
 */
const processItems = async (items, limit, tryGet) => {
    items = items
        .map((item) => {
            let guid = '';
            let link = '';

            if (item.moment_id) {
                guid = `huxiu-moment-${item.moment_id}`;
                link = item.url || new URL(`moment/${item.moment_id}.html`, rootUrl).href;
            } else if (item.brief_id || /huxiu\.com\/brief\//.test(item.url)) {
                item.brief_id = item.brief_id ?? item.aid;
                guid = `huxiu-brief-${item.brief_id}`;
                link = new URL(`brief/${item.brief_id}.html`, rootUrl).href;
            } else if (item.aid) {
                guid = `huxiu-article-${item.aid}`;
                link = new URL(`article/${item.aid}.html`, rootUrl).href;
            } else {
                return '';
            }

            const { processed: audio, processedItem: audioItem = {} } = processAudioInfo(item.audio_info);

            if (Object.keys(audioItem).length !== 0) {
                audioItem.itunes_item_image = item.pic_path ?? item.share_info?.share_img ?? undefined;
            }

            const { processed: video, processedItem: videoItem = {} } = processVideoInfo(item.video_info);

            const upvotes = item.count_info?.agree ?? item.count_info?.favtimes ?? item.agree_num ?? 0;
            const downvotes = item.count_info?.disagree ?? 0;
            const comments = item.count_info?.total_comment_num ?? item.count_info?.commentnum ?? item.total_comment_num ?? item.commentnum ?? 0;

            return {
                ...audioItem,
                ...videoItem,
                title: (item.title ?? item.summary ?? item.content)?.replaceAll(/<\/?(?:em|br)?>/g, ''),
                link,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    image: {
                        src: item.origin_pic_path ?? item.pic_path ?? item.big_pic_path?.split(/\?/)[0] ?? undefined,
                    },
                    audio,
                    video,
                    summary: item.summary ?? item.content ?? item.preface,
                }),
                author: item.user_info?.username ?? item.brief_column?.name ?? item.author_info?.username ?? item.author,
                guid,
                pubDate: (item.publish_time ?? item.dateline) ? parseDate(item.publish_time ?? item.dateline, 'X') : undefined,
                upvotes: Number.parseInt(upvotes, 10),
                downvotes: Number.parseInt(downvotes, 10),
                comments: Number.parseInt(comments, 10),
            };
        })
        .filter(Boolean)
        .slice(0, limit);

    return await Promise.all(
        items.map((item) =>
            tryGet(item.guid, async () => {
                if (!new RegExp(domain, 'i').test(new URL(item.link).hostname)) {
                    return item;
                } else if (!item.guid.startsWith('huxiu-moment')) {
                    return await fetchItem(item);
                }

                return item;
            })
        )
    );
};

const videoQualities = ['fhd', 'fhd_medium', 'wifi', 'fhd_low', 'flow', 'hd', 'sd'];

/**
 * Processes the video information and returns the processed data.
 *
 * @param {Object} info - The video information to process.
 * @returns {Object} - An object containing the processed video data.
 */
const processVideoInfo = (info) => {
    const quality = info ? videoQualities.find((quality) => Object.hasOwn(info, `${quality}_link`)) : undefined;

    if (quality === undefined) {
        return {
            processed: undefined,
            processedItem: {},
        };
    }

    const linkKey = `${quality}_link`;
    const sizeKey = `origin_${quality}_size`;

    const processed = {
        duration: info.duration ?? info.origin_duration,
        poster: info.cover ?? info.custom_cover_path ?? info.gif_path,
        size: Object.hasOwn(info, sizeKey) ? info[sizeKey] : undefined,
        src: info[linkKey],
        type: `video/${info[linkKey].split(/\./).pop()}`,
    };

    const processedItem = {
        itunes_item_image: processed.poster,
        itunes_duration: processed.duration,
        enclosure_url: processed.src,
        enclosure_length: processed.size,
        enclosure_type: processed.type,
    };

    return {
        processed,
        processedItem,
    };
};

export { apiArticleRootUrl, apiBriefRootUrl, apiMemberRootUrl, apiMomentRootUrl, apiSearchRootUrl, fetchBriefColumnData, fetchClubData, fetchData, generateSignature, processItems, rootUrl };

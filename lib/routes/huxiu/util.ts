import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

const domain = 'huxiu.com';
const rootUrl = `https://www.${domain}`;

const apiArticleRootUrl = `https://api-web-article.${domain}`;
const apiClubRootUrl = `https://api-ms-web-club.${domain}`;
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
                renderDescription({
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
 * Fetches club data for the specified ID.
 *
 * @param {string} id - The ID of the club to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchClubData = async (id: string) => {
    const currentUrl = new URL(`club/${id}.html`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href') ?? '', rootUrl).href;
    const author = $('meta[name="author"]').prop('content');

    // Parse club data from __NUXT_DATA__
    let clubData: Record<string, unknown> | undefined;

    const nuxtDataScript = $('#__NUXT_DATA__').text();
    if (nuxtDataScript) {
        try {
            const nuxtData = JSON.parse(nuxtDataScript) as unknown[];

            // Find the fetchData object which contains club info
            for (const item of nuxtData) {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const keys = Object.keys(item);
                    if (keys.includes('fetchData')) {
                        const fetchDataIndex = (item as Record<string, number>).fetchData;
                        if (typeof fetchDataIndex === 'number') {
                            clubData = resolveNuxtData(nuxtData, fetchDataIndex) as Record<string, unknown>;
                            break;
                        }
                    }
                }
            }
        } catch {
            // Failed to parse Nuxt data
        }
    }

    return {
        title,
        link: currentUrl,
        description: String(clubData?.format_desc ?? $('meta[name="description"]').prop('content') ?? ''),
        language: $('html').prop('lang'),
        image: clubData?.icon_path ? String(clubData.icon_path).split(/\?/)[0] : undefined,
        icon,
        logo: icon,
        subtitle: String(clubData?.name ?? title.split(/-/)[0]),
        author,
        itunes_author: author,
        itunes_category: 'News',
        allowEmpty: true,
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
    const data = state?.articleDetail?.articleDetail;

    if (!data) {
        return item;
    }

    const { processed: audio, processedItem: audioItem = {} } = processAudioInfo(data.audio_info);

    if (Object.keys(audioItem).length !== 0) {
        audioItem.itunes_item_image = data.pic_path ?? data.share_info?.share_img ?? undefined;
    }

    const { processed: video, processedItem: videoItem = {} } = processVideoInfo(data.video_info);

    item.title = data.title ?? item.title;
    const preface = data.content_preface ?? data.preface;
    const content = data.content;
    item.description = renderDescription({
        image: {
            src: data.pic_path,
        },
        video,
        audio,
        preface: preface ? cleanUpHTML(preface) : undefined,
        summary: data.summary,
        description: content ? cleanUpHTML(content) : undefined,
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
 * Resolves Nuxt 3 data array references recursively.
 * Nuxt 3 uses a special array format where numbers are references to other array indices.
 *
 * @param {unknown[]} arr - The Nuxt data array.
 * @param {number} index - The index to resolve.
 * @param {Set<number>} visited - Set of visited indices to prevent infinite loops.
 * @returns {unknown} - The resolved value.
 */
const resolveNuxtData = (arr: unknown[], index: number, visited: Set<number> = new Set()): unknown => {
    if (visited.has(index)) {
        return arr[index];
    }
    visited.add(index);

    const item = arr[index];

    // Handle ShallowReactive wrapper: ["ShallowReactive", refIndex]
    if (Array.isArray(item) && item[0] === 'ShallowReactive' && typeof item[1] === 'number') {
        return resolveNuxtData(arr, item[1], visited);
    }

    // Handle Reactive wrapper: ["Reactive", refIndex]
    if (Array.isArray(item) && item[0] === 'Reactive' && typeof item[1] === 'number') {
        return resolveNuxtData(arr, item[1], visited);
    }

    // Handle Set wrapper: ["Set"]
    if (Array.isArray(item) && item[0] === 'Set') {
        return new Set();
    }

    // Handle object - resolve all numeric references in values
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const resolved: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
            resolved[key] = typeof value === 'number' ? resolveNuxtData(arr, value, new Set(visited)) : value;
        }
        return resolved;
    }

    // Handle arrays that are not special wrappers
    if (Array.isArray(item)) {
        return item.map((value, i) => {
            if (typeof value === 'number' && value !== i) {
                return resolveNuxtData(arr, value, new Set(visited));
            }
            return value;
        });
    }

    return item;
};

/**
 * Parses the initial state from the provided data.
 * Supports both Nuxt 3 (__NUXT_DATA__) format for articles and
 * window.__INITIAL_STATE__ format for briefs.
 *
 * @param {string} data - The data to parse the initial state from.
 * @returns {Object|undefined} - The parsed initial state object, or undefined if not found.
 */
const parseInitialState = (data: string) => {
    const $ = load(data);

    // Try Nuxt 3 format first (for articles)
    const nuxtDataScript = $('#__NUXT_DATA__').text();
    if (nuxtDataScript) {
        try {
            const nuxtData = JSON.parse(nuxtDataScript) as unknown[];

            // Find the data object which contains articleDetail
            // The structure is: [["ShallowReactive", 1], {data: 2, ...}, ["ShallowReactive", 3], {articleDetail-xxx: 4}, ...]
            for (const item of nuxtData) {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    const articleDetailKey = Object.keys(item).find((key) => key.startsWith('articleDetail-'));
                    if (articleDetailKey) {
                        const articleDetailIndex = (item as Record<string, number>)[articleDetailKey];
                        if (typeof articleDetailIndex === 'number') {
                            const articleData = resolveNuxtData(nuxtData, articleDetailIndex) as Record<string, unknown>;
                            if (articleData?.articleDetail) {
                                return { articleDetail: articleData };
                            }
                        }
                    }
                }
            }
        } catch {
            // Failed to parse Nuxt data
        }
    }

    // Try window.__INITIAL_STATE__ format (for briefs)
    const initialStateMatch = data.match(/window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?\s*\(function\(\)/);
    if (initialStateMatch?.[1]) {
        try {
            const initialState = JSON.parse(initialStateMatch[1]) as Record<string, unknown>;
            const briefStoreModule = initialState.briefStoreModule as Record<string, unknown> | undefined;
            const briefDetail = briefStoreModule?.brief_detail as Record<string, unknown> | undefined;
            const brief = briefDetail?.brief as Record<string, unknown> | undefined;

            if (brief) {
                // Transform brief data to match the articleDetail structure expected by fetchItem
                const publisherList = brief.publisher_list as Array<{ username?: string }> | undefined;
                const briefColumn = briefDetail?.brief_column as Record<string, unknown> | undefined;
                const clubInfo = briefDetail?.club_info as Record<string, unknown> | undefined;

                return {
                    articleDetail: {
                        articleDetail: {
                            title: brief.title,
                            content: brief.content,
                            preface: brief.preface,
                            dateline: brief.publish_time,
                            publish_time: brief.publish_time,
                            audio_info: brief.audio_info,
                            agreenum: brief.agree_num,
                            total_comment_num: brief.total_comment_num,
                            user_info: publisherList?.[0] ? { username: publisherList[0].username } : undefined,
                            brief_column: briefColumn ? { name: briefColumn.name } : undefined,
                            club_info: clubInfo ? { name: clubInfo.name } : undefined,
                            share_info: brief.share_info,
                        },
                    },
                };
            }
        } catch {
            // Failed to parse initial state
        }
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

            if (item.object_type === 8) {
                guid = `huxiu-moment-${item.object_id}`;
                link = item.url || new URL(`moment/${item.object_id}.html`, rootUrl).href;
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
                description: renderDescription({
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

export { apiArticleRootUrl, apiClubRootUrl, apiMemberRootUrl, apiMomentRootUrl, apiSearchRootUrl, fetchBriefColumnData, fetchClubData, fetchData, generateSignature, processItems, rootUrl };

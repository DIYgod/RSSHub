import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import got from '@/utils/got';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';
import puppeteer from '@/utils/puppeteer';

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
 * Fetches club data for the specified ID.
 *
 * @param {string} id - The ID of the club to fetch data from.
 * @returns {Promise<Object>} A promise that resolves to an object containing the fetched data
 *                            to be added into `ctx.state.data`.
 */
const fetchClubData = async (id: string, requestHeaders = {}) => {
    const currentUrl = new URL(`club/${id}.html`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl, {
        headers: requestHeaders,
    });

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
 * Builds category array from article data.
 *
 * @param {Object} data - The article data.
 * @returns {string[]} - Array of category names.
 */
const buildCategories = (data) => [data.video_article_tag, data.brief_column?.name, data.club_info?.name, ...(data.tags_info?.map((c) => c.name) ?? []), ...(data.relation_info?.channel?.map((c) => c.name) ?? [])].filter(Boolean);

/**
 * Solves the WAF once with Puppeteer, fetches all internal detail pages inside the
 * browser context in small batches, then closes the browser immediately after the
 * HTML payloads are returned to Node.js.
 *
 * @param {string[]} urls - Internal detail URLs to fetch.
 * @returns {Promise<Map<string, string>>} Map of detail URL to raw HTML.
 */
const fetchDetailPagesInBrowser = async (urls: string[]) => {
    if (urls.length === 0) {
        return new Map<string, string>();
    }

    const browser = await puppeteer();

    try {
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'document' || resourceType === 'script' || resourceType === 'xhr' || resourceType === 'fetch' || resourceType === 'other') {
                request.continue();
            } else {
                request.abort();
            }
        });

        await page.goto(urls[0], {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForSelector('#__NUXT_DATA__, .detail-content', { timeout: 8000 });

        const htmlEntries = await page.evaluate((detailUrls) => {
            const batchSize = 4;
            const batches = Array.from({ length: Math.ceil(detailUrls.length / batchSize) }, (_, index) => detailUrls.slice(index * batchSize, (index + 1) * batchSize));

            const fetchBatch = async (index: number): Promise<Array<[string, string]>> => {
                if (index >= batches.length) {
                    return [];
                }

                const currentBatch = await Promise.all(
                    batches[index].map(async (url) => {
                        const response = await fetch(url, {
                            credentials: 'include',
                        });
                        return [url, await response.text()] as [string, string];
                    })
                );

                return [...currentBatch, ...(await fetchBatch(index + 1))];
            };

            return fetchBatch(0);
        }, urls);

        return new Map(htmlEntries);
    } catch (error) {
        logger.warn(`[huxiu] failed to fetch details in browser context: ${error instanceof Error ? error.message : String(error)}`);
        return new Map<string, string>();
    } finally {
        await browser.close();
    }
};

const fetchItem = (item, detailResponse: string) => {
    const state = parseInitialState(detailResponse);
    const data = state?.articleDetail?.articleDetail;

    if (data) {
        const { processed: audio, processedItem: audioItem = {} } = processAudioInfo(data.audio_info);

        if (Object.keys(audioItem).length !== 0) {
            audioItem.itunes_item_image = data.pic_path ?? data.share_info?.share_img ?? undefined;
        }

        const { processed: video, processedItem: videoItem = {} } = processVideoInfo(data.video_info);

        const preface = data.content_preface ?? data.preface;
        const content = data.content;

        return {
            ...audioItem,
            ...videoItem,
            ...item,
            title: data.title ?? item.title,
            description: renderDescription({
                image: { src: data.pic_path },
                video,
                audio,
                preface: preface ? cleanUpHTML(preface) : undefined,
                summary: data.summary,
                description: content ? cleanUpHTML(content) : undefined,
            }),
            author: data.user_info?.username ?? item.author,
            category: buildCategories(data),
            pubDate: parseDate(data.dateline ?? data.publish_time, 'X'),
            upvotes: Number.parseInt(data.agreenum ?? item.upvotes ?? 0, 10),
            comments: Number.parseInt(data.commentnum ?? data.total_comment_num ?? item.comments ?? 0, 10),
        };
    }

    // Fallback: parse HTML directly using cheerio for brief pages
    const $ = load(detailResponse);

    // Extract pubDate from meta tag
    const publishedTime = $('meta[property="article:published_time"]').attr('content');

    // Extract description from preface and main content
    const prefaceHtml = $('.detail-content__preface').html();
    const mainContentHtml = $('#js-part').html() ?? $('.part').html();

    const descriptionParts: string[] = [];
    if (prefaceHtml) {
        descriptionParts.push(prefaceHtml);
    }
    if (mainContentHtml) {
        if (descriptionParts.length > 0) {
            descriptionParts.push('<br><hr>');
        }
        descriptionParts.push(mainContentHtml);
    }

    const description = descriptionParts.length > 0 ? descriptionParts.join('') : undefined;

    return {
        ...item,
        description: description ?? item.description,
        pubDate: publishedTime ? parseDate(publishedTime) : item.pubDate,
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
const resolveNuxtData = (arr: unknown[], index: number, visited = new Set<number>()): unknown => {
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
    // Try to extract __NUXT_DATA__ from HTML using multiple methods
    let nuxtDataScript: string | undefined;

    // Method 1: Use regex to find the script tag content directly
    // Match script tag with id="__NUXT_DATA__" and capture its content
    const nuxtDataMatch = data.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>\s*(\[[\s\S]*?\])\s*<\/script>/i);
    if (nuxtDataMatch?.[1]) {
        nuxtDataScript = nuxtDataMatch[1].trim();
    }

    // Method 2: Try cheerio if regex failed
    if (!nuxtDataScript) {
        const $ = load(data);
        const scriptEl = $('#__NUXT_DATA__');
        nuxtDataScript = scriptEl.html() ?? scriptEl.text() ?? undefined;
    }

    if (nuxtDataScript) {
        try {
            const nuxtData = JSON.parse(nuxtDataScript) as unknown[];

            // Find the data object which contains articleDetail or briefDetail
            // The structure is: [["ShallowReactive", 1], {data: 2, ...}, ["ShallowReactive", 3], {articleDetail-xxx: 4}, ...]
            for (const item of nuxtData) {
                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    // Check for articleDetail first
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

                    // Check for briefDetail (used by brief pages like /brief/xxx.html)
                    const briefDetailKey = Object.keys(item).find((key) => key.startsWith('briefDetail-'));
                    if (briefDetailKey) {
                        const briefDetailIndex = (item as Record<string, number>)[briefDetailKey];
                        if (typeof briefDetailIndex === 'number') {
                            const briefDetailData = resolveNuxtData(nuxtData, briefDetailIndex) as Record<string, unknown>;
                            const brief = briefDetailData?.brief as Record<string, unknown> | undefined;
                            if (brief) {
                                const publisherList = brief.publisher_list as Array<{ username?: string }> | undefined;
                                const briefColumn = briefDetailData?.brief_column as Record<string, unknown> | undefined;
                                const clubInfo = briefDetailData?.club_info as Record<string, unknown> | undefined;

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
                        }
                    }
                }
            }
        } catch {
            // Failed to parse Nuxt data
        }
    }

    // Try window.__INITIAL_STATE__ format (for briefs - legacy)
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
 * Resolves item identifiers (guid and link) based on item type.
 *
 * @param {Object} item - The item to resolve identifiers for.
 * @returns {Object|null} - Object with guid and link, or null if invalid item.
 */
const resolveItemIdentifiers = (item): { guid: string; link: string } | null => {
    if (item.object_type === 8) {
        return {
            guid: `huxiu-moment-${item.object_id}`,
            link: item.url || new URL(`moment/${item.object_id}.html`, rootUrl).href,
        };
    }

    if (item.brief_id || /huxiu\.com\/brief\//.test(item.url)) {
        const briefId = item.brief_id ?? item.aid;
        return {
            guid: `huxiu-brief-${briefId}`,
            link: new URL(`brief/${briefId}.html`, rootUrl).href,
        };
    }

    if (item.aid) {
        return {
            guid: `huxiu-article-${item.aid}`,
            link: new URL(`article/${item.aid}.html`, rootUrl).href,
        };
    }

    return null;
};

/**
 * Extracts count information from item.
 *
 * @param {Object} item - The item to extract counts from.
 * @returns {Object} - Object with upvotes, downvotes, and comments.
 */
const extractCounts = (item) => ({
    upvotes: Number.parseInt(item.count_info?.agree ?? item.count_info?.favtimes ?? item.agree_num ?? 0, 10),
    downvotes: Number.parseInt(item.count_info?.disagree ?? 0, 10),
    comments: Number.parseInt(item.count_info?.total_comment_num ?? item.count_info?.commentnum ?? item.total_comment_num ?? item.commentnum ?? 0, 10),
});

/**
 * Extracts author from item using various possible fields.
 *
 * @param {Object} item - The item to extract author from.
 * @returns {string|undefined} - The author name or undefined.
 */
const extractAuthor = (item) => item.user_info?.username ?? item.brief_column?.name ?? item.author_info?.username ?? item.author;

/**
 * Extracts image source from item.
 *
 * @param {Object} item - The item to extract image from.
 * @returns {string|undefined} - The image URL or undefined.
 */
const extractImageSrc = (item) => item.origin_pic_path ?? item.pic_path ?? item.big_pic_path?.split(/\?/)[0];

/**
 * Maps a single item to a processed item object.
 *
 * @param {Object} item - The raw item to process.
 * @returns {Object|string} - The processed item or empty string if invalid.
 */
const mapItem = (item) => {
    const identifiers = resolveItemIdentifiers(item);
    if (!identifiers) {
        return '';
    }

    const { processed: audio, processedItem: audioItem = {} } = processAudioInfo(item.audio_info);

    if (Object.keys(audioItem).length !== 0) {
        audioItem.itunes_item_image = item.pic_path ?? item.share_info?.share_img ?? undefined;
    }

    const { processed: video, processedItem: videoItem = {} } = processVideoInfo(item.video_info);
    const counts = extractCounts(item);
    const timestamp = item.publish_time ?? item.dateline;

    return {
        ...audioItem,
        ...videoItem,
        title: (item.title ?? item.summary ?? item.content)?.replaceAll(/<\/?(?:em|br)?>/g, ''),
        link: identifiers.link,
        description: renderDescription({
            image: { src: extractImageSrc(item) },
            audio,
            video,
            summary: item.summary ?? item.content ?? item.preface,
        }),
        author: extractAuthor(item),
        guid: identifiers.guid,
        pubDate: timestamp ? parseDate(timestamp, 'X') : undefined,
        ...counts,
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
    const processedItems = items
        .map((item) => mapItem(item))
        .filter(Boolean)
        .slice(0, limit);

    const internalItems = processedItems.filter((item) => {
        const isExternalLink = !new RegExp(domain, 'i').test(new URL(item.link).hostname);
        const isMoment = item.guid.startsWith('huxiu-moment');
        return !isExternalLink && !isMoment;
    });

    const detailResponses = await fetchDetailPagesInBrowser(internalItems.map((item) => item.link));

    return await Promise.all(
        processedItems.map((item) =>
            tryGet(item.guid, () => {
                const isExternalLink = !new RegExp(domain, 'i').test(new URL(item.link).hostname);
                const isMoment = item.guid.startsWith('huxiu-moment');

                if (isExternalLink || isMoment) {
                    return Promise.resolve(item);
                }

                const detailResponse = detailResponses.get(item.link);

                if (!detailResponse) {
                    return Promise.resolve(item);
                }

                return Promise.resolve(fetchItem(item, detailResponse));
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

export { apiArticleRootUrl, apiClubRootUrl, apiMemberRootUrl, apiMomentRootUrl, apiSearchRootUrl, fetchClubData, fetchData, generateSignature, processItems, rootUrl };

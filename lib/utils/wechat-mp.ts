/**
 * Author: @Rongronggg9
 *
 * There are at least three folders which are relevant with WeChat MP (Official Account Platform / Media Platform):
 * lib/routes/wechat
 * lib/routes/gov/npma
 * lib/routes/gzh360
 * lib/routes/pku/nsd/gd
 * lib/routes/sdu/cs
 * lib/routes/nua/utils
 * lib/routes/hrbeu
 * lib/routes/freewechat
 *
 * If your new route is not in the above folders, please add it to the list.
 *
 * If your route needs to fetch MP articles from mp.weixin.qq.com, you SHOULD use `finishArticleItem`.
 * However, if your route need to determine some metadata by itself, you MAY use `fetchArticle`.
 * If you find more metadata on the webpage, consider modifying `fetchArticle` to include them.
 * NEVER fetch MP articles from mp.weixin.qq.com in your route in order to avoid cache key collision.
 * NO NEED TO use cache if you are using `finishArticleItem` or `fetchArticle`, they will handle cache for you.
 *
 * If your route fetches MP articles from other websites, you SHOULD use `fixArticleContent` to fix the content format.
 * If you find more fixes that should be applied, consider modifying `fixArticleContent` to include them.
 *
 * For more details of these functions, please refer to the jsDoc in the source code.
 */

import ofetch from '@/utils/ofetch';
import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { parseDate } from '@/utils/parse-date';
import cache from '@/utils/cache';
import logger from '@/utils/logger';

class WeChatMpError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'WeChatMpError';
    }
}

const MAINTAINERS = ['@Rongronggg9'];

const formatLogNoMention = (...params: string[]): string => `wechat-mp: ${params.join(': ')}`;
const formatLog = (...params: string[]): string => `${formatLogNoMention(...params)}
Consider raise an issue (mentioning ${MAINTAINERS.join(', ')}) with the article URL for further investigation`;
let warn = (...params: string[]) => logger.warn(formatLog(...params));
const error = (...params: string[]): never => {
    const msg = formatLog(...params);
    logger.error(msg);
    throw new WeChatMpError(msg);
};
const errorNoMention = (...params: string[]): never => {
    const msg = formatLogNoMention(...params);
    logger.error(msg);
    throw new WeChatMpError(msg);
};
const toggleWerror = (() => {
    const onFunc = (...params: string[]) => error('WarningAsError', ...params);
    const offFunc = warn;
    return (on: boolean) => {
        warn = on ? onFunc : offFunc;
    };
})();

const replaceReturnNewline = (() => {
    const returnRegExp = /\r|\\(r|x0d)/g;
    const newlineRegExp = /\n|\\(n|x0a)/g;
    return (text: string, replaceReturnWith = '', replaceNewlineWith = '<br>') => text.replaceAll(returnRegExp, replaceReturnWith).replaceAll(newlineRegExp, replaceNewlineWith);
})();
const fixUrl = (() => {
    const ampRegExp = /(&|\\x26)amp;/g;
    return (text: string) => text.replaceAll(ampRegExp, '&');
})();

class LoopContinue extends Error {
    constructor() {
        super('');
        this.name = 'LoopContinue';
    }
}

class LoopReturn extends Error {
    to_return: any;

    constructor(to_return: any) {
        super('');
        this.name = 'LoopReturn';
        this.to_return = to_return;
    }
}

const forEachScript = ($: CheerioAPI | string, callback: (script) => void, defaultReturn: any = null, selector = 'script[nonce][type="text/javascript"]') => {
    const scripts = typeof $ === 'string' ? [$] : $(selector).toArray();
    for (const script of scripts) {
        try {
            callback(script);
        } catch (error) {
            if (error instanceof LoopReturn) {
                return error.to_return;
            } else if (error instanceof LoopContinue) {
                continue;
            }
            throw error;
        }
    }
    return defaultReturn;
};

// view-source a *_SHARE_PAGE type article and search for `ITEM_SHOW_TYPE_MAP`
// Please update the comments below if you find new types or new examples
const showTypeMap = {
    // "Article".
    // May be combined with media, but type won't change
    // Combined with audio and iframe: https://mp.weixin.qq.com/s/FnjcMXZ1xdS-d6n-pUUyyw
    APP_MSG_PAGE: '0',
    // https://mp.weixin.qq.com/s?__biz=Mzg4NTA1MTkwNA==&mid=2247532942&idx=1&sn=a84e4adbe49fdb39e4d4c1b5c12a4c3f
    VIDEO_SHARE_PAGE: '5',
    MUSIC_SHARE_PAGE: '6',
    // https://mp.weixin.qq.com/s/FY6yQC_e4NMAxK0FBr6jwQ
    AUDIO_SHARE_PAGE: '7',
    // https://mp.weixin.qq.com/s/4p5YmYuASiQSYFiy7KqydQ
    // https://mp.weixin.qq.com/s?__biz=Mzg4NTA1MTkwNA==&mid=2247532936&idx=4&sn=624054c20ded6ee85c6632f419c6f758
    IMG_SHARE_PAGE: '8',
    TEXT_SHARE_PAGE: '10',
    SHORT_CONTENT_PAGE: '17',
};
const showTypeMapReverse = Object.fromEntries(Object.entries(showTypeMap).map(([k, v]) => [v, k]));

class ExtractMetadata {
    private static genAssignmentRegExp = (varName: string, valuePattern: string, assignPattern: string) => new RegExp(`\\b${varName}\\s*${assignPattern}\\s*(?<quote>["'])(?<value>${valuePattern})\\k<quote>`, 'mg');

    private static genExtractFunc = (
        varName: string,
        {
            valuePattern = String.raw`\w+`,
            assignPattern = '=',
            allowNotFound = false,
            multiple = false,
        }: {
            valuePattern?: string;
            assignPattern?: string;
            allowNotFound?: boolean;
            multiple?: boolean;
        }
    ) => {
        const regExp = this.genAssignmentRegExp(varName, valuePattern, assignPattern);
        return (str: string) => {
            const values: string[] = [];
            for (const match of str.matchAll(regExp)) {
                const value = <string>match.groups?.value;
                if (!multiple) {
                    return value;
                }
                values.push(value);
            }
            if (!allowNotFound && values.length === 0) {
                throw new LoopContinue();
            }
            return multiple ? values : null;
        };
    };

    private static doExtract = (metadataToBeExtracted: Record<string, (str: string) => string | string[] | null | undefined>, scriptText: string) => {
        const metadataExtracted: Record<string, string | string[]> = {};
        for (const [key, extractFunc] of Object.entries(metadataToBeExtracted)) {
            metadataExtracted[key] = <string>extractFunc(scriptText);
        }
        metadataExtracted._extractedFrom = scriptText;
        return metadataExtracted;
    };

    private static commonMetadataToBeExtracted = {
        showType: this.genExtractFunc('item_show_type', { valuePattern: String.raw`\d+` }),
        realShowType: this.genExtractFunc('real_item_show_type', { valuePattern: String.raw`\d+` }),
        createTime: this.genExtractFunc('ct', { valuePattern: String.raw`\d+`, allowNotFound: true }),
        sourceUrl: this.genExtractFunc('msg_source_url', { valuePattern: `https?://[^'"]*`, allowNotFound: true }),
    };

    static common = ($: CheerioAPI) =>
        forEachScript(
            $,
            (script) => {
                const scriptText = $(script).text();
                const metadataExtracted = <Record<string, string>> this.doExtract(this.commonMetadataToBeExtracted, scriptText);
                const showType = showTypeMapReverse[metadataExtracted.showType];
                const realShowType = showTypeMapReverse[metadataExtracted.realShowType];
                metadataExtracted.sourceUrl = metadataExtracted.sourceUrl && fixUrl(metadataExtracted.sourceUrl);
                if (showType) {
                    metadataExtracted.showType = showType;
                } else {
                    warn('showType not found', `item_show_type=${metadataExtracted.showType}`);
                }
                if (realShowType) {
                    metadataExtracted.realShowType = realShowType;
                } else {
                    warn('realShowType not found', `real_item_show_type=${metadataExtracted.realShowType}`);
                }
                if (metadataExtracted.showType !== metadataExtracted.realShowType) {
                    // never seen this happen, waiting for examples
                    warn('showType mismatch', `item_show_type=${metadataExtracted.showType}, real_item_show_type=${metadataExtracted.realShowType}`);
                }
                throw new LoopReturn(metadataExtracted);
            },
            {},
            'script[nonce][type="text/javascript"]:contains("real_item_show_type")'
        );

    private static audioMetadataToBeExtracted = {
        voiceId: this.genExtractFunc('voiceid', { assignPattern: ':' }),
        duration: this.genExtractFunc('duration', { valuePattern: String.raw`\d*`, assignPattern: ':', allowNotFound: true }),
    };

    // never seen a audio article containing multiple audio, waiting for examples
    static audio = ($: CheerioAPI) =>
        forEachScript(
            $,
            (script) => {
                const scriptText = $(script).text();
                const metadataExtracted = <Record<string, string>> this.doExtract(this.audioMetadataToBeExtracted, scriptText);
                throw new LoopReturn(metadataExtracted);
            },
            {},
            'script[nonce][type="text/javascript"]:contains("voiceid")'
        );

    private static imgMetadataToBeExtracted = {
        imgUrls: this.genExtractFunc('cdn_url', { valuePattern: `https?://[^'"]*`, assignPattern: ':', multiple: true }),
    };

    static img = ($: CheerioAPI) =>
        forEachScript(
            $,
            (script) => {
                const scriptText = $(script).text();
                const metadataExtracted = <Record<string, string[]>> this.doExtract(this.imgMetadataToBeExtracted, scriptText);
                if (Array.isArray(metadataExtracted.imgUrls)) {
                    metadataExtracted.imgUrls = metadataExtracted.imgUrls.map((url) => fixUrl(url));
                }
                throw new LoopReturn(metadataExtracted);
            },
            {},
            'script[nonce][type="text/javascript"]:contains("picture_page_info_list")'
        );

    private static locationMetadataToBeExtracted = {
        countryName: this.genExtractFunc('countryName', { valuePattern: `[^'"]*`, assignPattern: ':' }),
        provinceName: this.genExtractFunc('provinceName', { valuePattern: `[^'"]*`, assignPattern: ':' }),
        cityName: this.genExtractFunc('cityName', { valuePattern: `[^'"]*`, assignPattern: ':' }),
    };

    static location = ($: CheerioAPI) =>
        forEachScript(
            $,
            (script) => {
                const scriptText = $(script).text();
                const metadataExtracted = this.doExtract(this.locationMetadataToBeExtracted, scriptText);
                throw new LoopReturn(metadataExtracted);
            },
            {},
            'script[nonce][type="text/javascript"]:contains("countryName")'
        );
}

const replaceTag = ($, oldTag, newTagName) => {
    oldTag = $(oldTag);
    const NewTag = $($(`<${newTagName} />`));
    const oldTagAttr = oldTag.attr();
    for (const key in oldTagAttr) {
        NewTag.attr(key, oldTagAttr[key]);
    }
    NewTag.append(oldTag.contents());
    oldTag.replaceWith(NewTag);
};

const detectOriginalArticleUrl = ($) => {
    // No article content get, try the original url
    // example: https://mp.weixin.qq.com/s/f6sKObaZZhADTYU2Jl5Bnw
    if (!$('#js_content').text()) {
        return $('#js_share_source').attr('data-url');
    }
    // Article content is too short, try the first link
    // example: https://mp.weixin.qq.com/s/9saVB4KaolRyJfpajzeFRg
    if ($('#js_content').text().length < 80) {
        return $('#js_content a').attr('href');
    }
    return null;
};

const genAudioSrc = (voiceId: string) => `https://res.wx.qq.com/voice/getvoice?mediaid=${voiceId}`;
const genAudioTag = (src: string, title: string) => `<audio controls src="${src}" title="${title}" style="width:100%"/>`;
const genVideoSrc = (videoId: string) => {
    const newSearchParams = new URLSearchParams({
        origin: 'https://mp.weixin.qq.com',
        containerId: 'js_tx_video_container_0.3863487104715233',
        vid: videoId,
        width: '677',
        height: '380.8125',
        autoplay: 'false',
        allowFullScreen: 'true',
        chid: '17',
        full: 'true',
        show1080p: 'false',
        isDebugIframe: 'false',
    });
    return `https://v.qq.com/txp/iframe/player.html?${newSearchParams.toString()}`;
};

/**
 * Articles from WeChat MP have weird formats, this function is used to fix them.
 *
 * Even though your content are not directly fetched from WeChat MP, you SHOULD still call this function.
 * Calling this function is safe in most situations.
 *
 * Example usage: item.description = fixArticleContent($('div#js_content.rich_media_content'));
 * @param {*} html - The html to be fixed, a string or a cheerio object.
 * @param {boolean} skipImg - Whether to skip fixing images.
 * @return {string} - The fixed html, a string.
 */
const fixArticleContent = (html?: string | Cheerio<Element>, skipImg = false) => {
    let htmlResult = '';
    if (typeof html === 'string') {
        htmlResult = html;
    } else if (html?.html) {
        htmlResult = html.html() || '';
    }
    if (!htmlResult) {
        return '';
    }
    const $ = load(htmlResult, undefined, false);
    if (!skipImg) {
        // fix img lazy loading
        $('img[data-src]').each((_, img) => {
            const $img = $(img);
            const realSrc = $img.attr('data-src');
            if (realSrc) {
                $img.attr('src', realSrc);
                $img.removeAttr('data-src');
            }
        });
    }
    // fix audio: https://mp.weixin.qq.com/s/FnjcMXZ1xdS-d6n-pUUyyw
    $('mpvoice[voice_encode_fileid]').each((_, voice) => {
        const $voice = $(voice);
        const voiceId = $voice.attr('voice_encode_fileid');
        if (voiceId) {
            const title = $voice.attr('name') || 'Audio';
            $voice.replaceWith(genAudioTag(genAudioSrc(voiceId), title));
        }
    });
    // fix iframe: https://mp.weixin.qq.com/s/FnjcMXZ1xdS-d6n-pUUyyw
    $('iframe.video_iframe[data-src]').each((_, iframe) => {
        const $iframe = $(iframe);
        const dataSrc = <string>$iframe.attr('data-src');
        const srcUrlObj = new URL(dataSrc);
        if (srcUrlObj.host === 'v.qq.com' && srcUrlObj.searchParams.has('vid')) {
            const newSrc = genVideoSrc(<string>srcUrlObj.searchParams.get('vid'));
            $iframe.attr('src', newSrc);
            $iframe.removeAttr('data-src');
            const width = $iframe.attr('data-w');
            const ratio = $iframe.attr('data-ratio');
            if (width && ratio) {
                const width_ = Math.min(Number.parseInt(width), 677);
                $iframe.attr('width', width_.toString());
                $iframe.attr('height', (width_ / Number.parseFloat(ratio)).toString());
            }
        } // else {} FIXME: https://mp.weixin.qq.com/s?__biz=Mzg5Mjk3MzE4OQ==&mid=2247549515&idx=2&sn=a608fca597f0589c1aebd6d0b82ff6e9
    });
    // fix section
    $('section').each((_, section) => {
        const $section = $(section);
        const p_count = $section.find('p').length;
        const div_count = $section.find('div').length;
        const section_count = $section.find('section').length;
        if (p_count + div_count + section_count === 0) {
            // make it a p
            replaceTag($, section, 'p');
        } else {
            // make it a div
            replaceTag($, section, 'div');
        }
    });

    // add breaks in code section
    $('code').each((_, code) => {
        $('<br>').insertAfter(code);
    });

    // clear line index tags in code section
    $('.code-snippet__line-index').remove();

    // clean scripts
    $('script').remove();
    return $.html();
};

// Ref:
// https://soaked.in/2020/08/wechat-platform-url/
// Known params (permanent long link):
// __biz (essential), mid (essential), idx (essential), sn (essential), chksm, mpshare, scene, ascene, subscene, srcid,
// lang, sharer_sharetime, sharer_shareid, version, exportkey, pass_ticket, clicktime, enterid, devicetype, nettype,
// abtest_cookie, wx_header
// Known params (temporary link):
// src, timestamp, ver, signature, new (unessential)
const normalizeUrl = (url: string, bypassHostCheck = false) => {
    const oriUrl = url;
    // already seen some weird urls with `&` escaped as `&amp;`, so fix it
    // calling fixUrl should always be safe since having `&amp;` or `\x26` in a URL is meaningless
    url = fixUrl(url);
    const urlObj = new URL(url);
    if (!bypassHostCheck && urlObj.host !== 'mp.weixin.qq.com') {
        error('URL host must be "mp.weixin.qq.com"', url);
    }
    urlObj.protocol = 'https:';
    urlObj.hash = ''; // remove hash
    if (urlObj.pathname.startsWith('/s/')) {
        // a short link, just remove all the params
        urlObj.search = '';
    } else if (urlObj.pathname === '/s') {
        const biz = urlObj.searchParams.get('__biz');
        const mid = urlObj.searchParams.get('mid') || urlObj.searchParams.get('appmsgid');
        const idx = urlObj.searchParams.get('idx') || urlObj.searchParams.get('itemidx');
        const sn = urlObj.searchParams.get('sn') || urlObj.searchParams.get('sign');
        if (biz && mid && idx && sn) {
            // a permanent long link, remove all unessential params
            // no need to escape anything so no need to use `new URLSearchParams({...}).toString()`
            urlObj.search = `?__biz=${biz}&mid=${mid}&idx=${idx}&sn=${sn}`;
        } else {
            const src = urlObj.searchParams.get('src');
            const timestamp = urlObj.searchParams.get('timestamp');
            const ver = urlObj.searchParams.get('ver');
            const signature = urlObj.searchParams.get('signature');
            if (src && timestamp && ver && signature) {
                // a temporary link, remove all unessential params
                urlObj.search = `?src=${src}&timestamp=${timestamp}&ver=${ver}&signature=${signature}`;
            } else {
                warn('unknown URL search parameters', oriUrl);
            }
        }
    } else {
        warn('unknown URL path', oriUrl);
    }
    return urlObj.href;
};

class PageParsers {
    private static common = ($: CheerioAPI, commonMetadata: Record<string, string>) => {
        const title = replaceReturnNewline($('meta[property="og:title"]').attr('content') || '', '', ' ');
        const author = replaceReturnNewline($('meta[name=author]').attr('content') || '', '', ' ');
        const pubDate = commonMetadata.createTime ? parseDate(Number.parseInt(commonMetadata.createTime) * 1000) : undefined;
        const mpName = $('.wx_follow_nickname').first().text()?.trim();

        let summary = replaceReturnNewline($('meta[name=description]').attr('content') || '');
        const description = summary;
        summary = summary.replaceAll('<br>', ' ') === title ? '' : summary;

        return { title, author, description, summary, pubDate, mpName } as {
            title: string;
            author: string;
            description: string;
            summary: string;
            pubDate?: Date;
            mpName?: string;
            enclosure_url?: string;
            itunes_duration?: string | number;
            enclosure_type?: string;
        };
    };
    private static appMsg = async ($: CheerioAPI, commonMetadata: Record<string, string>) => {
        const page = PageParsers.common($, commonMetadata);
        page.description = fixArticleContent($('#js_content'));
        const originalArticleUrl = detectOriginalArticleUrl($);
        if (originalArticleUrl) {
            // No article or article is too short, try to fetch the description from the original article
            const data = await ofetch(normalizeUrl(originalArticleUrl));
            const original$ = load(data);
            page.description += fixArticleContent(original$('#js_content'));
        }
        return page;
    };
    private static img = ($: CheerioAPI, commonMetadata: Record<string, string>) => {
        const page = PageParsers.common($, commonMetadata);
        const imgUrls = ExtractMetadata.img($)?.imgUrls;
        let imgHtml = '';
        if (Array.isArray(imgUrls) && imgUrls.length > 0) {
            for (const imgUrl of imgUrls) {
                imgHtml += `<br><br><img src="${imgUrl}" />`;
            }
        }
        page.description += imgHtml;
        return page;
    };
    private static audio = ($: CheerioAPI, commonMetadata: Record<string, string>) => {
        const page = PageParsers.common($, commonMetadata);
        const audioMetadata = ExtractMetadata.audio($);
        const audioUrl = genAudioSrc(audioMetadata.voiceId);
        page.enclosure_url = audioUrl;
        page.itunes_duration = audioMetadata.duration;
        page.enclosure_type = 'audio/mp3'; // FIXME: may it be other types?
        page.description += '<br><br>' + genAudioTag(audioUrl, page.title);
        return page;
    };
    private static fallback = ($: CheerioAPI, commonMetadata: Record<string, string>) => {
        const page = PageParsers.common($, commonMetadata);
        const image = $('meta[property="og:image"]').attr('content');
        if (image) {
            page.description += `<br><br><img src="${image}" />`;
        }
        return page;
    };
    static dispatch = async (html: string, url: string) => {
        const $ = load(html);
        const commonMetadata = ExtractMetadata.common($);
        let page: Record<string, any>;
        let pageText: string, pageTextShort: string;
        switch (commonMetadata.showType) {
            case 'APP_MSG_PAGE':
                page = await PageParsers.appMsg($, commonMetadata);
                break;
            case 'AUDIO_SHARE_PAGE':
                page = PageParsers.audio($, commonMetadata);
                break;
            case 'IMG_SHARE_PAGE':
                page = PageParsers.img($, commonMetadata);
                break;
            case 'VIDEO_SHARE_PAGE':
                page = PageParsers.fallback($, commonMetadata);
                break;
            case undefined:
                $('script, style').remove();
                pageText = $('title, body').text().replaceAll(/\s+/g, ' ').trim();
                pageTextShort = pageText.slice(0, 25);
                if (pageText.length >= 25 + '...'.length) {
                    pageTextShort = pageText.slice(0, 25);
                    pageTextShort += '...';
                }
                if (pageText.includes('已被发布者删除')) {
                    errorNoMention('deleted by author', pageTextShort, url);
                } else if (new URL(url).pathname.includes('captcha') || pageText.includes('环境异常')) {
                    errorNoMention('request blocked by WAF', pageTextShort, url);
                } else {
                    error('unknown page, probably due to WAF', pageTextShort, url);
                }
                return {}; // just to make TypeScript happy, actually UNREACHABLE
            default:
                warn('new showType, trying fallback method', `showType=${commonMetadata.showType}`, url);
                page = PageParsers.fallback($, commonMetadata);
        }
        const locationMetadata = ExtractMetadata.location($);
        let location = '';
        for (const loc of [locationMetadata.countryName, locationMetadata.provinceName, locationMetadata.cityName]) {
            if (loc) {
                location += loc + ' ';
            }
        }
        location = location.trim();
        if (location) {
            page.description += `<p>📍发表于：${location}</p>`;
        }
        if (commonMetadata.sourceUrl) {
            page.description += `<p><a href="${commonMetadata.sourceUrl}">🔗️ 阅读原文</a></p>`;
        }
        return page;
    };
}

const redirectHelper = async (url: string, maxRedirects: number = 5) => {
    maxRedirects--;
    const raw = await ofetch.raw(url);
    if ([301, 302, 303, 307, 308].includes(raw.status)) {
        if (!raw.headers.has('location')) {
            error('redirect without location', url);
        } else if (maxRedirects <= 0) {
            error('too many redirects', url);
        }
        return await redirectHelper(<string>raw.headers.get('location'), maxRedirects);
    }
    return raw;
};

/**
 * Fetch article and its metadata from WeChat MP (mp.weixin.qq.com).
 *
 * If you use this function, no need to call `fixArticleContent`
 * @param url - The url of the article.
 * @param bypassHostCheck - Whether to bypass host check.
 * @return - An object containing the article and its metadata.
 */
const fetchArticle = (url: string, bypassHostCheck: boolean = false) => {
    url = normalizeUrl(url, bypassHostCheck);
    return cache.tryGet(url, async () => {
        const raw = await redirectHelper(url);
        // pass the redirected URL to dispatcher for better error logging
        const page = await PageParsers.dispatch(raw._data, raw.url);
        return { ...page, link: url };
    }) as Promise<{
        title: string;
        author: string;
        description: string;
        summary: string;
        pubDate?: Date;
        mpName?: string;
        link: string;
        enclosure_type?: string;
        enclosure_url?: string;
        itunes_duration?: string | number;
    }>;
};

/**
 * Fetch article and its metadata from WeChat MP (mp.weixin.qq.com), then fill the `item` object with the result.
 *
 * If you use this function, no need to call `fetchArticle` or `fixArticleContent`
 *
 * A new route SHOULD use this function instead of manually calling the above functions
 *
 * An existing route adopting this function SHOULD either:
 * - set `skipLink` to true (not recommended)
 * - set `item.guid` to `item.link` BEFORE calling this function
 * @param {object} ctx - The context object.
 * @param {object} item - The item object to be filled.
 * @param {boolean} setMpNameAsAuthor - If `true`, `author` will be the MP itself, otherwise the real author of the article.
 * @param {boolean} skipLink - Whether to skip overriding `item.link` with the normalized url.
 * @return {Promise<object>} - The incoming `item` object, with the article and its metadata filled in.
 */
const finishArticleItem = async (item, setMpNameAsAuthor = false, skipLink = false) => {
    if (item.link) {
        const fetchedItem = await fetchArticle(item.link);
        for (const key in fetchedItem) {
            switch (key) {
                case 'author':
                    item.author = setMpNameAsAuthor
                        ? fetchedItem.mpName || item.author // the Official Account itself. if your route return articles from different accounts, you may want to use this
                        : fetchedItem.author || item.author; // the real author of the article. if your route return articles from a certain account, use this
                    break;
                case 'link':
                    item.link = skipLink ? item.link : fetchedItem.link || item.link;
                    break;
                default:
                    item[key] = item[key] || fetchedItem[key];
            }
        }
    }
    return item;
};

const exportedForTestingOnly = { toggleWerror, ExtractMetadata, showTypeMapReverse };
export { exportedForTestingOnly, WeChatMpError, fixArticleContent, fetchArticle, finishArticleItem, normalizeUrl };

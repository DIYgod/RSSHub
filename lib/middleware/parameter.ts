import { createHash } from 'node:crypto';

import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import { decodeHTMLStrict } from 'entities';
import type { MiddlewareHandler } from 'hono';
import { convert } from 'html-to-text';
import { RE2JS } from 're2js';
import sanitizeHtml from 'sanitize-html';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem } from '@/types';
import { extractAttachments, getImageMimeType } from '@/utils/attachments';
import cache from '@/utils/cache';
import type { LinkResolver } from '@/utils/link-resolver';
import { createLinkResolver } from '@/utils/link-resolver';
import markdownit from '@/utils/markdown-it';
import { parse as parseFulltext } from '@/utils/mercury';
import ofetch from '@/utils/ofetch';

// filters run synchronously, and matching with re2 costs up to program size * text length
const MAX_FILTER_LENGTH = 1024;
const MAX_FILTER_PROGRAM_SIZE = 2048;
const MAX_FILTER_STEPS = 2 ** 24; // program size * text length of a single match
const MAX_FILTER_TIME = 1000; // milliseconds spent on all filters of a request

const md = markdownit({
    html: true,
});

const removeImages = ($: CheerioAPI) => {
    $('img, picture').remove();
    $('video[poster]').removeAttr('poster');
};

const resolveRelativeLink = ($: CheerioAPI, elem: Element, attr: string, resolveLink: LinkResolver, baseUrl?: string) => {
    const $elem = $(elem);

    if (baseUrl) {
        try {
            const oldAttr = $elem.attr(attr);
            if (oldAttr) {
                // e.g. <video><source src="https://example.com"></video> should leave <video> unchanged
                $elem.attr(attr, resolveLink(oldAttr, baseUrl));
            }
        } catch {
            // no-empty
        }
    }
};

const getAiCompletion = async (prompt: string, text: string) => {
    const apiUrl = `${config.openai.endpoint}/chat/completions`;
    const response = await ofetch(apiUrl, {
        method: 'POST',
        body: {
            model: config.openai.model,
            max_tokens: config.openai.maxTokens,
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: text },
            ],
            temperature: config.openai.temperature,
        },
        headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
        },
    });

    return response.choices[0].message.content;
};

// the content cache is shared by every route and client, so key the completion on what it is
// generated from (prompt + text) rather than on item.link, which any feed can reuse with other text
const getAiCacheKey = (type: 'title' | 'description', prompt: string, text: string) => `openai:${type}:${createHash('sha256').update(prompt).update('\0').update(text).digest('hex')}`;

// the same limit Mercury applies to the pages it fetches itself
const FULLTEXT_MAX_LENGTH = 5 * 1024 * 1024;

// bound the download time and decoded size of the page
const getFulltextHtml = async (link: string) => {
    const signal = AbortSignal.timeout(config.requestTimeout);
    const { body, headers } = await ofetch.raw(link, { responseType: 'stream', signal, publicOnly: true });
    const contentType = headers.get('content-type');
    if (contentType && !/html|text|xml/i.test(contentType)) {
        await body?.cancel();
        throw new Error(`Content of ${link} does not appear to be text`);
    }
    const chunks = body!.pipeThrough(new TextDecoderStream(), { signal });
    let html = '';
    for await (const chunk of chunks) {
        html += chunk;
        if (html.length > FULLTEXT_MAX_LENGTH) {
            throw new Error(`Content of ${link} is too large`);
        }
    }
    return html;
};

const getAuthorString = (item: DataItem) => {
    let author = '';
    if (item.author) {
        author = Array.isArray(item.author) ? item.author.map((i) => i.name).join(' ') : item.author;
    }
    return author;
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    await next();

    const data: Data = ctx.get('data');
    if (data) {
        if ((!data.item || data.item.length === 0) && !data.allowEmpty) {
            throw new Error('this route is empty, please check the original site or <a href="https://github.com/DIYgod/RSSHub/issues/new/choose">create an issue</a>');
        }

        // fix allowEmpty
        data.item ||= [];

        // decode HTML entities
        // oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- routes may return non-string values at runtime
        data.title &&= decodeHTMLStrict(data.title + '');
        // oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- routes may return non-string values at runtime
        data.description &&= decodeHTMLStrict(data.description + '');

        // sort items
        const sorted = ctx.req.query('sorted');
        if (sorted === undefined ? data.sortItems !== false : sorted !== 'false') {
            data.item = data.item.toSorted((a: DataItem, b: DataItem) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));
        }

        const hideImages = ctx.req.query('show_image') === 'false';
        const extractEnclosures = ctx.req.query('enclosure') === 'true';
        if (hideImages) {
            delete data.image;
        }

        // one budget for every link this feed resolves, see @/utils/link-resolver
        const resolveLink = createLinkResolver();

        const handleItem = (item: DataItem) => {
            // A fixed message, so a stray cached value returned as an item never ends up on the error page
            if (typeof item !== 'object' || item === null) {
                throw new TypeError('Feed items must be objects');
            }
            // oxlint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- routes may return non-string values at runtime
            item.title &&= decodeHTMLStrict(item.title + '');
            item.description ||= item.content?.html;

            // handle pubDate
            if (item.pubDate) {
                const date = new Date(item.pubDate);
                item.pubDate = Number.isNaN(date.getTime()) ? undefined : date.toUTCString();
            }

            // handle link
            if (item.link) {
                let baseUrl = data.link;
                if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
                    baseUrl = baseUrl.startsWith('//') ? 'http:' + baseUrl : 'http://' + baseUrl;
                }

                item.link = resolveLink(item.link, baseUrl);
            }

            // handle description
            if (item.description) {
                const $ = load(item.description);
                let baseUrl = item.link || data.link;

                if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
                    baseUrl = baseUrl.startsWith('//') ? 'http:' + baseUrl : 'http://' + baseUrl;
                }

                $('script').remove();
                if (hideImages) {
                    removeImages($);
                }

                $('img').each((_, ele) => {
                    const $ele = $(ele);

                    // fix lazyload
                    if (!$ele.attr('src')) {
                        const lazySrc = $ele.attr('data-src') || $ele.attr('data-original');
                        if (lazySrc) {
                            $ele.attr('src', lazySrc);
                        } else {
                            for (const key in ele.attribs) {
                                const value = ele.attribs[key].trim();
                                if (['.gif', '.png', '.jpg', '.webp'].some((suffix) => value.includes(suffix))) {
                                    $ele.attr('src', value);
                                    break;
                                }
                            }
                        }
                    }

                    // redundant attributes
                    for (const e of ['onclick', 'onerror', 'onload']) {
                        $ele.removeAttr(e);
                    }
                });

                // resolve relative link & fix referrer policy
                // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
                // https://www.w3schools.com/tags/att_href.asp
                $('a, area').each((_, elem) => {
                    resolveRelativeLink($, elem, 'href', resolveLink, baseUrl);
                    // $(elem).attr('rel', 'noreferrer');  // currently no such a need
                });
                // https://www.w3schools.com/tags/att_src.asp
                $('img, video, audio, source, iframe, embed, track').each((_, elem) => {
                    resolveRelativeLink($, elem, 'src', resolveLink, baseUrl);
                });
                $('video[poster]').each((_, elem) => {
                    resolveRelativeLink($, elem, 'poster', resolveLink, baseUrl);
                });
                $('img, iframe').each((_, elem) => {
                    if (!$(elem).attr('referrerpolicy')) {
                        $(elem).attr('referrerpolicy', 'no-referrer');
                    }
                });

                if (extractEnclosures) {
                    item.attachments = extractAttachments($, item, hideImages, resolveLink);
                }

                item.description = $('body').html() + '' + (config.suffix || '');

                if (item._extra?.links && $('.rsshub-quote').length) {
                    item._extra?.links?.map((e) => {
                        e.content_html = $.html($('.rsshub-quote'));
                        return e;
                    });
                }
            }

            // handle category
            if (item.category) {
                // convert single string to array, and filter only string type category
                Array.isArray(item.category) || (item.category = [item.category]);
                item.category = item.category.filter((e: unknown): e is string => typeof e === 'string');
            }

            // handle enclosure and image
            if (hideImages) {
                delete item.image;
                delete item.banner;
                delete item.itunes_item_image;
                if (item.enclosure_type?.startsWith('image/')) {
                    delete item.enclosure_url;
                    delete item.enclosure_type;
                    delete item.enclosure_length;
                }
                if (item.media) {
                    delete item.media.thumbnail;
                    if (item.media.content?.type?.startsWith('image/')) {
                        delete item.media.content;
                    }
                }
                item.attachments = item.attachments?.filter((attachment) => !attachment.mime_type?.startsWith('image/'));
            }
            if (item.image && !item.enclosure_url && !item.attachments?.length) {
                item.enclosure_type = getImageMimeType(item.image);
            }
            return item;
        };

        data.item = await Promise.all(data.item.map((itm) => handleItem(itm)));

        // filter
        const engine = config.feature.filter_regex_engine;
        const compileRegex = (str: string) => {
            if (str.length > MAX_FILTER_LENGTH) {
                throw new InvalidParameterError(`Invalid filter: longer than ${MAX_FILTER_LENGTH} characters.`);
            }
            // default: case_senstivie = true
            const insensitive = ctx.req.query('filter_case_sensitive') === 'false';
            switch (engine) {
                case 'regexp':
                    return new RegExp(str, insensitive ? 'i' : '');
                case 're2': {
                    const regex = RE2JS.compile(str, insensitive ? RE2JS.CASE_INSENSITIVE : 0);
                    // counted repetition is expanded at compile time, e.g. `.{0,1000}` takes 2000 instructions
                    if (regex.programSize() > MAX_FILTER_PROGRAM_SIZE) {
                        throw new InvalidParameterError('Invalid filter: too complex, please simplify it.');
                    }
                    return regex;
                }
                default:
                    throw new Error(`Invalid Engine Value: ${engine}, please check your config.`);
            }
        };
        // compile each filter once per request instead of once per item
        const regexes = new Map<string, ReturnType<typeof compileRegex>>();
        const makeRegex = (str: string) => {
            let regex = regexes.get(str);
            if (!regex) {
                regex = compileRegex(str);
                regexes.set(str, regex);
            }
            return regex;
        };
        const filterStart = Date.now();
        const testRegex = (regex: ReturnType<typeof compileRegex>, str: string) => {
            if (Date.now() - filterStart > MAX_FILTER_TIME) {
                throw new InvalidParameterError('Invalid filter: takes too long on this feed, please simplify it.');
            }
            if (regex instanceof RE2JS) {
                if (regex.programSize() * str.length > MAX_FILTER_STEPS) {
                    throw new InvalidParameterError('Invalid filter: too complex for this feed, please simplify it.');
                }
                return regex.matcher(str).find();
            }
            return regex.test(str);
        };

        if (ctx.req.query('filter')) {
            const regex = makeRegex(ctx.req.query('filter')!);

            data.item = data.item.filter((item) => {
                const title = item.title || '';
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = Array.isArray(item.category) ? item.category : [];
                const isFilter = testRegex(regex, title) || testRegex(regex, description) || testRegex(regex, author) || category.some((c) => testRegex(regex, c));

                return isFilter;
            });
        }

        // 启用filter参数时，无效filter_title/description/author/category
        if (!ctx.req.query('filter') && (ctx.req.query('filter_title') || ctx.req.query('filter_description') || ctx.req.query('filter_author') || ctx.req.query('filter_category'))) {
            data.item = data.item.filter((item) => {
                const title = item.title || '';
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = Array.isArray(item.category) ? item.category : [];
                let isFilter = true;

                if (ctx.req.query('filter_title')) {
                    const titleRegex = makeRegex(ctx.req.query('filter_title')!);
                    isFilter = testRegex(titleRegex, title);
                }
                if (ctx.req.query('filter_description')) {
                    const descriptionRegex = makeRegex(ctx.req.query('filter_description')!);
                    isFilter &&= testRegex(descriptionRegex, description);
                }
                if (ctx.req.query('filter_author')) {
                    const authorRegex = makeRegex(ctx.req.query('filter_author')!);
                    isFilter &&= testRegex(authorRegex, author);
                }
                if (ctx.req.query('filter_category')) {
                    const categoryRegex = makeRegex(ctx.req.query('filter_category')!);
                    isFilter &&= category.some((c) => testRegex(categoryRegex, c));
                }

                return isFilter;
            });
        }

        if (ctx.req.query('filterout') || ctx.req.query('filterout_title') || ctx.req.query('filterout_description') || ctx.req.query('filterout_author') || ctx.req.query('filterout_category')) {
            data.item = data.item.filter((item) => {
                const title = item.title;
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = Array.isArray(item.category) ? item.category : [];
                let isFilter = true;

                if (ctx.req.query('filterout') || ctx.req.query('filterout_title')) {
                    const titleRegex = makeRegex(ctx.req.query('filterout_title') || ctx.req.query('filterout')!);
                    isFilter = !testRegex(titleRegex, title);
                }
                if (ctx.req.query('filterout') || ctx.req.query('filterout_description')) {
                    const descriptionRegex = makeRegex(ctx.req.query('filterout_description') || ctx.req.query('filterout')!);
                    isFilter &&= !testRegex(descriptionRegex, description);
                }
                if (ctx.req.query('filterout_author')) {
                    const authorRegex = makeRegex(ctx.req.query('filterout_author')!);
                    isFilter &&= !testRegex(authorRegex, author);
                }
                if (ctx.req.query('filterout_category')) {
                    const categoryRegex = makeRegex(ctx.req.query('filterout_category')!);
                    isFilter &&= category.every((c) => !testRegex(categoryRegex, c));
                }

                return isFilter;
            });
        }

        if (ctx.req.query('filter_time')) {
            const now = Date.now();
            data.item = data.item.filter(({ pubDate }) => {
                let isFilter = true;
                try {
                    isFilter = !pubDate || now - new Date(pubDate).getTime() <= Number.parseInt(ctx.req.query('filter_time')!) * 1000;
                } catch {
                    // no-empty
                }
                return isFilter;
            });
        }

        // limit
        const limit = Number.parseInt(ctx.req.query('limit') ?? '');
        if (limit >= 0) {
            data.item = data.item.slice(0, limit);
        }

        // telegram instant view
        if (ctx.req.query('tgiv')) {
            data.item.map((item) => {
                if (item.link) {
                    const encodedlink = encodeURIComponent(item.link);
                    item.link = `https://t.me/iv?url=${encodedlink}&rhash=${ctx.req.query('tgiv')}`;
                    return item;
                }
                return item;
            });
        }

        // fulltext
        if (ctx.req.query('mode')?.toLowerCase() === 'fulltext') {
            const tasks = data.item.map(async (item) => {
                const { link, author, description } = item;
                const parsed_result: any = await cache.tryGet(`mercury-cache-${link}`, async () => {
                    if (link) {
                        // if parser failed, return default description and not report error
                        try {
                            // the link comes from upstream content: refuse non-public destinations
                            const html = await getFulltextHtml(link);
                            if (!html) {
                                // mercury would fetch the link again itself when given an empty document
                                return;
                            }
                            return await parseFulltext(link, html);
                        } catch {
                            // no-empty
                        }
                    }
                });

                item.author = author || parsed_result?.author;
                item.description = parsed_result && parsed_result.content.length > 40 ? decodeHTMLStrict(parsed_result.content) : description;
                if ((!hideImages && !extractEnclosures) || !(parsed_result?.content.length > 40) || !item.description) {
                    return;
                }
                const $ = load(item.description);
                if (hideImages) {
                    removeImages($);
                    item.description = $('body').html()!;
                }
                if (extractEnclosures) {
                    item.attachments = extractAttachments($, item, hideImages, resolveLink);
                }
            });
            await Promise.all(tasks);
        }

        // openai
        if (ctx.req.query('chatgpt') && config.openai.apiKey) {
            data.item = await Promise.all(
                data.item.map(async (item) => {
                    try {
                        // handle description
                        if (config.openai.inputOption === 'description' && item.description) {
                            const description = await cache.tryGet(getAiCacheKey('description', config.openai.promptDescription, item.description), async () => {
                                const description = convert(item.description!);
                                const descriptionMd = await getAiCompletion(config.openai.promptDescription, description);
                                return md.render(descriptionMd);
                            });
                            // add it to the description
                            if (description !== '') {
                                item.description = description + '<hr/><br/>' + item.description;
                            }
                        }
                        // handle title
                        else if (config.openai.inputOption === 'title' && item.title) {
                            const title = await cache.tryGet(getAiCacheKey('title', config.openai.promptTitle, item.title), async () => {
                                const title = convert(item.title!);
                                return await getAiCompletion(config.openai.promptTitle, title);
                            });
                            // replace the title
                            if (title !== '') {
                                item.title = title + '';
                            }
                        }
                        // handle both
                        else if (config.openai.inputOption === 'both' && item.title && item.description) {
                            const title = await cache.tryGet(getAiCacheKey('title', config.openai.promptTitle, item.title), async () => {
                                const title = convert(item.title!);
                                return await getAiCompletion(config.openai.promptTitle, title);
                            });
                            // replace the title
                            if (title !== '') {
                                item.title = title + '';
                            }

                            const description = await cache.tryGet(getAiCacheKey('description', config.openai.promptDescription, item.description), async () => {
                                const description = convert(item.description!);
                                const descriptionMd = await getAiCompletion(config.openai.promptDescription, description);
                                return md.render(descriptionMd);
                            });
                            // add it to the description
                            if (description !== '') {
                                item.description = description + '<hr/><br/>' + item.description;
                            }
                        }
                    } catch {
                        // when openai failed, return default content and not write cache
                    }
                    return item;
                })
            );
        }

        // scihub
        if (ctx.req.query('scihub')) {
            data.item.map((item) => {
                item.link = item.doi ? `${config.scihub.host}${item.doi}` : `${config.scihub.host}${item.link}`;
                return item;
            });
        }

        // opencc
        if (ctx.req.query('opencc')) {
            const { simplecc } = await import('simplecc-wasm');
            for (const item of data.item) {
                item.title = simplecc(item.title ?? item.link, ctx.req.query('opencc')!);
                item.description = simplecc(item.description ?? item.title ?? item.link, ctx.req.query('opencc')!);
            }
        }

        // brief
        if (ctx.req.query('brief')) {
            const num = /[1-9]\d{2,}/;
            if (num.test(ctx.req.query('brief')!)) {
                const brief: number = Number.parseInt(ctx.req.query('brief')!);
                for (const item of data.item) {
                    if (!item.description) {
                        continue;
                    }

                    const text = sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} });
                    item.description = text.length > brief ? `<p>${text.slice(0, brief)}…</p>` : `<p>${text}</p>`;
                }
            } else {
                throw new Error('Invalid parameter brief. Please check the doc https://docs.rsshub.app/guide/parameters#shu-chu-jian-xun');
            }
        }
        // some parameters are processed in `anti-hotlink.js`

        ctx.set('data', data);
    } else {
        // throw new Error('wrong path');
    }
};

export default middleware;

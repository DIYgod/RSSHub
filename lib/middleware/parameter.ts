import * as entities from 'entities';
import { load, type CheerioAPI, type Element } from 'cheerio';
import { simplecc } from 'simplecc-wasm';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { RE2JS } from 're2js';
import markdownit from 'markdown-it';
import { convert } from 'html-to-text';
import sanitizeHtml from 'sanitize-html';
import { MiddlewareHandler } from 'hono';
import cache from '@/utils/cache';
import Parser from '@postlight/parser';
import { Data, DataItem } from '@/types';

const md = markdownit({
    html: true,
});

const resolveRelativeLink = ($: CheerioAPI, elem: Element, attr: string, baseUrl?: string) => {
    const $elem = $(elem);

    if (baseUrl) {
        try {
            const oldAttr = $elem.attr(attr);
            if (oldAttr) {
                // e.g. <video><source src="https://example.com"></video> should leave <video> unchanged
                $elem.attr(attr, new URL(oldAttr, baseUrl).href);
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

const getAuthorString = (item) => {
    let author = '';
    if (item.author) {
        author = typeof item.author === 'string' ? item.author : item.author.map((i) => i.name).join(' ');
    }
    return author;
};

const middleware: MiddlewareHandler = async (ctx, next) => {
    await next();

    const data = ctx.get('data') as Data;
    if (data) {
        if ((!data.item || data.item.length === 0) && !data.allowEmpty) {
            throw new Error('this route is empty, please check the original site or <a href="https://github.com/DIYgod/RSSHub/issues/new/choose">create an issue</a>');
        }

        // fix allowEmpty
        data.item = data.item || [];

        // decode HTML entities
        data.title && (data.title = entities.decodeXML(data.title + ''));
        data.description && (data.description = entities.decodeXML(data.description + ''));

        // sort items
        if (ctx.req.query('sorted') !== 'false') {
            data.item = data.item.sort((a: DataItem, b: DataItem) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));
        }

        const handleItem = (item: DataItem) => {
            item.title && (item.title = entities.decodeXML(item.title + ''));

            // handle pubDate
            if (item.pubDate) {
                item.pubDate = new Date(item.pubDate).toUTCString();
            }

            // handle link
            if (item.link) {
                let baseUrl = data.link;
                if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
                    baseUrl = /^\/\//.test(baseUrl) ? 'http:' + baseUrl : 'http://' + baseUrl;
                }

                item.link = new URL(item.link, baseUrl).href;
            }

            // handle description
            if (item.description) {
                const $ = load(item.description);
                let baseUrl = item.link || data.link;

                if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
                    baseUrl = /^\/\//.test(baseUrl) ? 'http:' + baseUrl : 'http://' + baseUrl;
                }

                $('script').remove();

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
                    resolveRelativeLink($, elem, 'href', baseUrl);
                    // $(elem).attr('rel', 'noreferrer');  // currently no such a need
                });
                // https://www.w3schools.com/tags/att_src.asp
                $('img, video, audio, source, iframe, embed, track').each((_, elem) => {
                    resolveRelativeLink($, elem, 'src', baseUrl);
                });
                $('video[poster]').each((_, elem) => {
                    resolveRelativeLink($, elem, 'poster', baseUrl);
                });
                $('img, iframe').each((_, elem) => {
                    $(elem).attr('referrerpolicy', 'no-referrer');
                });

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
                item.category = item.category.filter((e) => typeof e === 'string');
            }
            return item;
        };

        data.item = await Promise.all(data.item.map((itm) => handleItem(itm)));

        // filter
        const engine = config.feature.filter_regex_engine;
        const makeRegex = (str: string) => {
            // default: case_senstivie = true
            const insensitive = ctx.req.query('filter_case_sensitive') === 'false';
            switch (engine) {
                case 'regexp':
                    return new RegExp(str, insensitive ? 'i' : '');
                case 're2':
                    return RE2JS.compile(str, insensitive ? RE2JS.CASE_INSENSITIVE : 0);
                default:
                    throw new Error(`Invalid Engine Value: ${engine}, please check your config.`);
            }
        };

        if (ctx.req.query('filter')) {
            const regex = makeRegex(ctx.req.query('filter')!);

            data.item = data.item.filter((item) => {
                const title = item.title || '';
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = item.category || [];
                const isFilter =
                    regex instanceof RE2JS
                        ? regex.matcher(title).find() || regex.matcher(description).find() || regex.matcher(author).find() || category.some((c) => regex.matcher(c).find())
                        : title.match(regex) || description.match(regex) || author.match(regex) || category.some((c) => c.match(regex));

                return isFilter;
            });
        }

        // 启用filter参数时，无效filter_title/description/author/category
        if (!ctx.req.query('filter') && (ctx.req.query('filter_title') || ctx.req.query('filter_description') || ctx.req.query('filter_author') || ctx.req.query('filter_category'))) {
            data.item = data.item.filter((item) => {
                const title = item.title || '';
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = item.category || [];
                let isFilter = true;

                if (ctx.req.query('filter_title')) {
                    const titleRegex = makeRegex(ctx.req.query('filter_title')!);
                    isFilter = titleRegex instanceof RE2JS ? titleRegex.matcher(title).find() : !!titleRegex.test(title);
                }
                if (ctx.req.query('filter_description')) {
                    const descriptionRegex = makeRegex(ctx.req.query('filter_description')!);
                    isFilter = isFilter && (descriptionRegex instanceof RE2JS ? descriptionRegex.matcher(description).find() : !!descriptionRegex.test(description));
                }
                if (ctx.req.query('filter_author')) {
                    const authorRegex = makeRegex(ctx.req.query('filter_author')!);
                    isFilter = isFilter && (authorRegex instanceof RE2JS ? authorRegex.matcher(author).find() : !!authorRegex.test(author));
                }
                if (ctx.req.query('filter_category')) {
                    const categoryRegex = makeRegex(ctx.req.query('filter_category')!);
                    isFilter = isFilter && category.some((c) => (categoryRegex instanceof RE2JS ? categoryRegex.matcher(c).find() : c.match(categoryRegex)));
                }

                return isFilter;
            });
        }

        if (ctx.req.query('filterout') || ctx.req.query('filterout_title') || ctx.req.query('filterout_description') || ctx.req.query('filterout_author') || ctx.req.query('filterout_category')) {
            data.item = data.item.filter((item) => {
                const title = item.title;
                const description = item.description || title;
                const author = getAuthorString(item);
                const category = item.category || [];
                let isFilter = true;

                if (ctx.req.query('filterout') || ctx.req.query('filterout_title')) {
                    const titleRegex = makeRegex(ctx.req.query('filterout_title') || ctx.req.query('filterout')!);
                    isFilter = titleRegex instanceof RE2JS ? !titleRegex.matcher(title).find() : !titleRegex.test(title);
                }
                if (ctx.req.query('filterout') || ctx.req.query('filterout_description')) {
                    const descriptionRegex = makeRegex(ctx.req.query('filterout_description') || ctx.req.query('filterout')!);
                    isFilter = isFilter && (descriptionRegex instanceof RE2JS ? !descriptionRegex.matcher(description).find() : !descriptionRegex.test(description));
                }
                if (ctx.req.query('filterout_author')) {
                    const authorRegex = makeRegex(ctx.req.query('filterout_author')!);
                    isFilter = isFilter && (authorRegex instanceof RE2JS ? !authorRegex.matcher(author).find() : !authorRegex.test(author));
                }
                if (ctx.req.query('filterout_category')) {
                    const categoryRegex = makeRegex(ctx.req.query('filterout_category')!);
                    isFilter = isFilter && !category.some((c) => (categoryRegex instanceof RE2JS ? categoryRegex.matcher(c).find() : c.match(categoryRegex)));
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
        if (ctx.req.query('limit')) {
            data.item = data.item.slice(0, Number.parseInt(ctx.req.query('limit')!));
        }

        // telegram instant view
        if (ctx.req.query('tgiv')) {
            data.item.map((item) => {
                if (item.link) {
                    const encodedlink = encodeURIComponent(item.link);
                    item.link = `https://t.me/iv?url=${encodedlink}&rhash=${ctx.req.query('tgiv')}`;
                    return item;
                } else {
                    return item;
                }
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
                            const res = await ofetch(link);
                            const $ = load(res);
                            const result = await Parser.parse(link, {
                                html: $.html(),
                            });
                            return result;
                        } catch {
                            // no-empty
                        }
                    }
                });

                item.author = author || parsed_result?.author;
                item.description = parsed_result && parsed_result.content.length > 40 ? entities.decodeXML(parsed_result.content) : description;
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
                            const description = await cache.tryGet(`openai:description:${item.link}`, async () => {
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
                            const title = await cache.tryGet(`openai:title:${item.link}`, async () => {
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
                            const title = await cache.tryGet(`openai:title:${item.link}`, async () => {
                                const title = convert(item.title!);
                                return await getAiCompletion(config.openai.promptTitle, title);
                            });
                            // replace the title
                            if (title !== '') {
                                item.title = title + '';
                            }

                            const description = await cache.tryGet(`openai:description:${item.link}`, async () => {
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
                    let text;
                    if (item.description) {
                        text = sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} });
                        item.description = text.length > brief ? `<p>${text.slice(0, brief)}…</p>` : `<p>${text}</p>`;
                    }
                }
            } else {
                throw new Error(`Invalid parameter brief. Please check the doc https://docs.rsshub.app/guide/parameters#shu-chu-jian-xun`);
            }
        }
        // some parameters are processed in `anti-hotlink.js`

        ctx.set('data', data);
    } else {
        // throw new Error('wrong path');
    }
};

export default middleware;

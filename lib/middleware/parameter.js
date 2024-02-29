const entities = require('entities');
const cheerio = require('cheerio');
const { simplecc } = require('simplecc-wasm');
const got = require('@/utils/got');
const config = require('@/config').value;
const { RE2JS } = require('re2js');
const md = require('markdown-it')({
    html: true,
});
const htmlToText = require('html-to-text');
const sanitizeHtml = require('sanitize-html');

let mercury_parser;

const resolveRelativeLink = ($, elem, attr, baseUrl) => {
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

const summarizeArticle = async (articleText) => {
    const apiUrl = `${config.openai.endpoint}/chat/completions`;
    const response = await got.post(apiUrl, {
        json: {
            model: config.openai.model,
            max_tokens: config.openai.maxTokens,
            messages: [
                { role: 'system', content: config.openai.prompt },
                { role: 'user', content: articleText },
            ],
            temperature: config.openai.temperature,
        },
        headers: {
            Authorization: `Bearer ${config.openai.apiKey}`,
        },
    });

    return response.data.choices[0].message.content;
};

module.exports = async (ctx, next) => {
    await next();

    if (!ctx.state.data && !ctx._matchedRoute) {
        throw new Error('wrong path');
    }

    if (ctx.state.data) {
        if ((!ctx.state.data.item || ctx.state.data.item.length === 0) && !ctx.state.data.allowEmpty) {
            throw new Error('this route is empty, please check the original site or <a href="https://github.com/DIYgod/RSSHub/issues/new/choose">create an issue</a>');
        }

        // fix allowEmpty
        ctx.state.data.item = ctx.state.data.item || [];

        // decode HTML entities
        ctx.state.data.title && (ctx.state.data.title = entities.decodeXML(ctx.state.data.title + ''));
        ctx.state.data.description && (ctx.state.data.description = entities.decodeXML(ctx.state.data.description + ''));

        // sort items
        if (ctx.query.sorted !== 'false') {
            ctx.state.data.item = ctx.state.data.item.sort((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));
        }

        const handleItem = (item) => {
            item.title && (item.title = entities.decodeXML(item.title + ''));

            // handle pubDate
            if (item.pubDate) {
                item.pubDate = new Date(item.pubDate).toUTCString();
            }

            // handle link
            if (item.link) {
                let baseUrl = ctx.state.data.link;
                if (baseUrl && !/^https?:\/\//.test(baseUrl)) {
                    baseUrl = /^\/\//.test(baseUrl) ? 'http:' + baseUrl : 'http://' + baseUrl;
                }

                item.link = new URL(item.link, baseUrl).href;
            }

            // handle description
            if (item.description) {
                const $ = cheerio.load(item.description);
                let baseUrl = item.link || ctx.state.data.link;

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

        ctx.state.data.item = await Promise.all(ctx.state.data.item.map((itm) => handleItem(itm)));

        if (ctx.query) {
            // filter
            const engine = config.feature.filter_regex_engine;
            const makeRegex = (string) => {
                if (!string) {
                    return null;
                }
                // default: case_senstivie = true
                const insensitive = ctx.query.filter_case_sensitive === 'false';
                switch (engine) {
                    case 'regexp':
                        return new RegExp(string, insensitive ? 'i' : '');
                    case 're2':
                        return RE2JS.compile(string, insensitive ? RE2JS.CASE_INSENSITIVE : 0);
                    default:
                        throw new Error(`Invalid Engine Value: ${engine}, please check your config.`);
                }
            };

            if (ctx.query.filter) {
                const regex = makeRegex(ctx.query.filter);

                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    const category = item.category || [];
                    const isFilter =
                        engine === 're2'
                            ? regex.matcher(title).find() || regex.matcher(description).find() || regex.matcher(author).find() || category.some((c) => regex.matcher(c).find())
                            : title.match(regex) || description.match(regex) || author.match(regex) || category.some((c) => c.match(regex));

                    return isFilter;
                });
            }

            // 启用filter参数时，无效filter_title/description/author/category
            if (!ctx.query.filter && (ctx.query.filter_title || ctx.query.filter_description || ctx.query.filter_author || ctx.query.filter_category)) {
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    const category = item.category || [];
                    let isFilter = true;

                    const titleRegex = makeRegex(ctx.query.filter_title);
                    const descriptionRegex = makeRegex(ctx.query.filter_description);
                    const authorRegex = makeRegex(ctx.query.filter_author);
                    const categoryRegex = makeRegex(ctx.query.filter_category);

                    ctx.query.filter_title && (isFilter = engine === 're2' ? titleRegex.matcher(title).find() : title.match(titleRegex));
                    ctx.query.filter_description && (isFilter = isFilter && (engine === 're2' ? descriptionRegex.matcher(description).find() : description.match(descriptionRegex)));
                    ctx.query.filter_author && (isFilter = isFilter && (engine === 're2' ? authorRegex.matcher(author).find() : author.match(authorRegex)));
                    ctx.query.filter_category && (isFilter = isFilter && category.some((c) => (engine === 're2' ? categoryRegex.matcher(c).find() : c.match(categoryRegex))));

                    return isFilter;
                });
            }

            if (ctx.query.filterout || ctx.query.filterout_title || ctx.query.filterout_description || ctx.query.filterout_author || ctx.query.filterout_category) {
                if (ctx.query.filterout) {
                    ctx.query.filterout_title = ctx.query.filterout;
                    ctx.query.filterout_description = ctx.query.filterout;
                }
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title;
                    const description = item.description || title;
                    const author = item.author || '';
                    const category = item.category || [];
                    let isFilter = true;

                    const titleRegex = makeRegex(ctx.query.filterout_title);
                    const descriptionRegex = makeRegex(ctx.query.filterout_description);
                    const authorRegex = makeRegex(ctx.query.filterout_author);
                    const categoryRegex = makeRegex(ctx.query.filterout_category);

                    ctx.query.filterout_title && (isFilter = engine === 're2' ? !titleRegex.matcher(title).find() : !title.match(titleRegex));
                    ctx.query.filterout_description && (isFilter = isFilter && (engine === 're2' ? !descriptionRegex.matcher(description).find() : !description.match(descriptionRegex)));
                    ctx.query.filterout_author && (isFilter = isFilter && (engine === 're2' ? !authorRegex.matcher(author).find() : !author.match(authorRegex)));
                    ctx.query.filterout_category && (isFilter = isFilter && !category.some((c) => (engine === 're2' ? categoryRegex.matcher(c).find() : c.match(categoryRegex))));

                    return isFilter;
                });
            }

            if (ctx.query.filter_time) {
                const now = Date.now();
                ctx.state.data.item = ctx.state.data.item.filter(({ pubDate }) => {
                    let isFilter = true;
                    try {
                        isFilter = !pubDate || now - new Date(pubDate).getTime() <= Number.parseInt(ctx.query.filter_time) * 1000;
                    } catch {
                        // no-empty
                    }
                    return isFilter;
                });
            }

            // limit
            if (ctx.query.limit) {
                ctx.state.data.item = ctx.state.data.item.slice(0, Number.parseInt(ctx.query.limit));
            }

            // telegram instant view
            if (ctx.query.tgiv) {
                ctx.state.data.item.map((item) => {
                    const encodedlink = encodeURIComponent(item.link);
                    item.link = `https://t.me/iv?url=${encodedlink}&rhash=${ctx.query.tgiv}`;
                    return item;
                });
            }

            // fulltext
            if (ctx.query.mode && ctx.query.mode.toLowerCase() === 'fulltext') {
                const tasks = ctx.state.data.item.map(async (item) => {
                    const { link, author, description } = item;
                    const parsed_result = await ctx.cache.tryGet(`mercury-cache-${link}`, async () => {
                        // if parser failed, return default description and not report error
                        try {
                            mercury_parser = mercury_parser || require('@postlight/parser');

                            const { data: res } = await got(link);
                            const $ = cheerio.load(res);
                            const result = await mercury_parser.parse(link, {
                                html: $.html(),
                            });
                            return result;
                        } catch {
                            // no-empty
                        }
                    });

                    item.author = author || (parsed_result ? parsed_result.author : '');
                    item.description = parsed_result && parsed_result.content.length > 40 ? entities.decodeXML(parsed_result.content) : description;
                });
                await Promise.all(tasks);
            }

            // openai
            if (ctx.query.chatgpt && config.openai.apiKey) {
                ctx.state.data.item = await Promise.all(
                    ctx.state.data.item.map(async (item) => {
                        if (item.description) {
                            try {
                                const summary = await ctx.cache.tryGet(`openai:${item.link}`, async () => {
                                    const text = htmlToText.htmlToText(item.description);
                                    if (text.length < 300) {
                                        return '';
                                    }
                                    const summary_md = await summarizeArticle(text);
                                    return md.render(summary_md);
                                });
                                // 将总结结果添加到文章数据中
                                if (summary !== '') {
                                    item.description = summary + '<hr/><br/>' + item.description;
                                }
                            } catch {
                                // when openai failed, return default description and not write cache
                            }
                        }
                        return item;
                    })
                );
            }

            // scihub
            if (ctx.query.scihub) {
                ctx.state.data.item.map((item) => {
                    item.link = item.doi ? `${config.scihub.host}${item.doi}` : `${config.scihub.host}${item.link}`;
                    return item;
                });
            }

            // opencc
            if (ctx.query.opencc) {
                for (const item of ctx.state.data.item) {
                    item.title = simplecc(item.title ?? item.link, ctx.query.opencc);
                    item.description = simplecc(item.description ?? item.title ?? item.link, ctx.query.opencc);
                }
            }

            // brief
            if (ctx.query.brief) {
                const num = /[1-9]\d{2,}/;
                if (num.test(ctx.query.brief)) {
                    ctx.query.brief = Number.parseInt(ctx.query.brief);
                    for (const item of ctx.state.data.item) {
                        let text;
                        if (item.description) {
                            text = sanitizeHtml(item.description, { allowedTags: [], allowedAttributes: {} });
                        }
                        if (text?.length) {
                            item.description = text.length > ctx.query.brief ? `<p>${text.substring(0, ctx.query.brief)}…</p>` : `<p>${text}</p>`;
                        }
                    }
                } else {
                    throw new Error(`Invalid parameter brief. Please check the doc https://docs.rsshub.app/parameter#shu-chu-jian-xun`);
                }
            }

            // some parameters are processed in `anti-hotlink.js`
        }
    }
};

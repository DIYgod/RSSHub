const entities = require('entities');
const cheerio = require('cheerio');
const { simplecc } = require('simplecc-wasm');
const got = require('@/utils/got');
const config = require('@/config').value;
const RE2 = require('re2');

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
        } catch (e) {
            // no-empty
        }
    }
};

module.exports = async (ctx, next) => {
    await next();

    if (!ctx.state.data && !ctx._matchedRoute) {
        // Given that the official demo has a cache TTL of 2h, a "wrong path" page will be cached by CloudFlare for
        // 200h (8.33d).
        // What makes it worse is that the documentation contains status badges to detect the availability of routes,
        // but the documentation is updated more timely than the official demo, so the every example path of every
        // new route will probably have a "wrong path" page cached for at least 200h soon after accepted. That is to
        // say, the example paths of a new route will probably be unavailable on the public demo in the first 200h
        // after accepted.
        // As a conclusion, the next 3 lines has been commented out. (exactly the same behavior as any internal error)
        // ctx.set({
        //     'Cache-Control': `public, max-age=${config.cache.routeExpire * 100}`,
        // });
        throw Error('wrong path');
    }

    if (ctx.state.data) {
        if ((!ctx.state.data.item || ctx.state.data.item.length === 0) && !ctx.state.data.allowEmpty) {
            throw Error('this route is empty, please check the original site or <a href="https://github.com/DIYgod/RSSHub/issues/new/choose">create an issue</a>');
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
                if (baseUrl && !baseUrl.match(/^https?:\/\//)) {
                    if (baseUrl.match(/^\/\//)) {
                        baseUrl = 'http:' + baseUrl;
                    } else {
                        baseUrl = 'http://' + baseUrl;
                    }
                }

                item.link = new URL(item.link, baseUrl).href;
            }

            // handle description
            if (item.description) {
                const $ = cheerio.load(item.description);
                let baseUrl = item.link || ctx.state.data.link;

                if (baseUrl && !baseUrl.match(/^https?:\/\//)) {
                    if (baseUrl.match(/^\/\//)) {
                        baseUrl = 'http:' + baseUrl;
                    } else {
                        baseUrl = 'http://' + baseUrl;
                    }
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
                    ['onclick', 'onerror', 'onload'].forEach((e) => {
                        $ele.removeAttr(e);
                    });
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

                const quote = item._extra?.links?.find((e) => e.type === 'quote');
                if (quote && $('.rsshub-quote').length) {
                    quote.content_html = $.html($('.rsshub-quote'));
                }
            }
            return item;
        };

        ctx.state.data.item = await Promise.all(ctx.state.data.item.map(handleItem));

        if (ctx.query) {
            // limit
            if (ctx.query.limit) {
                ctx.state.data.item = ctx.state.data.item.slice(0, parseInt(ctx.query.limit));
            }

            // filter
            const makeRegex = (string) => {
                // default: case_senstivie = true
                const engine = config.feature.filter_regex_engine;
                if (ctx.query.filter_case_sensitive === 'false') {
                    switch (engine) {
                        case 'regexp':
                            return new RegExp(string, 'i');
                        case 're2':
                            return new RE2(string, 'i');
                        default:
                            throw Error(`Invalid Engine Value: ${engine}, please check your config.`);
                    }
                } else {
                    switch (engine) {
                        case 'regexp':
                            return new RegExp(string);
                        case 're2':
                            return new RE2(string);
                        default:
                            throw Error(`Invalid Engine Value: ${engine}, please check your config.`);
                    }
                }
            };

            if (ctx.query.filter) {
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    const category = item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [];
                    const isFilter =
                        title.match(makeRegex(ctx.query.filter)) || description.match(makeRegex(ctx.query.filter)) || author.match(makeRegex(ctx.query.filter)) || category.some((c) => c.match(makeRegex(ctx.query.filter)));
                    return isFilter;
                });
            }

            // 启用filter参数时，无效filter_title/description/author/category
            if (!ctx.query.filter && (ctx.query.filter_title || ctx.query.filter_description || ctx.query.filter_author || ctx.query.filter_category)) {
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    const category = item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [];
                    let isFilter = true;
                    ctx.query.filter_title && (isFilter = title.match(makeRegex(ctx.query.filter_title)));
                    ctx.query.filter_description && (isFilter = isFilter && description.match(makeRegex(ctx.query.filter_description)));
                    ctx.query.filter_author && (isFilter = isFilter && author.match(makeRegex(ctx.query.filter_author)));
                    ctx.query.filter_category && (isFilter = isFilter && category.some((c) => c.match(makeRegex(ctx.query.filter_category))));
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
                    const category = item.category ? (Array.isArray(item.category) ? item.category : [item.category]) : [];
                    let isFilter = true;
                    ctx.query.filterout_title && (isFilter = !title.match(makeRegex(ctx.query.filterout_title)));
                    ctx.query.filterout_description && (isFilter = isFilter && !description.match(makeRegex(ctx.query.filterout_description)));
                    ctx.query.filterout_author && (isFilter = isFilter && !author.match(makeRegex(ctx.query.filterout_author)));
                    ctx.query.filterout_category && (isFilter = isFilter && !category.some((c) => c.match(makeRegex(ctx.query.filterout_category))));
                    return isFilter;
                });
            }

            if (ctx.query.filter_time) {
                const now = Date.now();
                ctx.state.data.item = ctx.state.data.item.filter(({ pubDate }) => {
                    let isFilter = true;
                    try {
                        isFilter = !pubDate || now - new Date(pubDate).getTime() <= parseInt(ctx.query.filter_time) * 1000;
                    } catch (err) {
                        // no-empty
                    }
                    return isFilter;
                });
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
                        } catch (e) {
                            // no-empty
                        }
                    });

                    item.author = author || (parsed_result ? parsed_result.author : '');
                    item.description = parsed_result ? entities.decodeXML(parsed_result.content) : description;
                });
                await Promise.all(tasks);
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
                ctx.state.data.item.forEach((item) => {
                    item.title = simplecc(item.title ?? item.link, ctx.query.opencc);
                    item.description = simplecc(item.description ?? item.title ?? item.link, ctx.query.opencc);
                });
            }

            // brief
            if (ctx.query.brief) {
                const num = /[1-9]\d{2,}/;
                if (num.test(ctx.query.brief)) {
                    ctx.query.brief = parseInt(ctx.query.brief);
                    ctx.state.data.item.forEach((item) => {
                        let text;
                        if (item.description) {
                            text = item.description.replace(/<\/?[^>]+(>|$)/g, '');
                        }
                        if (text && text.length) {
                            if (text.length > ctx.query.brief) {
                                item.description = `<p>${text.substring(0, ctx.query.brief)}…</p>`;
                            } else {
                                item.description = `<p>${text}</p>`;
                            }
                        }
                    });
                } else {
                    throw Error(`Invalid parameter <code>brief=${ctx.query.brief}</code>. Please check the doc https://docs.rsshub.app/parameter.html#shu-chu-jian-xun`);
                }
            }

            // some parameters are processed in `anti-hotlink.js`
        }
    }
};

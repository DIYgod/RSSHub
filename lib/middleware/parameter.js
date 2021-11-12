const entities = require('entities');
const cheerio = require('cheerio');
const { simplecc } = require('simplecc-wasm');
const got = require('@/utils/got');
const config = require('@/config').value;

let mercury_parser;

module.exports = async (ctx, next) => {
    await next();

    if (!ctx.state.data && !ctx._matchedRoute) {
        ctx.set({
            'Cache-Control': `public, max-age=${config.cache.routeExpire * 100}`,
        });
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
        ctx.state.data.item = ctx.state.data.item.sort((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));

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

                $('a').each((_, ele) => {
                    const $ele = $(ele);

                    // absolute link
                    if (baseUrl) {
                        try {
                            $ele.attr('href', new URL($ele.attr('href'), baseUrl).href);
                        } catch (e) {
                            // no-empty
                        }
                    }
                });

                $('img').each((_, ele) => {
                    const $ele = $(ele);

                    // fix lazyload
                    if (!$ele.attr('src')) {
                        for (const key in ele.attribs) {
                            const value = ele.attribs[key].trim();
                            if (['.gif', '.png', '.jpg', '.webp'].some((suffix) => value.includes(suffix))) {
                                $ele.attr('src', value);
                                break;
                            }
                        }
                    }

                    // absolute link
                    if (baseUrl) {
                        try {
                            $ele.attr('src', new URL($ele.attr('src'), baseUrl).href);
                        } catch (e) {
                            // no-empty
                        }
                    }

                    // referrerpolicy
                    $ele.attr('referrerpolicy', 'no-referrer');

                    // redundant attributes
                    ['onclick', 'onerror', 'onload'].forEach((e) => {
                        $ele.removeAttr(e);
                    });
                });
                item.description = entities.decodeXML($('body').html() + '') + (config.suffix || '');
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
                if (ctx.query.filter_case_sensitive === 'false') {
                    return new RegExp(string, 'i');
                } else {
                    return new RegExp(string);
                }
            };

            if (ctx.query.filter) {
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    const isFilter = title.match(makeRegex(ctx.query.filter)) || description.match(makeRegex(ctx.query.filter)) || author.match(makeRegex(ctx.query.filter));
                    return isFilter;
                });
            }

            // 启用filter参数时，无效filter_title/description/author
            if (!ctx.query.filter && (ctx.query.filter_title || ctx.query.filter_description || ctx.query.filter_author)) {
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    let isFilter = true;
                    ctx.query.filter_title && (isFilter = title.match(makeRegex(ctx.query.filter_title)));
                    ctx.query.filter_description && (isFilter = isFilter && description.match(makeRegex(ctx.query.filter_description)));
                    ctx.query.filter_author && (isFilter = isFilter && author.match(makeRegex(ctx.query.filter_author)));
                    return isFilter;
                });
            }

            if (ctx.query.filterout || ctx.query.filterout_title || ctx.query.filterout_description || ctx.query.filterout_author) {
                if (ctx.query.filterout) {
                    ctx.query.filterout_title = ctx.query.filterout;
                    ctx.query.filterout_description = ctx.query.filterout;
                }
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title;
                    const description = item.description || title;
                    const author = item.author || '';
                    let isFilter = true;
                    ctx.query.filterout_title && (isFilter = !title.match(makeRegex(ctx.query.filterout_title)));
                    ctx.query.filterout_description && (isFilter = isFilter && !description.match(makeRegex(ctx.query.filterout_description)));
                    ctx.query.filterout_author && (isFilter = isFilter && !author.match(makeRegex(ctx.query.filterout_author)));
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
                            mercury_parser = mercury_parser || require('@postlight/mercury-parser');

                            const res = await got(link);
                            const $ = cheerio.load(res.data);
                            const result = await mercury_parser.parse(link, {
                                html: $.html(),
                            });
                            return result;
                        } catch (e) {
                            // no-empty
                        }
                    });

                    item.author = author || (parsed_result ? parsed_result.author : '');
                    item.description = parsed_result ? parsed_result.content : description;
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
                    item.title = simplecc(item.title, ctx.query.opencc);
                    item.description = simplecc(item.description, ctx.query.opencc);
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
        }
    }
};

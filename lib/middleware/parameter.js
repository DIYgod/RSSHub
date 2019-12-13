const he = require('he');
const mercury_parser = require('@postlight/mercury-parser');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;

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
        ctx.state.data.title && (ctx.state.data.title = he.decode(ctx.state.data.title + ''));
        ctx.state.data.description && (ctx.state.data.description = he.decode(ctx.state.data.description + ''));

        // sort items
        ctx.state.data.item = ctx.state.data.item.sort((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0));

        ctx.state.data.item.forEach((item) => {
            item.title && (item.title = he.decode(item.title + ''));

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
                item.description = he.decode($('body').html() + '') + (config.suffix || '');
            }
        });

        if (ctx.query) {
            // limit
            if (ctx.query.limit) {
                ctx.state.data.item = ctx.state.data.item.slice(0, parseInt(ctx.query.limit));
            }

            // filter
            if (ctx.query.filter || ctx.query.filter_title || ctx.query.filter_description || ctx.query.filter_author) {
                if (ctx.query.filter) {
                    ctx.query.filter_title = ctx.query.filter;
                    ctx.query.filter_description = ctx.query.filter;
                }
                ctx.state.data.item = ctx.state.data.item.filter((item) => {
                    const title = item.title || '';
                    const description = item.description || title;
                    const author = item.author || '';
                    let isFilter = true;
                    ctx.query.filter_title && (isFilter = isFilter && !title.match(ctx.query.filter_title));
                    ctx.query.filter_description && (isFilter = isFilter && !description.match(ctx.query.filter_description));
                    ctx.query.filter_author && (isFilter = isFilter && !author.match(ctx.query.filter_author));
                    return !isFilter;
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
                    ctx.query.filterout_title && (isFilter = isFilter && !title.match(ctx.query.filterout_title));
                    ctx.query.filterout_description && (isFilter = isFilter && !description.match(ctx.query.filterout_description));
                    ctx.query.filterout_author && (isFilter = isFilter && !author.match(ctx.query.filterout_author));
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

            // fulltest
            if (ctx.query.mode && ctx.query.mode.toLowerCase() === 'fulltext') {
                const tasks = ctx.state.data.item.map(async (item) => {
                    const { link, author, description } = item;
                    const parsed_result = await ctx.cache.tryGet(`mercury-cache-${link}`, async () => {
                        // if parser failed, return default description and not report error
                        try {
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
        }
    }
};

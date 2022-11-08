const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://nautil.us/topics/${ctx.params.tid}/`;
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.snippet-article_content').get();
    const out = await Promise.all(
        // loading 20 articles by default
        list.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20).map(async (item) => {
            const $ = cheerio.load(item);
            const address = $('a').attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const title = capture('meta[property="og:title"]').attr('content');
            const author = capture('meta[name="author"]').attr('content');
            const pubTime = capture('meta[property="article:published_time"]').attr('content');

            // disturbing contents
            capture('.article-collection_box').remove();
            capture('blockquote').remove();
            capture('.article-author').remove();
            capture('.article-collection_box text-center').remove();
            capture('.article-bottom-newsletter_box').remove();
            capture('.main-post-comments-toggle-wrap').remove();
            capture('.supported-one').remove();

            // lazyload images
            capture('img').each((_, e) => {
                e = capture(e);
                e.attr('src', e.attr('data-src') ?? e.attr('srcset'));
            });

            // adding banner if available
            const banner = capture('.feature-image').html();
            const contents = banner ? banner + capture('.article-content').html() : capture('.article-content').html();
            const single = {
                title,
                author,
                description: contents,
                link: address,
                guid: address,
                pubDate: pubTime,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Nautilus | ' + $('.static-title').text(),
        link: url,
        item: out,
    };
};

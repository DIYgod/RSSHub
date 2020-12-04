const got = require('@/utils/got');
const cheerio = require('cheerio');
const parser = require('@/utils/rss-parser');

module.exports = async (ctx) => {
    const lang = ctx.params.lang === 'us' ? 'www' : ctx.params.lang || 'cn';
    const rssUrl = `https://${lang}.engadget.com/rss.xml`;
    const feed = await parser.parseURL(rssUrl);

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        if (ctx.params.lang === 'us') {
            $('div#engadget-article-footer').remove();
            $('div#right-ads-rail').remove();
            $('.t-meta.c-gray-3.mb-35').remove();
            return $('div#page_body').html();
        } else {
            $('span#end-legacy-contents').remove();
            $('#post-slideshow figcaption').remove();
            $('#post-slideshow div.pagination button').remove();
            $('#post-slideshow img.scrollview-image-embedded').each((i, el) => {
                $(el).attr('src', $(el).data('wf-src'));
            });
            $('#post-slideshow li.list-item-embedded')
                .children()
                .each((i, el) => {
                    $(el).insertAfter($(el).parent());
                });
            $('#post-slideshow li.list-item-embedded').remove();
            return $('#post-center-col > div:nth-child(1)').html();
        }
    };

    const items = await Promise.all(
        feed.items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(item.link);

            const description = ProcessFeed(response.data);
            const single = {
                title: item.title,
                description,
                pubDate: item.pubDate,
                link: item.link,
                author: item.author,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        language: feed.language,
        item: items,
    };
};

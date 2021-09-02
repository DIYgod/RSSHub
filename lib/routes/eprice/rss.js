const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const region = ctx.params.region || 'tw';

    const feed = await parser.parseURL(`https://www.eprice.com.${region}/news/rss.xml`);

    const items = await Promise.all(
        feed.items.map(async (item) => {
            item.link = item.link.replace(/^http:\/\//i, 'https://');
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const response = await got({
                method: 'get',
                url: item.link,
                headers: {
                    Referer: `https://www.eprice.com.${region}`,
                },
            });

            const $ = cheerio.load(response.data);

            // remove unwanted elements
            $('table').remove();
            $('script').remove();
            $('noscript').remove();
            $('div.ad-336x280-g').remove();
            $('div.ad-728x90-g').remove();
            $('.join-eprice-fb').remove();
            $('div.clear').remove();
            $('div.text-left').remove();
            $('div.signature').remove();

            // fix lazyload image
            $('img').each((_, e) => {
                if ($(e).attr('data-original')) {
                    $(e).after(`<img src="${$(e).attr('data-original')}" alt="${$(e).attr('alt')}" title="${$(e).attr('title')}">`);
                    $(e).remove();
                }
            });

            const single = {
                title: item.title,
                description: $('div.user-comment-block').html() || $('div.content').html(),
                author: item.author,
                category: item.categories,
                pubDate: parseDate(item.pubDate),
                link: item.link,
            };

            ctx.cache.set(item.link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
};

const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const region = ctx.params.region ?? 'tw';

    const feed = await parser.parseURL(`https://www.eprice.com.${region}/news/rss.xml`);

    feed.items.forEach((e) => {
        e.link = e.link.replace(/^http:\/\//i, 'https://');
    });

    const renderDesc = (desc) =>
        art(path.join(__dirname, 'templates/description.art'), {
            desc,
        });

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    method: 'get',
                    url: item.link,
                    headers: {
                        Referer: `https://www.eprice.com.${region}`,
                    },
                });

                const $ = cheerio.load(response.data);

                // remove unwanted elements
                $('noscript').remove();
                $('div.ad-336x280-g').remove();
                $('div.ad-728x90-g').remove();
                $('.adsbygoogle').remove();
                $('.join-eprice-fb').remove();
                $('div.clear').remove();
                $('div.text-left').remove();
                $('div.signature').remove();
                $('div[id^=dablewidget]').remove();

                // extract categories
                item.category = item.categories;

                // fix lazyload image
                $('img').each((_, e) => {
                    e = $(e);
                    if (e.attr('data-original')) {
                        e.attr('src', e.attr('data-original'));
                        e.removeAttr('class');
                        e.removeAttr('data-original');
                        e.removeAttr('data-title');
                        e.removeAttr('data-thumbnail');
                        e.removeAttr('data-url');
                    }
                });

                // remove unwanted key value
                delete item.categories;
                delete item.content;
                delete item.contentSnippet;
                delete item.creator;
                delete item.enclosure;
                delete item.isoDate;

                item.description = renderDesc($('div.user-comment-block').html() ?? $('div.content').html());
                item.pubDate = parseDate(item.pubDate);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };

    ctx.state.json = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        image: feed.image.url,
        language: feed.language,
    };
};

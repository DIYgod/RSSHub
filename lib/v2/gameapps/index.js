const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.gameapps.hk';
    const feed = await parser.parseURL(`https://www.gameapps.hk/rss`);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got({
                    url: item.link,
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const $ = cheerio.load(response.data);

                // remove unwanted key value
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    src: $('div.introduction.media.news-intro div.media-left').find('img').attr('src'),
                    intro: $('div.introduction.media.news-intro div.media-body').html().trim(),
                    desc: $('.news-content').html().trim(),
                });
                item.guid = item.guid.substring(0, item.link.lastIndexOf('/'));
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
        language: feed.language,
    };

    ctx.state.json = {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        item: items,
        language: feed.language,
    };
};

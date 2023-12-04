const got = require('@/utils/got');
const parser = require('@/utils/rss-parser');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.gameapps.hk';
    const feed = await parser.parseURL(`${baseUrl}/rss`);

    const items = await Promise.all(
        feed.items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const $ = cheerio.load(response);

                const nextPages = $('.pagination li')
                    .not('.disabled')
                    .not('.active')
                    .find('a')
                    .toArray()
                    .map((a) => `${baseUrl}${a.attribs.href}`);

                $('.pages').remove();

                const content = $('.news-content');

                // remove unwanted key value
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                if (nextPages.length) {
                    const pages = await Promise.all(
                        nextPages.map(async (url) => {
                            const { data: response } = await got(url, {
                                headers: {
                                    referer: item.link,
                                },
                            });
                            const $ = cheerio.load(response);
                            $('.pages').remove();
                            return $('.news-content').html();
                        })
                    );
                    content.append(pages);
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    src: $('div.introduction.media.news-intro div.media-left').find('img').attr('src'),
                    intro: $('div.introduction.media.news-intro div.media-body').html().trim(),
                    desc: content.html().trim(),
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
        image: `${baseUrl}/static/favicon/apple-touch-icon.png`,
        item: items,
        language: feed.language,
    };
};

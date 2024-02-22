const parser = require('@/utils/rss-parser');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const { parseArticleContent, parseMainImage } = require('./utils');

module.exports = async (ctx) => {
    const rssUrl = 'https://wiadomosci.onet.pl/.feed';
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map(async (item) => {
            const { description, author, category } = await ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link, {
                    headers: {
                        referer: 'https://www.onet.pl/', // for some reason onet.pl will redirect to the main page if referer is not set
                    },
                });

                const $ = cheerio.load(response);
                const content = parseArticleContent($);

                const mainImage = parseMainImage($);

                const description = art(path.join(__dirname, 'templates/article.art'), {
                    mainImage,
                    lead: $('#lead').text()?.trim(),
                    content: content.html()?.trim(),
                });

                const author = $('.authorNameWrapper span[itemprop="name"]').text()?.trim();
                const category = $('span.relatedTopic').text()?.trim();

                return { description, author, category };
            });
            return {
                title: item.title,
                link: item.link,
                description,
                author,
                category,
                pubDate: parseDate(item.pubDate),
                guid: item.id,
            };
        })
    );
    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.title,
        item: items,
        language: 'pl',
        image: 'https://ocdn.eu/wiadomosciucs/static/logo2017/onet2017big_dark.png',
    };
};

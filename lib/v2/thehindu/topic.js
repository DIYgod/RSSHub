const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.thehindu.com';
    const { topic } = ctx.params;
    const link = `${baseUrl}/topic/${topic}/`;
    const apiLink = `${baseUrl}/topic/${topic}/fragment/showmoreTag`;

    const { data: response } = await got(link);
    const { data: apiResponse } = await got(apiLink);

    const $ = cheerio.load(response);

    const $api = cheerio.load(apiResponse);
    const list = $('.element')
        .toArray()
        .map((item) => {
            item = $api(item);
            const a = item.find('.title a');
            return {
                title: a.text().trim(),
                link: a.attr('href'),
                author: item.find('.author-name').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                $('.position-relative, .articleblock-container, .article-ad, .comments-shares').remove();
                item.description = $('.sub-title').prop('outerHTML') + $('div.article-picture').html() + $('div[itemprop="articleBody"]').html();
                item.pubDate = parseDate($('meta[itemprop="datePublished"]').attr('content'));
                item.updated = parseDate($('meta[itemprop="dateModified"]').attr('content'));
                item.category = $('meta[property="article:tag"]')
                    .toArray()
                    .map((item) => $(item).attr('content'));

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text().trim(),
        link: `${baseUrl}/topic/${topic}/`,
        image: $('meta[property="og:image"]').attr('content'),
        logo: $('link[rel="apple-touch-icon"]').attr('href'),
        icon: $('link[rel="icon"]').attr('href'),
        language: 'en',
        item: items,
    };
};

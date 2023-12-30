const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const asyncPool = require('tiny-async-pool');

module.exports = async (ctx) => {
    // sn_f parameter is required to prevent redirection
    const currentUrl = 'https://www.shoppingdesign.com.tw/post?sn_f=1';
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    const items = [];
    // maximum parallel requests on the target website are limited to 11.
    for await (const data of asyncPool(10, $('article-item'), (item) => {
        item = $(item);
        const link = item.attr('url');
        return ctx.cache.tryGet(link, async () => {
            const response = await got(`${link}?sn_f=1`);
            const $ = cheerio.load(response.data);
            const article = $('.left article .htmlview');
            article.find('d-image').each(function () {
                $(this).replaceWith(`<img src="${$(this).attr('lg')}">`);
            });

            return {
                title: $('.left article .top_info h1').text(),
                author: $('meta[name="my:author"]').attr('content'),
                description: article.html(),
                category: $('meta[name="my:category"]').attr('content'),
                pubDate: parseDate($('meta[name="my:publish"]').attr('content')),
                link,
            };
        });
    })) {
        items.push(data);
    }

    ctx.state.data = {
        title: $('meta[property="og:title"]').attr('content'),
        link: currentUrl,
        description: $('meta[property="og:description"]').attr('content'),
        item: items,
    };
};

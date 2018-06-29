const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://blog.reimu.net',
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://blog.reimu.net',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const articles = $('article').not('.sticky');
    const title = $('title').text();

    ctx.state.data = {
        title: title,
        link: `https://blog.reimu.net`,
        description: title,
        item:
            articles &&
            articles
                .map((index, article) => {
                    article = $(article);
                    const title = article.find('h2').text();
                    const description = article.find('.entry-content').text();
                    const pubDate = new Date(article.find('.entry-date').text()).toUTCString();
                    const link = article.find('a[rel=bookmark]').attr('href');

                    return {
                        title,
                        description,
                        pubDate,
                        link
                    };
                })
                .get()
    };
};
const got = require('../../utils/got.js');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseURL = 'https://weekly.docschina.org';
    const res = await got({
        method: 'get',
        url: baseURL + '/javascript',
        headers: {
            Referer: baseURL,
        },
    });

    const $ = cheerio.load(res.data);

    const link = $('.sidebar-link').eq(1).attr('href');
    const title = $('.site-name').text();
    const description = $('a[href="https://javascriptweekly.com/"]').parent().text();

    const articles = await got({
        method: 'get',
        url: baseURL + link,
        headers: {
            Referer: baseURL,
        },
    });

    const $2 = cheerio.load(articles.data);
    const articlesList = $2('.page .content').children();
    const items = articlesList
        .map((item, element) => {
            const $article = cheerio.load(element);
            return {
                title: $article('h3>a[rel="noopener noreferrer"]').text(),
                description: $article('p').text(),
                link: $article('h3>a[rel="noopener noreferrer"]').attr('href'),
            };
        })
        .get()
        .filter((item) => item.title !== '');
    ctx.state.data = {
        title,
        link: baseURL,
        description,
        item: items.splice(0),
    };
};

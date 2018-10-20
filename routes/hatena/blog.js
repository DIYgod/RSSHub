// Warning: The author still knows nothing about javascript!

// params:
// domain: blogger url

const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser
const get_article = require('./_article');

const base_url = 'http://$domain$/';
module.exports = async (ctx) => {
    const blog_url = base_url.replace('$domain$', ctx.params.domain);

    // get blog list
    const response = await axios({
        method: 'get',
        url: blog_url,
    });
    const data = response.data; // content is html format

    const $ = cheerio.load(data);
    const author = $('span.fn').attr('data-user-name');
    const list = $('div#main-inner').find('a.entry-title-link');

    // parse title and description
    const title = $('h1#title').text();
    const description = $('h2#blog-description').text();

    // parse article urls
    const urls = [];
    for (let i = 0; i < list.length; ++i) {
        const tmp = $(list[i]).attr('href');
        urls.push(tmp);
    }

    // get articles
    const article_list = await Promise.all(urls.map((u) => get_article(u)));

    // feed the data
    ctx.state.data = {
        title: title + ' - はてなブログ',
        link: blog_url,
        description: description,
        item: article_list,
        author: author,
    };
};

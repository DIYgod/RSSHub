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
    const list = $('div.archive-entries > section');

    // parse title and description
    const title = $('h1#title').text();
    const description = $('h2#blog-description').text();

    // parse blog urls
    const detail_urls = [];
    for (let i = 0; i < list.length; ++i) {
        const link = $(list[i])
            .find('a.entry-title-link')
            .attr('href');
        detail_urls.push(link);
    }

    // get articles
    const article_list = await Promise.all(detail_urls.map((url) => get_article(url)));

    // feed the data
    ctx.state.data = {
        title: title + ' - はてなブログ',
        link: blog_url,
        description: description,
        item: article_list,
    };
};

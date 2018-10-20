// Warning: The author still knows nothing about javascript!

// params:
// user: blogger

const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser
const get_article = require('./_article');

const base_url = 'https://hatenablog.com/';
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: base_url,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get urls
    const detail_urls = [];

    const a = $('section.serviceTop-recommend').find('a');

    for (let i = 0; i < a.length; ++i) {
        const tmp = $(a[i]).attr('href');
        if (tmp.includes('/entry') && detail_urls.indexOf(tmp) < 0) {
            detail_urls.push(tmp);
        }
    }

    // get articles
    const article_list = await Promise.all(detail_urls.map((url) => get_article(url)));

    // feed the data
    ctx.state.data = {
        title: 'おすすめ記事 - はてなブログ',
        link: base_url,
        item: article_list,
    };
};

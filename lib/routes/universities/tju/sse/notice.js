// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const get_article = require('./_article');

const base_url = 'http://sse.tongji.edu.cn/data/list/$type$';
module.exports = async (ctx) => {
    const type = ctx.params.type || 'xwdt';

    const list_url = base_url.replace('$type$', type);
    const response = await got({
        method: 'get',
        url: list_url,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get urls
    const detail_urls = [];

    const a = $('ul.data-list').find('a').slice(0, 10);

    for (let i = 0; i < a.length; ++i) {
        const tmp = $(a[i]).attr('href');
        detail_urls.push(tmp);
    }

    // get articles
    const article_list = await Promise.all(detail_urls.map((url) => get_article(url)));

    // feed the data
    ctx.state.data = {
        title: '同济大学软件学院',
        link: list_url,
        item: article_list,
    };
};

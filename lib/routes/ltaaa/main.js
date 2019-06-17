// Warning: The author still knows nothing about javascript!

// params:
// type: notification type

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const get_article = require('./_article');

const base_url = 'http://www.ltaaa.com';
module.exports = async (ctx) => {
    const type = ctx.params.type || 'news'; // week, month or year
    let target = '';
    switch (type) {
        case 'week':
            target = 'ul.vweek';
            break;
        case 'month':
            target = 'ul.vmonth';
            break;
        case 'year':
            target = 'ul.vyear';
            break;
        default:
            target = 'ul.wlist';
    }

    const list_url = base_url + '/wtfy.html';
    const response = await got({
        method: 'get',
        url: list_url,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get urls
    const detail_urls = [];

    let a = $(target).find('a.rtitle');
    if (!a || a.length <= 0) {
        a = $(target).find('div.li-title > a');
    }

    for (let i = 0; i < a.length; ++i) {
        const tmp = $(a[i]).attr('href');
        detail_urls.push(tmp);
    }

    // get articles
    const article_list = await Promise.all(detail_urls.map((url) => get_article(url)));

    // feed the data
    ctx.state.data = {
        title: '龙腾网转译网贴',
        link: list_url,
        item: article_list,
    };
};

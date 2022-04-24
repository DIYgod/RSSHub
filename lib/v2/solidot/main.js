// Warning: The author still knows nothing about javascript!

// params:
// type: subject type

const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser
const get_article = require('./_article');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'www';
    const base_url = `https://${type}.solidot.org`;
    const response = await got({
        method: 'get',
        url: base_url,
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get urls
    const a = $('div.block_m').find('div.bg_htit > h2 > a');
    const urls = [];
    for (let i = 0; i < a.length; ++i) {
        urls.push($(a[i]).attr('href'));
    }

    // get articles
    const msg_list = await Promise.all(urls.map((u) => ctx.cache.tryGet(u, () => get_article(u))));

    // feed the data
    ctx.state.data = {
        title: '奇客的资讯，重要的东西',
        link: base_url,
        item: msg_list,
    };
};

// Warning: The author still knows nothing about javascript!

// params:
// type: subject type

const axios = require('../../utils/axios'); // get web content
const cheerio = require('cheerio'); // html parser

const base_url = 'https://$type$.solidot.org';
module.exports = async (ctx) => {
    const type = ctx.params.type || 'www';

    const list_url = base_url.replace('$type$', type);
    const response = await axios({
        method: 'get',
        url: list_url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
    });
    const data = response.data; // content is html format
    const $ = cheerio.load(data);

    // get content
    const a = $('div.block_m');

    const msg_list = [];
    for (let i = 0; i < a.length; ++i) {
        const title = $(a[i])
            .find('div.bg_htit > h2 > a')
            .text();
        const link =
            list_url +
            $(a[i])
                .find('div.bg_htit > h2 > a')
                .attr('href');
        const content = $(a[i])
            .find('div.p_mainnew')
            .html()
            .replace(/href="\//g, 'href="' + list_url);
        const author = $(a[i])
            .find('div.talk_time > b')
            .text()
            .replace(/^来自/, '');
        const category = $(a[i])
            .find('div.icon_float > a')
            .attr('title');
        const cat_img = $(a[i])
            .find('div.icon_float > a')
            .html();
        const date_raw = $(a[i])
            .find('div.talk_time')
            .clone()
            .children()
            .remove()
            .end()
            .text();
        const date_str_zh = date_raw.replace(/^[^`]*发表于(.*分)[^`]*$/g, '$1'); // use [^`] to match \n
        const date_str = date_str_zh
            .replace(/[年月]/g, '-')
            .replace(/时/g, ':')
            .replace(/[日分]/g, '');
        let date = new Date(date_str);
        date.setHours(date.getHours() - 8);
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        const item = {
            title: title,
            author: author,
            pubDate: date.toUTCString(),
            category: category, // not supported: 2018-10-29
            link: link,
            description: content + '<br/><br/>' + cat_img,
        };

        msg_list.push(item);
    }

    // feed the data
    ctx.state.data = {
        title: '奇客的资讯，重要的东西',
        link: list_url,
        item: msg_list,
    };
};

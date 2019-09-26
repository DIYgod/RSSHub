const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://bbs.tianya.cn/list-free-1.shtml';
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const items = $('table > tbody ~ tbody > tr')
        .map((_, ele) => {
            const $item = cheerio.load(ele); 
            const title = $item('td.td-title a').text();
            const link = $item('td.td-title a').attr('href');
            const date = $item('td').last().attr("title"); 

            const pubDate = new Date(date).toUTCString();
            return {
                title,
                description: title,
                link,
                pubDate,
            };
        })
        .get();
    ctx.state.data = {
        title: '天涯论坛',
        description: '天涯论坛',
        link: url,
        item: items,
    };
};

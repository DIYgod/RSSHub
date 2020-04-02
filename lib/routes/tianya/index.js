const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const url = 'http://bbs.tianya.cn/list-' + type + '-1.shtml';
    const response = await got(url, { headers: { Referer: 'http://bbs.tianya.cn' } });
    const $ = cheerio.load(response.data);
    const typeTitle = $('div.location div.text strong').text();
    const items = $('table > tbody ~ tbody > tr')
        .map((_, ele) => {
            const $item = cheerio.load(ele);
            const title = $item('td.td-title a').text();
            const link = 'http://bbs.tianya.cn' + $item('td.td-title a').attr('href');
            const date = $item('td').last().attr('title');

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
        title: typeTitle,
        description: typeTitle,
        link: url,
        item: items,
    };
};

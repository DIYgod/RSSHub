const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const column = ctx.params.column;
    const url = `http://${column}.caixin.com/${category}`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text();
    const list = $('.stitXtuwen_list dl dd');
    const items = [];

    for (let i = 0; i < list.length; i++) {
        const item = {
            title: $(list[i]).children('h4').children().text(),
            desc: $(list[i]).children('p').text(),
            pubDate: new Date($(list[i]).children('span').text().replace('年', '-').replace('月', '-').replace('日', '')).toUTCString(),
            url: $(list[i]).children('h4').children().attr('href'),
        };
        items.push(item);
    }

    ctx.state.data = {
        title,
        link: url,
        description: '财新网 - 提供财经新闻及资讯服务',
        item: items.map((item) => ({
            title: item.title,
            description: item.desc,
            guid: item.title,
            link: item.url,
            pubDate: item.pubDate,
        })),
    };
};

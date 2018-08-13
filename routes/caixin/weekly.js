const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `http://weekly.caixin.com/${category}`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url,
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('.stitXtuwen_list dl dd');
    const items = [];

    for (let i = 0; i < list.length; i++) {
        const item = {
            title: $(list[i])
                .children('h4')
                .children()
                .text(),
            desc: $(list[i])
                .children('p')
                .text(),
            pubDate: new Date(
                $(list[i])
                    .children('span')
                    .text()
                    .replace('年', '-')
                    .replace('月', '-')
                    .replace('日', '')
            ).toUTCString(),
            url: $(list[i])
                .children('h4')
                .children()
                .attr('href'),
        };
        items.push(item);
    }

    ctx.state.data = {
        title: '财新周刊',
        link: url,
        description: '财新周刊 - 提供财经新闻及资讯服务',
        item: items.map((item) => ({
            title: item.title,
            description: item.desc,
            guid: item.title,
            link: item.url,
            pubDate: item.pubDate,
        })),
    };
};

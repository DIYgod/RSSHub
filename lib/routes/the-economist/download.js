const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const link = 'http://www.cgx02.xyz/index.php?dir=/te';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const items = $('tbody tr').not('#id1').not('#id2').not('#id3').get();

    ctx.state.data = {
        title: '经济学人 the Economist',
        link: link,
        item: items.map((item) => {
            item = $(item);
            const one = item.find('td').eq(0);
            return {
                title: one.find('a').text(),
                link: url.resolve('http://www.cgx02.xyz/', one.find('a').attr('href')),
                pubDate: new Date(item.find('td.layui-hide-xs').eq(1).text()).toUTCString(),
                enclosure_url: item.link,
            };
        }),
    };
};

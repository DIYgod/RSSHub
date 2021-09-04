const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const baseUrl = 'http://booksky.so/BookDetail.aspx?Level=1&bid=';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got({
        method: 'get',
        url: `${baseUrl}${id}`,
        headers: {
            Host: 'booksky.so',
            Referer: 'http://booksky.so/',
        },
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'GBK');
    const $ = cheerio.load(responseHtml);

    const list = $('tr[class=b]').attr('height', '25');

    const title = $('font').attr('color', 'red').text();

    ctx.state.data = {
        title: title,
        link: `${baseUrl}${id}`,
        description: '',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.s').text(),
                        description: item.find('.t').eq(1).text(),
                        pubDate: new Date(item.find('.t').eq(2).text()).toUTCString(),
                        link: `http://booksky.so/${item.find('.s').children('a').attr('href')}`,
                    };
                })
                .get(),
    };
};

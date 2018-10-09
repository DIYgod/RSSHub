const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
module.exports = async (ctx) => {
    const response = await axios.get('http://www.dytt8.net', {
        responseType: 'arraybuffer',
    });
    response.data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(response.data);
    const list = $('.co_content8 table tr').get();
    const data = {
        title: '电影天堂',
        link: 'http://www.dytt8.net',
        description: '电影天堂RSS',
        item: list
            .map((item) => {
                const link = $(item).find('a:nth-of-type(2)');
                return {
                    title: link.text(),
                    description: link.text(),
                    pubDate: new Date(
                        $(item)
                            .find('font')
                            .text()
                    ).toUTCString(),
                    link: 'http://www.dytt8.net' + link.attr('href'),
                };
            })
            .slice(1),
    };

    ctx.state.data = data;
};

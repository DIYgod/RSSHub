const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://www.mmgal.com/',
        header: {
            Referer: 'https://www.mmgal.com/',
        },
    });

    const data = res.data;

    const $ = cheerio.load(data);
    const list = $('#article-list').find('.article');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.mmgal.com/',
        description: '忧郁的loli - Galgame资源发布站',
        item:
            list &&
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item);
                    const time = `${item.find('.month').text()}${item.find('.day').text()}日`;
                    const date = new Date();
                    const math = /(\d+)月(\d+)日/.exec(time);
                    const pubdate = new Date(date.getFullYear(), parseInt(math[1]) - 1, math[2]);

                    return {
                        title: item.find('h1').text(),
                        description: `${item.find('.info p').text()}`,
                        pubDate: pubdate > date ? new Date(date.getFullYear() - 1, parseInt(math[1]) - 1, math[2]).toUTCString() : pubdate.toUTCString(),
                        link: item.find('h1 a').attr('href'),
                    };
                })
                .get(),
    };
};

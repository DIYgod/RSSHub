const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    let url = `https://www.tuicool.com/mags/${type}`;
    if (type === 'prog') {
        url = 'https://www.tuicool.com/mags';
    }
    const res = await got({
        method: 'get',
        url,
    });
    url = 'https://www.tuicool.com' + cheerio.load(res.data)('.mag-period-item a').attr('href');

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('.article-title');

    ctx.state.data = {
        title: $('title').text(),
        link: 'https://www.tuicool.com/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: `推酷：${item.find('.title').text()}`,
                        pubDate: new Date($('.period-title sub').text().substring(1, 11)).toUTCString(),
                        link: `${item.find('a').attr('href')}`,
                    };
                })
                .get(),
    };
};

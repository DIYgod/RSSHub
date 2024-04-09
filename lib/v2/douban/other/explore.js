const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.douban.com/explore',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('div.item');

    ctx.state.data = {
        title: '豆瓣-浏览发现',
        link: 'https://www.douban.com/explore',
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);

                    const title = item.find('.title a').first().text() ? item.find('.title a').first().text() : '#' + item.find('.icon-topic').text();
                    const desc = item.find('.content p').text();
                    const itemPic = item.find('a.cover').attr('style')
                        ? item
                              .find('a.cover')
                              .attr('style')
                              .match(/\('(.*?)'\)/)[1]
                        : '';
                    const author = item.find('.usr-pic a').last().text();
                    const link = item.find('.title a').attr('href') ?? item.find('.icon-topic a').attr('href');

                    return {
                        title,
                        author,
                        description: art(path.join(__dirname, '../templates/explore.art'), {
                            author,
                            desc,
                            itemPic,
                        }),
                        link,
                    };
                })
                .get(),
    };
};

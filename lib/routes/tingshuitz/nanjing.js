const got = require('@/utils/got');
const cheerio = require('cheerio');

const HOME_PAGE = 'http://www.jlwater.com/';

module.exports = async (ctx) => {
    const url = `${HOME_PAGE}portal/10000013`;
    const response = await got.get(url);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.list-content ul li');

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: list
            .map((index, item) => {
                const $item = $(item);
                const title = $item.find('a span').text();
                const list_time = $item.find('.list-time').text();
                const link = $item.find('a').attr('href');

                let pubDate = $item.find('.rtime').text();
                pubDate = new Date(pubDate.substring(1, pubDate.length - 1)).toUTCString();

                return {
                    title: `${title} ${list_time}`,
                    description: '南京市停水通知',
                    link: `${HOME_PAGE}${link}`,
                    pubDate,
                };
            })
            .get(),
    };
};

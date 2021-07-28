const got = require('@/utils/got');
const cheerio = require('cheerio');

const HOME_PAGE = 'http://www.jlwater.com/';

module.exports = async (ctx) => {
    const url = `${HOME_PAGE}portal.do?method=news&subjectchildid=8`;
    const response = await got.get(url);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.maincol-list ul li');

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: list
            .map((index, item) => {
                const $item = $(item);
                const $title = $item.find('.rtitle');
                const link = $title.find('a').attr('href');

                let pubDate = $item.find('.rtime').text();
                pubDate = new Date(pubDate.substring(1, pubDate.length - 1)).toUTCString();

                return {
                    title: $title.text(),
                    description: '南京市停水通知',
                    link: `${HOME_PAGE}${link}`,
                    pubDate,
                };
            })
            .get(),
    };
};

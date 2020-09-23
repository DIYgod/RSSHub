const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.yomiuri.co.jp/news/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ul.news-top-upper-content-topics-content-list.p-list').children('li').not('.p-member-only');

    const out = await Promise.all(
        list &&
            list
                .map(async (index, item) => {
                    item = $(item);
                    const link = item.find('a').attr('href');
                    const content = await got({
                        method: 'get',
                        url: link,
                    });
                    const c = cheerio.load(content.data);
                    const description = c('div.p-main-contents').html();
                    return {
                        title: item.find('a').text(),
                        description,
                        link: item.find('a').attr('href'),
                    };
                })
                .get()
    );

    ctx.state.data = {
        title: '读卖新闻-综合',
        link: 'https://www.yomiuri.co.jp/news/',
        item: out,
    };
};

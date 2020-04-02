const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://centbrowser.cn/history.html';

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const list = $('.list').toArray();

    ctx.state.data = {
        title: 'Cent Browser 更新日志',
        link: url,
        item: list.map((update) => {
            update = $(update);
            const version = update.find('p').first().attr('id');
            const date = update
                .find('p > i')
                .text()
                .match(/\d+-\d+-\d+/)[0];
            update.find('p').remove();
            return {
                title: version,
                author: 'Cent Browser',
                description: update.html(),
                link: `${url}#${date}`,
                pubDate: new Date(date),
            };
        }),
    };
};

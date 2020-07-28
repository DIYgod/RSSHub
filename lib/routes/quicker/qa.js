const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://getquicker.net/QA',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.question-title > a');

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const response_item = await got({
                    method: 'get',
                    url: 'https://getquicker.net' + item.attr('href'),
                });
                const a = cheerio.load(response_item.data);
                return Promise.resolve({
                    title: item.text(),
                    description: `作者：${a('.user-link').first().text()}<br>描述：${a('.user-content').first().html()}`,
                    pubDate:
                        a('.user-content span')
                            .last()
                            .text()
                            .match(/最后更新于\s*\S+/) || '1900/1/1',
                    link: item.attr('href'),
                });
            })
            .get()
    );

    ctx.state.data = {
        title: '讨论区 - Quicker',
        link: 'https://getquicker.net/QA',
        item: out,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://darwinawards.com/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = [];
    $('div.column.content')
        .find('p')
        .each(function (index, item) {
            if (!$(item).find('a').text().startsWith('20') && $(item).find('a').text() !== '') {
                list.push(item);
            }
        });

    let index = 0;

    ctx.state.data = {
        title: 'Darwin Awards',
        link: 'https://darwinawards.com/',
        item: list.map(function (item) {
            const title = $(item).find('a').text();

            const time = new Date();
            time.setMinutes(time.getMinutes() - index);
            index++;

            return {
                title: title,
                description: $(item).text().replace(title, ''),
                link: $(item).find('a').attr('href'),
                pubDate: time,
            };
        }),
    };
};

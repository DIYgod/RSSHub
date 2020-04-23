const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.zhuixinfan.com/main.php`,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = [];
    Array.from($('.top-list-data:not(.top-list-data-all)')).forEach((table) => {
        table = $(table);
        const date = table.children('caption').first().text();

        table
            .find('tbody')
            .children('tr')
            .not((i) => i === 0)
            .each((i, item) => {
                item = $(item);
                item.attr('date', date.substr(date.indexOf('（') + 1, 6));
                list.push(item);
            });
    });

    ctx.state.data = {
        title: '追新番',
        link: 'http://www.zhuixinfan.com/main.php',
        language: 'zh-CN',
        description: '追新番日剧站',
        item: list.map((item) => {
            const category = item.find('td.td2 a').first().text();
            const title = item.find('td.td2 a').last().text();
            const description = `资源大小：${item.find('td').eq(2).text()}`;
            const link = item.find('td').eq(3).children('a').first().attr('href');
            const pubDate = date(item.attr('date'));

            return {
                title: title,
                description: description,
                category: category,
                link: link,
                pubDate: pubDate,
            };
        }),
    };
};

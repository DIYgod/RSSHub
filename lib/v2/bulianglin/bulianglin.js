const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://bulianglin.com/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('div.single-post')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').text();
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.summary').text();
            const dateraw = element.find('div.text-muted').find('li').eq(1).text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY 年 MM 月 DD 日'),
            };
        })
        .get();

    ctx.state.data = {
        title: '不良林',
        link: url,
        item: list,
    };
};

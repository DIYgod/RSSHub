const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://lala.im/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("article")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h2 > a').text();
        const link = element.find('h2 > a').attr('href');
        const description = element.find('p[class="note"]').text();
        const dateraw = element.find("time").text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
        };
    })
    .get();


    ctx.state.data = {
        title: '荒岛',
        link: url,
        item: list,
    };  
};

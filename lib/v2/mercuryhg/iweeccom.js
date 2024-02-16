const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const url = `https://iweec.com/`;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("div.title-article")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h1').text();
        const link = element.find('div.list-pic > a').attr('href');
        const description = element.find('p').text();
        const dateraw = element.find("div.title-msg").find('span').eq(1).text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw, 'YYYY-MM-DD ..'),
        };
    })
    .get();


    ctx.state.data = {
        title: '梅塔沃克',
        link: url,
        item: list,
    };  
};

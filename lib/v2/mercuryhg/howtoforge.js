const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://www.howtoforge.com/`;
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("h2").parent()
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h2 > a').text();
        const link = `${url}` + element.find('h2 > a').attr('href');
        const description = element.find('p.list-excerpt').text();
        const dateraw = element.find("span").eq(3).text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw.substring(dateraw.indexOf(':')), ': MMM DD, YYYY'),
        };
    })
    .get();


    ctx.state.data = {
        title: 'howtoforge',
        link: url,
        item: list,
    };  
};

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const url = 'https://www.ynbit.com/roy/feed.xml';

module.exports = async (ctx) => {
    //const url = `https://www.hicairo.com`;
    const response = await got({ method: 'get', url });
    const tt = cheerio.load(response.data, { xmlMode: true });
    console.log (tt);
/*
    const list = $("article.section")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h2 > a').text();
        const link = element.find('h2 > a').attr('href');
        const description = element.find('div.excerpt').text();
        const dateraw = element.find("time").text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
        };
    })
    .get();
*/

    ctx.state.data = {
        title: "HiFeng'Blog",
        link: 'url',
        item: 'list',
    };  
};

const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://post.smzdm.com/fenlei/ruanjianyingyong/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("div[class='list post-list']")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h2 > a').text();
        const link = element.find('h2 > a').attr('href');
        const description = element.find('p').text();
        //const description = element.find("span[class='time']").text();
        const dateraw = element.find("span[class='time']").text();
        

        return {
            title,
            description,
            link,
            //pubDate: parseDate(dateraw, 'YYYY年M月D日'),
        };
    })
    .get();


    ctx.state.data = {
        title: '什么值得买',
        link: url,
        item: list,
    };  
};

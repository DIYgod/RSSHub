const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.zhujiceping.com/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("article[data-aos='fade-up']")
    .map((i, e) => {
        const element = $(e);
        const title = element.find('h2 > a').text();
        const link = element.find('h2 > a').attr('href');
        const description = element.find('div[class="archive-content"]').text();
        const dateraw = element.find("span[class='date']").text();

        return {
            title,
            description,
            link,
            pubDate: parseDate(dateraw, 'YYYY年M月D日'),
        };
    })
    .get();


    ctx.state.data = {
        title: '国外主机测评',
        link: url,
        item: list,
    };  
};

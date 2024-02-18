const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://free.com.tw/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('article.type-post')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').text();
            const link = element.find('h2 > a').attr('href');
            const description = element.find('div.entry-content').find('p').eq(1).text();
            const dateraw = element.find('span.date').attr('title');

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
            };
        })
        .get();

    ctx.state.data = {
        title: '免費資源網路社群',
        link: url,
        item: list,
    };
};

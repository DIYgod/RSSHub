const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.playpcesor.com/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $("article[class='post-outer-container']")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h3 > a').text();
            const link = element.find('h3 > a').attr('href');
            const description = element.find('div[class="snippet-item r-snippetized"]').text();
            const dateraw = element.find('time').attr('datetime');

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DDTHH:mm:ss+08:00'),
            };
        })
        .get();

    ctx.state.data = {
        title: '电脑玩物',
        link: url,
        item: list,
    };
};

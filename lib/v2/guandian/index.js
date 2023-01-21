const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const baseUrl = 'https://www.guandian.cn';

module.exports = async (ctx) => {
    const cat = ctx.params.category;
    const reqUrl = `${baseUrl}/${cat}/`;
    const response = await got(reqUrl);
    const $ = cheerio.load(response.data);

    const items = $('.con_l li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.con_l_con_r a');
            const link = a.attr('href');
            const title = a.find('h3').text();
            const desc = item.find('.con_l_con_r p').text();

            const dateStr = item.find('#keyword span').text();
            return {
                title,
                link,
                description: desc,
                pubDate: timezone(parseDate(dateStr), 8),
            };
        });

    ctx.state.data = {
        title: $('head title').text(),
        link: reqUrl,
        item: items,
    };
};

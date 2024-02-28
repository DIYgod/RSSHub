const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.zrblog.net/';
    const response = await got({ method: 'get', url });
    const $ = cheerio.load(response.data);

    const list = $('div.art_img_box')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.intro').text();
            const dateraw = element.find('div.info').find('span').eq(0).text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, '发布日期：YYYY年MM月DD日'),
            };
        })
        .get();

    ctx.state.data = {
        title: '赵容部落',
        link: url,
        item: list,
    };
};

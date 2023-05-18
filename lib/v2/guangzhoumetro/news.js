const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const newsUrl = 'https://www.gzmtr.com/ygwm/xwzx/gsxw/';
    const response = await got(newsUrl);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ul.ag_h_w li')
        .map((_, item) => {
            item = $(item);
            const url = newsUrl + item.find('a').attr('href').substr(2);
            const title = item.find('a').text();
            const publishTime = parseDate(item.find('span').text());
            return {
                title,
                link: url,
                author: '广州地铁',
                pubtime: publishTime,
            };
        })
        .get();

    ctx.state.data = {
        title: '广州地铁新闻',
        url: newsUrl,
        description: '广州地铁新闻',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
};

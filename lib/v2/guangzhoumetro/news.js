const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const news_url = 'https://www.gzmtr.com/ygwm/xwzx/gsxw/';
    const response = await got(news_url);
    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('ul.ag_h_w li')
        .map((_, item) => {
            item = $(item);
            const url = `${news_url}` + item.find('a').attr('href').substr(2);
            const title = item.find('a').text();
            const publish_time = parseDate(item.find('span').text());
            return {
                title,
                link: url,
                author: '广州地铁',
                pubtime: publish_time,
            };
        })
        .get();

    ctx.state.data = {
        title: '广州地铁新闻',
        url: `${news_url}`,
        description: '广州地铁新闻',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    };
};

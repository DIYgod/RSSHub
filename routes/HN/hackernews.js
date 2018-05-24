const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://news.ycombinator.com',
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://news.ycombinator.com',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.itemlist tr td.title a.storylink');
    const dates = $('.itemlist span.age a');

    ctx.state.data = {
        title: 'Hacker News',
        link: 'https://news.ycombinator.com',
        description: 'HN',
        item:
        list &&
        list
            .map((index, item) => {
                item = $(item);
                const title = item.text();
                const dateObj = dates[index].children.find((v) => v.type === 'text').data || {};
                const date = dateObj.data;
                const link = item.attr('href');
                return {
                    title,
                    description: title,
                    pubDate: date,
                    link,
                };
            })
            .get(),
    };
};

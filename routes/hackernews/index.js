const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const DateTime = require('luxon').DateTime;

module.exports = async (ctx) => {
    const res = await axios({
        method: 'get',
        url: 'https://news.ycombinator.com/news',
        headers: {
            Referer: 'https://news.ycombinator.com/',
        },
    });

    const data = res.data;
    const $ = cheerio.load(data);
    const list = $('.athing');

    ctx.state.data = {
        title: 'Hacker News',
        link: 'https://news.ycombinator.com/',
        item: list
            .map((index, element) => {
                const item = $(element);
                const storylink = item.find('.storylink');
                const dateString = item.find('.age > a').text();

                let date;
                if (dateString.includes('ago')) {
                    // 处理表示相对日期的字符串
                    const list = dateString
                        .match(/(\dd )?(\d{1,2}h )?(\d{1,2}m )?ago/)
                        .slice(1)
                        .map((s) => (s ? Number(s.slice(0, -2)) : 0));

                    date = DateTime.local().minus({
                        days: list[0],
                        hours: list[1],
                        minutes: list[2],
                    });
                } else {
                    // 表示绝对日期的字符串
                    date = DateTime.fromFormat(dateString, 'yyyy-L-dd HH:mm');
                }

                return {
                    title: storylink.text(),
                    pubDate: date,
                    link: storylink.attr('href'),
                };
            })
            .get(),
    };
};

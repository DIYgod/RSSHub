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
    const lists = $('.athing');
    const dates = $('.age');

    ctx.state.data = {
        title: 'Hacker News',
        link: 'https://news.ycombinator.com/',
        item: lists
            .map((index, element) => {
                const item = $(element);
                const storylink = item.find('.storylink');
                const dateString = $(dates[index])
                    .find('a')
                    .text();

                let date;
                if (dateString.includes('ago')) {
                    // 处理表示相对日期的字符串
                    const dateList = dateString
                        .match(/(\d days? )?(\d{1,2} hours? )?(\d{1,2} minutes? )?ago/)
                        .slice(1)
                        .map((s) => (s ? Number(s.split(' ')[0]) : 0));

                    date = DateTime.local().minus({
                        days: dateList[0],
                        hours: dateList[1],
                        minutes: dateList[2],
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

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://www.hex-rays.com/blog/';
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const item = $('.post-list-container')
        .map((_, ele) => ({
            title: $('h3 > a', ele).text(),
            link: $('h3 > a', ele).attr('href'),
            pubDate: parseDate($('.post-meta:nth-of-type(1)', ele).first().text().trim().replace('Posted on:', '')),
            author: $('.post-meta:nth-of-type(2)', ele).first().text().trim().replace('By:', ''),
        }))
        .get();

    ctx.state.data = {
        title: 'Hex-Rays Blog',
        link,
        item,
    };
};

// 虽然能够用插件探测到疑似feed，但是实际请求会发现需要登录
// https://forum.hex-rays.com/app.php/feed/news

// 正文部分比较...乱且意义不大，所以没有正文

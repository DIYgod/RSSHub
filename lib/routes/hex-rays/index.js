const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let host = 'https://www.hex-rays.com';

    host = `${host}/news.shtml`;

    const response = await got.get(host);

    const $ = cheerio.load(response.data);

    const list = $('tr[bgcolor]');

    ctx.state.data = {
        title: 'Hex-Rays News',
        link: host,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('td:nth-child(1)').text() + '    ' + item.find('td:nth-child(2)').text(),
                        link: item.find('td:nth-child(2) > a').attr('href'),
                    };
                })
                .get(),
    };
};

// 虽然能够用插件探测到疑似feed，但是实际请求会发现需要登录
// https://forum.hex-rays.com/app.php/feed/news

// 正文部分比较...乱且意义不大，所以没有正文

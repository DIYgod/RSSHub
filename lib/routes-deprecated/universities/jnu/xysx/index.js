const got = require('@/utils/got');
const url = require('url');
const cheerio = require('cheerio');

const xysxUrl = 'https://news.jnu.edu.cn/xysx/';
const xysxType = { yxsd: '院系速递', bmkx: '部门快讯' };

module.exports = async (ctx) => {
    const type = ctx.params.type;
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        },
        url: `${xysxUrl}${type}/`,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul[class=newsConList] > li')
        .map(function () {
            const info = {
                title: $(this).find('div[class=title] > a').text(),
                link: url.resolve(xysxUrl, $(this).find('div[class=title] > a').attr('href')),
                description: $(this).find('div[class=intro]').text(),
                pubDate: new Date($(this).find('div[class=date]').text()).toUTCString(),
            };
            return info;
        })
        .get();

    const desc = `暨南大学校园时讯 - ${xysxType[type]}`;

    ctx.state.data = {
        title: desc,
        description: desc,
        link: `${xysxUrl}${type}/`,
        item: list,
    };
};

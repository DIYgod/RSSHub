const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseIndexUrl = 'https://www.sice.uestc.edu.cn/';
    const response = await got.get(baseIndexUrl);
    const $ = cheerio.load(response.data);
    const out = $('.notice p')
        .map((index, item) => {
            item = $(item);
            let date = new Date(new Date().getFullYear() + '-' + item.find('a.date').text());
            if (new Date() < date) {
                date = new Date(new Date().getFullYear() - 1 + '-' + item.find('a.date').text());
            }
            return {
                title: item.find('a[href]').text(),
                link: baseIndexUrl + item.find('a[href]').attr('href'),
                pubDate: date,
            };
        })
        .get();
    // console.log(out);

    ctx.state.data = {
        title: '信通通知公告',
        link: 'https://www.sice.uestc.edu.cn/tzgg/yb.htm',
        description: '电子科技大学信息与通信工程学院通知公告',
        item: out,
    };
};

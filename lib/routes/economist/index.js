const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const link = 'http://www.cgx02.xyz/index.php?dir=/te';

module.exports = async (ctx) => {
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    const items = $('tbody tr').get(); // 文件信息陈列在 <tbody><tr></tr>...</tbody> 中
    ctx.state.data = {
        title: '经济学人 the Economist',
        link: link,
        item: items.filter((item) => {
            return $(item).attr('id').replace('id', '') >= 4; // 只需要经济学人文本
        }).map((item) => {
            item = $(item);
            return {
                title: item.find('td').eq(0).find('a').text(),
                link: url.resolve('http://www.cgx02.xyz/', item.find('td').eq(0).find('a').attr('href')),
                pubDate: new Date(item.find('td.layui-hide-xs').eq(1).text()).toUTCString(),
                enclosure_url: item.link
            };
        })
    };
};

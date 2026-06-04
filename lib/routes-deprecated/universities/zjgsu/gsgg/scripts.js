const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const res = await got({
        method: 'get',
        url: 'http://jww.zjgsu.edu.cn/ArticleList.asp?nid=83',
        responseType: 'buffer',
    });
    res.data = iconv.decode(res.data, 'gb2312');
    const $ = cheerio.load(res.data);
    const list = $('table').eq(19).find('tr');

    ctx.state.data = {
        title: '浙江工商大学教务处-公示公告',
        link: 'http://jww.zjgsu.edu.cn/ArticleList.asp?nid=83',
        description: '浙江工商大学教务处-公示公告',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const date = new Date(item.find('td').eq(2).text());
                    const serverOffset = date.getTimezoneOffset() / 60;
                    return {
                        title: item.find('a').text(),
                        description: item.find('a').text(),
                        link: `http://jww.zjgsu.edu.cn/${item.find('a').attr('href')}`,
                        pubDate: new Date(date.getTime() - 60 * 60 * 1000 * serverOffset).toUTCString(),
                    };
                })
                .get(),
    };
};

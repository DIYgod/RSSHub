const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const response = await axios({
        method: 'get',
        url: 'https://jwc.xidian.edu.cn',
    });
    const arrC = ['信息发布', '通知公告', '教务信息', '教学研究', '教学实践', '招生信息', '质量监控'];
    const arrE = ['xxfb', 'tzgg', 'jwxx', 'jxyj', 'jxsj', 'zsxx', 'zljk'];

    const data = response.data;

    const $ = cheerio.load(data);
    let list = $('td[bgcolor="#ffffff"]')
        .first()
        .children();

    list = list
        .filter((index) => index % 2 !== 0)
        .splice(0, 10)
        .map((index, item) => {
            this.index = index;
            item = $(item);
            return item
                .find('tr')
                .find('tr')
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('a').attr('title'),
                        description: arrC[this.index] + '<br>' + item.find('a').attr('title') + '<br><br>全文内容需使用校园网或VPN获取',
                        pubDate: new Date(
                            item
                                .children()
                                .last()
                                .text()
                        ).toUTCString(),
                        link: `https://jwc.xidian.edu.cn/${item.find('a').attr('href')}`,
                    };
                });
        })
        .get();
    let result = [];
    if (category === 'all' && arrE.indexOf(category) === -1) {
        for (let i = 0; i < list.length; i++) {
            result = result.concat(list[i].get());
        }
    } else {
        result = list[arrE.indexOf(category)].get();
    }

    ctx.state.data = {
        title: '西电教务处',
        link: 'https://jwc.xidian.edu.cn',
        description: $('meta[Name="keywords"]').attr('Content'),
        item: result,
    };
};

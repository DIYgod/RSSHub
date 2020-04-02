const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const response = await got({
        method: 'get',
        url: 'https://jwc.xidian.edu.cn',
    });
    const arrC = ['信息发布', '通知公告', '教务信息', '教学研究', '教学实践', '招生信息', '质量监控'];
    const arrE = ['xxfb', 'tzgg', 'jwxx', 'jxyj', 'jxsj', 'zsxx', 'zljk'];

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#__01 > tbody > tr > td:nth-child(2)');
    const titleTables = list.children().filter((index) => index % 2 !== 1);

    const parseTable = (index, item) => {
        const title = arrC[index];
        const aTags = $(item).next().find('a');
        return aTags
            .map((_, item) => {
                item = $(item);
                return {
                    title: item.attr('title'),
                    description: title + '<br/>' + item.attr('title') + '<br/>全文内容需使用校园网或VPN获取',
                    pubDate: new Date(item.parent().next().text()).toUTCString(),
                    link: `https://jwc.xidian.edu.cn/${item.attr('href')}`,
                };
            })
            .get();
    };

    const arrIndex = arrE.indexOf(category);
    let result;
    if (arrIndex === -1) {
        result = titleTables.map(parseTable).get();
        result.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    } else {
        result = parseTable(arrIndex, titleTables[arrIndex]);
    }

    ctx.state.data = {
        title: '西电教务处',
        link: 'https://jwc.xidian.edu.cn',
        description: $('title')
            .text()
            .concat(arrIndex === -1 ? '' : '-' + arrC[arrIndex]),
        item: result,
    };
};

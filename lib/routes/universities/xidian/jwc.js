const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const response = await got({
        method: 'get',
        url: 'https://jwc.xidian.edu.cn',
    });
    const arrC = ['教学信息', '教学研究', '实践教学', '质量监控', '通知公告'];
    const arrE = ['jxxx', 'jxyj', 'sjjx', 'zljk', 'tzgg'];

    const data = response.body;

    const $ = cheerio.load(data);
    const leftItems = $('div .con2 .fl').children();
    const rightItems = $('div .con2 .fr').children();
    const mainItems = $('div .main_right').children();
    const list = { 0: leftItems[1], 1: leftItems[4], 2: rightItems[1], 3: rightItems[4], 4: mainItems[5] };

    const parseTable = (index, item) => {
        const title = arrC[index];
        const aTags = $(item).find('a');
        return aTags
            .map((_, item) => {
                item = $(item);
                let date;
                if (index === '0' || index === '1') {
                    date = new Date(item.find('span').text()).toUTCString();
                } else if (index === '4') {
                    const a = item.find('div p').text();
                    const b = item.find('span').text();
                    const c = b + '.' + a;
                    date = new Date(c).toUTCString();
                } else {
                    const a = item.find('div p').text();
                    const b = item.find('span').text();
                    const c = a + '.' + b;
                    date = new Date(c).toUTCString();
                }
                return {
                    title: item.attr('title'),
                    description: title + '<br/>' + item.attr('title') + '<br/>全文内容需使用校园网或VPN获取',
                    pubDate: date,
                    link: `https://jwc.xidian.edu.cn/${item.attr('href')}`,
                };
            })
            .get();
    };

    const arrIndex = arrE.indexOf(category);
    let result = new Array();
    if (arrIndex === -1) {
        for (const i in list) {
            result = result.concat(parseTable(i, list[i]));
        }
        result.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    } else {
        result = parseTable(arrIndex, list[arrIndex]);
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

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://yz.cau.edu.cn';
    const link = `${baseUrl}/col/col41740/index.html`;
    const response = await got(`${baseUrl}/module/web/jpage/dataproxy.jsp`, {
        searchParams: {
            page: 1,
            appid: 1,
            webid: 146,
            path: '/',
            columnid: 41740,
            unitid: 69493,
            webname: '中国农业大学研究生院',
            permissiontype: 0,
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('recordset record');

    ctx.state.data = {
        title: '中农研究生学院',
        link,
        description: '中农研究生学院',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a
                        .contents()
                        .filter((_, node) => node.type === 'text')
                        .text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('span').text().replace(/[[\]]/g, '')),
                };
            }),
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://data.eastmoney.com';
    const { category = 'strategyreport' } = ctx.params;

    const reportType = {
        strategyreport: '策略报告',
        macresearch: '宏观研究',
        brokerreport: '券商晨报',
    };
    const linkType = {
        strategyreport: 'zw_strategy',
        macresearch: 'zw_macresearch',
        brokerreport: 'zw_brokerreport',
    };

    const res = await got(`${baseUrl}/report/${category}`);
    const $ = cheerio.load(res.data);

    const initData = $('script')
        .toArray()
        .map((item) => {
            let listTemp = [];
            if ($(item).text().includes('initdata')) {
                const reg = /\[\{(.+)\}\]/g;
                const dataTemp = $(item).text().match(reg);
                listTemp = JSON.parse(dataTemp[0]);
            }
            return listTemp;
        });
    const filterList = initData.filter((item) => item.length !== 0)[0];

    const list = filterList.map((item) => ({
        title: `【${item.orgSName}】- ${item.title}`,
        link: `${baseUrl}/report/${linkType[category]}?encodeUrl=${item.encodeUrl}`,
        pubDate: parseDate(item.publishDate),
        author: item.author,
    }));

    ctx.state.data = {
        title: ` 东方财富网 - ${reportType[category]}`,
        link: baseUrl,
        item: list,
    };
};

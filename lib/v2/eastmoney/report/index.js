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

    const initData = JSON.parse(
        $('script')
            .text()
            .match(/var initdata = (.*?);/)[1]
    );

    const list = initData.data.map((item) => ({
        title: `【${item.orgSName}】- ${item.title}`,
        link: `${baseUrl}/report/${linkType[category]}.jshtml?encodeUrl=${item.encodeUrl}`,
        pubDate: parseDate(item.publishDate),
        author: Array.isArray(item.author) ? item.author.join('') : '',
    }));

    ctx.state.data = {
        title: `东方财富网 - ${reportType[category]}`,
        link: baseUrl,
        item: list,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://data.eastmoney.com';
    const { category = 'strategyreport' } = ctx.params;

    const reportType = {
        brokerreport: '券商晨报',
        industry: '行业研报',
        macresearch: '宏观研究',
        strategyreport: '策略报告',
    };
    const linkType = {
        brokerreport: 'zw_brokerreport',
        industry: 'zw_industry',
        macresearch: 'zw_macresearch',
        strategyreport: 'zw_strategy',
    };

    const res = await got(`${baseUrl}/report/${category}`);
    const $ = cheerio.load(res.data);

    const initData = JSON.parse(
        $('script')
            .text()
            .match(/var initdata(.=?)(.*?);/)[2]
    );

    const list = initData.data.map((item) => ({
        title: `[${item.orgSName}]${item.title}`,
        link: `${baseUrl}/report/${linkType[category]}.jshtml?encodeUrl=${item.encodeUrl}`,
        pubDate: parseDate(item.publishDate),
        author: item.researcher,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);
                    item.link = $('.pdf-link').attr('href');
                    item.description = $('.ctx-content').text();
                    return item;
                } catch (error) {
                    return item;
                }
            })
        )
    );

    ctx.state.data = {
        title: `东方财富网-${reportType[category]}`,
        link: baseUrl,
        item: items,
    };
};

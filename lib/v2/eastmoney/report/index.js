const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const baseUrl = 'https://data.eastmoney.com';
    const { category = 'strategyreport' } = ctx.params;

    const reportType = {
        strategyreport: '策略报告',
        macresearch: '宏观研究',
        brokerreport: '券商晨报',
    };

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });

    const link = `${baseUrl}/report/${category}`;
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    page.close();

    const $ = cheerio.load(response);
    const querySelector = `#${category}_table table tbody tr`;
    const list = $(querySelector)
        .toArray()
        .map((item) => {
            item = $(item);
            const brokerTitle = item.find('td:nth-child(4) a').text();
            const reportTitle = item.find('a').first();
            return {
                title: `${brokerTitle}—${reportTitle.text()}`,
                link: `${baseUrl}${reportTitle.attr('href')}`,
                pubDate: parseDate(item.find('td:last-child').text()),
                author: item.find('td:nth-child(3) a').text(),
            };
        });

    browser.close();

    ctx.state.data = {
        title: ` 东方财富网 - ${reportType[category]}`,
        link: baseUrl,
        item: list,
    };
};

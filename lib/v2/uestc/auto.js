const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const baseIndexUrl = 'https://www.auto.uestc.edu.cn/index/tzgg1.htm';
const host = 'https://www.auto.uestc.edu.cn/';

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseIndexUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);

    const items = $('dl.clearfix');

    const out = $(items)
        .map((_, item) => {
            item = $(item);
            const newsTitle = item.find('a').text();
            const newsLink = host + item.find('a[href]').attr('href').slice(3);
            const newsPubDate = parseDate(item.find('span').text());

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        })
        .get();

    ctx.state.data = {
        title: '电子科技大学自动化学院通知',
        link: baseIndexUrl,
        description: '电子科技大学自动化工程学院通知',
        item: out,
    };
};

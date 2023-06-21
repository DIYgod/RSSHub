const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.ujs.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/index/${type}.htm`;
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(pageUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const typeName = $('.p17.cuti').text() || '研究生招生信息网';
    const list = $('.blank.p12');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.parent().next().text();
        const aTag = item;
        const itemTitle = aTag.attr('title') || aTag.text();
        const itemPath = aTag.attr('href');
        let itemUrl = '';
        if (itemPath.startsWith('http')) {
            itemUrl = itemPath;
        } else {
            itemUrl = new URL(itemPath, pageUrl).href;
        }
        return {
            title: itemTitle,
            link: itemUrl,
            pubDate: timezone(parseDate(itemDate), 8),
            description: itemTitle,
        };
    });

    ctx.state.data = {
        title: `江苏大学研究生招生信息网 - ${typeName}`,
        link: pageUrl,
        description: `江苏大学研究生招生信息网 - ${typeName}`,
        item: items,
    };
};

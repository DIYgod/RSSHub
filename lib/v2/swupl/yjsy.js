const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsy.swupl.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/`;
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
    const typeName = $('.site_wrap h2').text() || '研究生院';
    const list = $('.admission ul li');

    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDateDay = item.find('.time em').text();
        const itemDateYearMonth = item.find('.time spam').text();
        const itemDate = `${itemDateYearMonth}.${itemDateDay}`;
        const aTag = item.find('a');
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
            description: itemTitle,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `西南政法大学 - ${typeName}`,
        link: pageUrl,
        description: `西南政法大学 - ${typeName}`,
        item: items,
    };
};

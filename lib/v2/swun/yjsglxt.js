const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://yjsglxt.swun.edu.cn:8080';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
    const pageUrl = `${host}/${type}/index.jhtml`;
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
    const typeName = $('#list .title a').last().text() || '研究生招生信息网';
    const list = $('#list .news .news-list tbody tr .columnStyle').slice(0, -1);
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.find('.postTime').text();
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
        title: `西南民族大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `西南民族大学研究生院 - ${typeName}`,
        item: items,
    };
};

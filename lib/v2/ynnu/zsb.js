const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://zsb.ynnu.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}.htm`;
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
    const typeName = $('.place a').last().text() || '研究生招生网';
    const list = $('.listbox ul li');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = '20' + item.find('.info span').first().text().replace(/\//g, '-');
        const aTag = item.find('a').last();
        const itemTitle = aTag.attr('title') || aTag.text();
        const itemPath = aTag.attr('href');
        const description = item.find('.intro').text();
        let itemUrl = '';
        if (itemPath.startsWith('http')) {
            itemUrl = itemPath;
        } else {
            itemUrl = new URL(itemPath, pageUrl).href;
        }
        return {
            title: itemTitle,
            link: itemUrl,
            description,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `云南师范大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `云南师范大学研究生招生网 - ${typeName}`,
        item: items,
    };
};

const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'http://zs.yjs.cqut.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/gi, '/');
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
    const typeName = $('.ny-title h2').text() || '研究生招生网';
    const list = $('.list-text ul li');

    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.find('.tm span').text() + '-' + item.find('.tm p').text();
        const itemTitle = item.find('a .text h1').text();
        const description = item.find('a .text p').text();
        const aTag = item.find('a');
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
            description,
            pubDate: timezone(parseDate(itemDate), 8),
        };
    });

    ctx.state.data = {
        title: `重庆理工大学研究生招生网 - ${typeName}`,
        link: pageUrl,
        description: `重庆理工大学研究生招生网 - ${typeName}`,
        item: items,
    };
};

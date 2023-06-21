const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yjsb.tiangong.edu.cn';
module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace(/-/g, '/');
    const pageUrl = `${host}/${type}/list.htm`;
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
    const typeName = $('.col_title h2').text() || '研究生院';
    const list = $('.wp_article_list li');
    const items = Array.from(list).map((item) => {
        item = $(item);
        const itemDate = item.find('.Article_PublishDate').text();
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
            pubDate: timezone(parseDate(itemDate), 8),
            description: itemTitle,
        };
    });

    ctx.state.data = {
        title: `天津工业大学研究生院 - ${typeName}`,
        link: pageUrl,
        description: `天津工业大学研究生院 - ${typeName}`,
        item: items,
    };
};

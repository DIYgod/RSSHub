const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const host = 'http://yz.cug.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');

    const pageUrl = `${host}/page/list/PVKZRL/${type}_10_1`;
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
    const list = $('.subList_content_msg ul li');

    const items = list
        .map((i, item) => {
            const $item = $(item);
            const time = $item.find('.time').text();
            const aTag = $item.find('a');
            const infoId = aTag.attr('infoid');
            const link = `${host}/page/detail/PVKZRL/${type}/${infoId}`;
            const title = aTag.attr('title') || aTag.text();
            return {
                title,
                link,
                pubDate: timezone(parseDate(time), 8),
                description: title,
            };
        })
        .get();

    ctx.state.data = {
        title: '中国地质大学（武汉）研究生招生网',
        link: pageUrl,
        description: '中国地质大学（武汉）研究生招生网',
        item: items,
    };
};

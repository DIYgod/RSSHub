const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

const host = 'https://yz.uestc.edu.cn';

module.exports = async (ctx) => {
    let { type } = ctx.request.params;
    type = type.replace('-', '/');

    const url = `${host}/${type}.htm`;
    const browser = await require('@/utils/puppeteer')({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = cheerio.load(content);
    const list = $('.main-text-list li');
    const items = list
        .map((i, el) => {
            const $el = $(el);
            const time = $el.find('.date').text();
            const $aTag = $el.find('a');
            const link = $aTag.attr('href');
            const title = $aTag.text();
            return {
                title,
                link,
                pubDate: parseDate(time),
                description: title,
            };
        })
        .get();

    ctx.state.data = {
        title: '研究生招生网',
        link: url,
        description: '电子科技大学研究生招生网',
        item: items,
    };
};

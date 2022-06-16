const cheerio = require('cheerio');
const config = require('@/config').value;

const baseUrl = 'https://www.domp4.cc';
const detailBaseUrl = 'https://www.domp4.cc/html';

function getItemList($, type = 'download1') {
    const list = $(`#${type} .down-list li`);
    return list.toArray().map((item) => {
        item = $(item);
        const magnet = item.find('a').attr('href');
        const title = item.find('a').attr('title');
        return {
            enclosure_url: magnet,
            enclosure_length: '',
            enclosure_type: 'application/x-bittorrent',
            title,
            link: title,
        };
    });
}

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const pathname = id.endsWith('.html') ? id : `${id}.html`;
    const url = `${detailBaseUrl}/${pathname}`;

    const loadedHtml = await ctx.cache.tryGet(
        `domp4:detail:${id}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
            });
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            await browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );
    const $ = cheerio.load(loadedHtml);
    const list = getItemList($);

    ctx.state.data = {
        link: baseUrl,
        title: 'domp4电影',
        item: list,
    };
};

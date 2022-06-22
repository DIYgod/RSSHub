const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const browser = await require('@/utils/puppeteer')();

    const id = ctx.params.mid;
    const sort = ctx.params.sort ?? 'near';

    const page = await browser.newPage();
    const link = `https://www.prestige-av.com/goods/goods_list.php?mode=series&mid=${id}&count=100&sort=${sort}`;
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(link);
    await page.waitForSelector('.buttons');
    await page.click('#AC');
    await page.waitForSelector('#body_goods');
    const html = await page.evaluate(() => document.documentElement.innerHTML);
    browser.close();

    const $ = cheerio.load(html);
    const list = $('div#body_goods li');

    ctx.state.data = {
        title: `【Prestige】${$('div[class=search_title_layout_01]').children('h1').first().text().replace('シリーズ ▶ ', '').replace(/\s*/g, '')}`,
        description: $('meta[name=Description]').attr('content'),
        link: `https://www.prestige-av.com/goods/goods_list.php?mode=series&mid=${id}&sort=${sort}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('span.title').text().replace(/\s*/g, ''),
                        description: item.find('div.spec_layout').children('p').first().text().replace(/\s*/g, '') + '<br/>' + `<img src="https://www.prestige-av.com/${item.find('img').attr('src').replace('pf_t1', 'pb_e')}"/>`,
                        link: item.find('a').attr('href'),
                    };
                })
                .get(),
    };
};

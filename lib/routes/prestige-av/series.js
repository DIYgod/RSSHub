const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = async (ctx) => {
    const browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
    });

    const id = ctx.params.mid;
    const sort = ctx.params.sort || 'near';

    const page = await browser.newPage();
    const link = `https://www.prestige-av.com/goods/goods_list.php?mode=series&mid=${id}&sort=${sort}`;
    await page.goto(link);
    await page.waitForSelector('.button_r18_prestige');
    await page.click('#AC');
    await page.waitForSelector('#body_goods');
    const html = await page.evaluate((window) => window.document.body.innerHTML);

    const $ = cheerio.load(html);
    const list = $('div#body_goods li');

    ctx.state.data = {
        title: `【Prestige】${$('div[class=search_title_layout_01]').children('h1').first().text().replace('シリーズ ▶ ', '').replace(/\s*/g, '')}`,
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

    browser.close();
};

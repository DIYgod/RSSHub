const got = require('@/utils/got');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = async (ctx) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    const direct_url = 'https://www.miit.gov.cn/zwgk/wjgs/index.html';
    const base_url = 'https://www.miit.gov.cn/';

    
    await page.goto(direct_url);
    const response = await page.content();
    const $ = cheerio.load(response.data);
    const list = $('.clist_con li').get();

    await page.close();
    await browser.close();


const ProcessFeed = (data) => {
    const $ = cheerio.load(data);

    const content = $('p');
    return content.html();
};

const items = await Promise.all(
    list.map(async (item) => {
        const $ = cheerio.load(item);
        const $a = $('a');
        let link = $a.attr('href');
            link = base_url + link;

        const cache = await ctx.cache.get(link);
        if (cache) {
            return Promise.resolve(JSON.parse(cache));
        }

        const response = await got({
            method: 'get',
            url: link,
        });

        const single = {
            title: $a.text(),
            description: ProcessFeed(response.data),
            link,
        };

        ctx.cache.set(link, JSON.stringify(single));
        return Promise.resolve(single);
    })
);

ctx.state.data = {
    title: '中国工业化和信息部',
    link: 'http://www.miit.gov.cn',
    description: '文件公示',
    item: items,
};
}

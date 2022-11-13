const utils = require('./utils');

const rootUrl = 'https://kns.cnki.net/kcms/detail/knetsearch.aspx?sfield=au&';

module.exports = async (ctx) => {
    const { code } = ctx.params;

    const authorUrl = `${rootUrl}code=${code}`;

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(authorUrl);

    const frame = await page.waitForFrame((frame) => frame.name() === 'frame3');

    const authorName = await page.$eval('#showname', (e) => e.textContent);
    const companyHandle = await page.$x('/html/body/div[2]/div[1]/div[1]/div/div[3]/h3[1]/span/a');
    const company = await page.evaluate((el) => el.textContent, companyHandle[0]);

    const list = await frame.$eval('.bignum', (e) =>
        Array.from(e.children).map((item) => ({
            link: 'https://chn.oversea.cnki.net/' + item.children[1].getAttribute('href'),
            title: item.children[1].textContent.trim(),
        }))
    );

    await browser.close();

    const items = await Promise.all(list.map((item) => ctx.cache.tryGet(item.link, () => utils.ProcessItem(item))));

    ctx.state.data = {
        title: `知网 ${authorName} ${company}`,
        link: authorUrl,
        item: items,
    };
};

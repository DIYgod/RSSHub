const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { type = 'recommend' } = ctx.params;

    const browser = await require('@/utils/puppeteer')();

    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    // 访问指定的链接
    const link = `https://www.zaozao.run/article/${type}`;
    await page.goto(link, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.ant-list-items');
    // 渲染目标网页
    const html = await page.evaluate(
        () =>
            // 选取渲染后的 HTML
            document.body.innerHTML
    );
    // 关闭浏览器进程
    browser.close();

    const cheerio = require('cheerio');
    const $ = cheerio.load(html);
    const [list] = $('.ant-list-items');

    ctx.state.data = {
        title: `前端早早聊 - 文章`,
        link: `https://www.zaozao.run/article/${type}`,
        description: `前端早早聊 - 文章`,
        item: list.children.map((item) => {
            const it = $(item);

            return {
                title: it.attr('title'),
                link: it.attr('href'),
                author: it.find($('span[class^=recommender-name]')).text(),
                pubDate: parseDate(it.find($('span[class^=publish-time]')).text()),
            };
        }),
    };
};

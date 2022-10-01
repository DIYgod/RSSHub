const cheerio = require('cheerio');

const baseUrl = 'https://www.shuquge.com/txt/';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const id = ctx.params.id; // 小说id

    // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
    const browser = await require('@/utils/puppeteer')();
    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    // 访问指定的链接
    const link = `${baseUrl}${id}/index.html`;
    await page.goto(link);
    // 渲染目标网页
    const html = await page.evaluate(
        () =>
            // 选取渲染后的 HTML
            document.querySelector('body').innerHTML
    );
    const $ = cheerio.load(html);
    const title = $('.listmain>dl>dt').eq(0).text();
    const description = $('.intro').text();
    const cover_url = $('.cover>img').eq(0).attr('src');
    const list = $('.listmain dd').slice(0, 9);
    const chapter_item = list
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: `${baseUrl}${id}/${e.attribs.href}`,
        }))
        .get();

    const items = await Promise.all(
        chapter_item.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const page = await browser.newPage();
            await page.goto(item.link);
            // 渲染目标网页
            const responseHtml = await page.evaluate(
                () =>
                    // 选取渲染后的 HTML
                    document.querySelector('body').innerHTML
            );
            const $ = cheerio.load(responseHtml);

            const description = $('#content').html();

            const single = {
                title: item.title,
                description,
                link: item.link,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    // 关闭浏览器进程
    await browser.close();
    ctx.state.data = {
        title: `书趣阁 ${title}`,
        link: `${baseUrl}${id}/index.html`,
        image: cover_url,
        description,
        item: items,
    };
};

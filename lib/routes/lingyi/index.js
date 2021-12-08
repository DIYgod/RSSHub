const cheerio = require('cheerio');

module.exports = async (ctx) => {
    function wait(ms) {
        return new Promise((resolve) => setTimeout(() => resolve(), ms));
    }
    const categories = {
        tuijian: '编辑推荐',
        lingyishijian: '灵异事件',
        guihualianpian: '鬼话连篇',
        minjianqitan: '民间奇谈',
        qiwenyishi: '奇闻异事',
        lingyitupian: '灵异图片',
    };
    const url = `http://www.lingyi.org/topics/${ctx.params.category}`;
    let resultItem;
    let cache = await ctx.cache.get(url);
    if (cache) {
        resultItem = JSON.parse(cache);
    } else {
        // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
        const browser = await require('@/utils/puppeteer')();
        // 创建一个新的浏览器页面
        const page = await browser.newPage();
        // 访问指定的链接
        await page.goto(url);
        // 渲染目标网页
        const doc = await page.evaluate(
            // 选取渲染后的 HTML
            () => document.querySelector('body').innerHTML
        );
        const $ = cheerio.load(doc); // 使用 cheerio 加载返回的 HTML
        resultItem = $(".post-list-item")
            .map((index, li) => {
                const elem = $(li);
                return {
                    title: elem.find('h2').text(),
                    description: elem.find('.post-excerpt').text(),
                    link: elem.find('h2 a').attr('href'),
                    image: elem.find('.mobile-show > div > a > picture > img').attr('href'),
                    pubDate: elem.find('time').attr('datetime'),
                    author: elem.find('.post-list-meta-user>a>span').text(),
                };
            }).get();
        ctx.cache.set(url, JSON.stringify(resultItem));
        // 关闭浏览器进程
        await browser.close();
    }
    const out = await Promise.all(
        resultItem.map(async (link) => {
            await wait(5000);
            const pageUrl = link.link;
            cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            // 使用 RSSHub 提供的 puppeteer 工具类，初始化 Chrome 进程
            const browser = await require('@/utils/puppeteer')();
            // 创建一个新的浏览器页面
            const page = await browser.newPage();
            // 访问指定的链接
            await page.goto(pageUrl);
            // 渲染目标网页
            const doc = await page.evaluate(
                // 选取渲染后的 HTML
                () => document.querySelector('body').innerHTML
            );
            // 关闭浏览器进程
            await browser.close();
            const $1 = cheerio.load(doc); // 使用 cheerio 加载返回的 HTML
            const single = {
                pubDate: link.pubDate,
                link: link.link,
                title: link.title,
                description: $1('.entry-content').html(),
            };
            ctx.cache.set(link.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `${categories[ctx.params.category]} - 中国灵异网`,
        link: url,
        item: out,
    };
};

const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    // 获取 uid
    const { uid } = ctx.params;
    const url = 'https://www.douyin.com/user/' + uid;

    // 访问 url
    const response = await ctx.cache.tryGet(
        url,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.goto(url);
            const html = await page.evaluate(() => document.documentElement.innerHTML);
            browser.close();
            return html;
        },
        config.cache.routeExpire,
        false
    );

    // 解析 html
    const $ = cheerio.load(response);

    // 博主名称
    const spanlist = $('h1.OKOabD2C > span');
    const author = $(spanlist[spanlist.length - 1]).text();

    // 作品列表
    const list = $('li.ECMy_Zdt');

    ctx.state.data = {
        title: author,
        link: url,
        item:
            list &&
            list
                .filter((index, item) => $('img', item)[0])
                .map((index, item) => {
                    // 封面图片
                    const videoThumb = 'https:' + $('img', item)[0].attribs.src;
                    // 视频链接
                    const videoUrl = 'https:' + $('a', item)[0].attribs.href;
                    // 视频标题
                    let videoName = $('img', item)[0].attribs.alt;
                    videoName = videoName.substring(videoName.search('：') + 1);

                    return {
                        title: videoName,
                        description: `<img src="${videoThumb}">`,
                        link: videoUrl,
                        author,
                    };
                })
                .get(),
    };
};

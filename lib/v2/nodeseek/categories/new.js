// 导入必要的模组
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 从 URL 参数中获取用户名和仓库名称
    console.log("🚀 ~ file: new.js:9 ~ module.exports= ~ ctx.params:", ctx.params);
    const { category = 'daily' } = ctx.params;
    // 在此处编写您的逻辑
    const baseUrl = 'https://www.nodeseek.com';
    // 导入 puppeteer 工具类并初始化浏览器实例
    const browser = await require('@/utils/puppeteer')();
    // 打开一个新标签页
    const page = await browser.newPage();
    // 拦截所有请求
    await page.setRequestInterception(true);
    // 仅允许某些类型的请求
    page.on('request', (request) => {
        // 在这次例子，我们只允许 HTML 请求
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    // 访问目标链接
    const link = `${baseUrl}/categories/${category}`;
    // got 请求会被自动记录，
    // 但 puppeteer 请求不会
    // 所以我们需要手动记录它们
    logger.debug(`Requesting ${link}`);
    await page.goto(link, {
        // 指定页面等待载入的时间
        waitUntil: 'domcontentloaded',
    });
    // 获取页面的 HTML 内容
    const response = await page.content();
    // 关闭标签页
    page.close();

    const $ = cheerio.load(response);
    const list = $('#nsk-frame .nsk-container #nsk-body-left .post-list .post-list-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const listContent = item.find('.post-list-content').first();
            return {
                title: listContent.find('.post-title a').text(),
                link: `${baseUrl}${listContent.find('.post-title a').attr('href')}`,
                pubDate: parseDate(listContent.find('.post-info .info-last-comment-time time').attr('datetime')),
                author: listContent.find('.post-info .info-item info-author a').text(),
                category: listContent.find('.post-category a').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                // 重用浏览器实例并打开新标签页
                const page = await browser.newPage();
                // 设置请求拦截，仅允许 HTML 请求
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    request.resourceType() === 'document' ? request.continue() : request.abort();
                });

                logger.debug(`Requesting ${item.link}`);
                await page.goto(item.link, {
                    waitUntil: 'domcontentloaded',
                });
                const response = await page.content();
                // 获取 HTML 内容后关闭标签页
                page.close();

                const $ = cheerio.load(response);

                item.description = $('#nsk-frame .nsk-container #nsk-body-left .nsk-post-wrapper .nsk-post .content-item .post-content').first().html();

                return item;
            })
        )
    );

    // 不要忘记关闭浏览器实例
    browser.close();

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: `${baseUrl} 新帖子`,
        link: String(link),
        item: items,
    };
};

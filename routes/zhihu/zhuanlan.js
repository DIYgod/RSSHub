const phantom = require('phantom');
const art = require('art-template');
const path = require('path');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.on('onResourceRequested', function(requestData){});
    await page.open(`https://zhuanlan.zhihu.com/${id}`);
    const content = await page.property('content');
    await instance.exit();

    const $ = cheerio.load(content);
    const list = $(".PostListItem");

    ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `知乎专栏-${$('title').text()}`,
        lastBuildDate: new Date().toUTCString(),
        item: list && list.map((index, item) => {
            item = $(item);
            return {
                title: item.find('.PostListItem-title').text(),
                description: `内容：${item.find('.PostListItem-summary').text()}`,
                link: `https://zhuanlan.zhihu.com${item.find('.PostListItem-info a').attr('href')}`
            };
        }).get(),
    });
};
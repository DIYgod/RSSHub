const axios = require('../../utils/axios');
const cheerio = require('cheerio');


// 加载文章页
async function load(link) {
    const response = await axios.get(link.text());
    const $ = cheerio.load(response.data);

    // 解析发表日期
    const pubDate = $("div.sourinfo a").slice(2).eq(0).text();

    // 取得摘要
    const $abstract = $('span#ChDivSummary').html();
    // $abstract.removeAttr('style');
    const $author = $('div.author span').map(function (i, el) {
        // this === el
        return $(this).text();
    }).get().join(',');

    const $orgn = $('div.orgn a').text();

    // 内容重排
    const description = "<p>" + pubDate + "</p>" +
        "<p><h5>" + "作者:" + "</h5>"  + $author + "</p>" +
        "<p>" + $orgn + "</p>" +
        "<p><h5>" + "摘要:" + "</h5>"  + $abstract + "</p>";

    return {description, pubDate};
}

const ProcessFeed = async (list, caches) => await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $("title");
            // 链接为绝对链接
            const itemUrl = $("link");

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl.text(),
                guid: itemUrl.text(),
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            // const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

module.exports = {
    ProcessFeed,
};

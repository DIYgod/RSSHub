const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 获取完整文章内容
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // 提取内容
    const description = $('.wp-container').html();
    // 返回结果
    return { description };
}

const ProcessFeed = async (baseUrl, list, caches) =>
    // 使用 Promise.all() 进行 async 并发
    await Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(baseUrl, $('a').attr('href'));

            // 提取列表信息
            const single = {
                title: $('.column-news-title').text(),
                link: itemUrl,
                author: '临沂大学',
                pubDate: new Date($('.news-date-hide').text()).toUTCString(),
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));
            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
module.exports = {
    ProcessFeed,
};

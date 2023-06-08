const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// 专门定义一个function用于加载文章内容
async function load(item) {
    // 异步请求文章
    const response = await got(item.link);
    // 加载文章内容
    const $ = cheerio.load(response.data);

    // 提取内容
    item.description = $('.gp-article').html();

    // 返回解析的结果
    return item;
}

const ProcessFeed = (list, caches) => {
    const host = 'https://jwc.bit.edu.cn/tzgg/';

    return Promise.all(
        // 遍历每一篇文章
        list.map((item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), host).href;

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '教务部',
                pubDate: timezone(parseDate($('span').text()), 8),
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            return caches.tryGet(single.link, () => load(single));
        })
    );
};

module.exports = {
    ProcessFeed,
};

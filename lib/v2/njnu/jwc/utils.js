const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// 专门定义一个function用于加载文章内容
async function load(link) {
    // 异步请求文章
    const response = await got.get(link, {
        https: {
            rejectUnauthorized: false,
        },
    });
    // 加载文章内容
    const $ = cheerio.load(response.data);
    const dateStr = $('span+ span').text();
    // 解析日期
    const pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD', 'zh-cn'), +8);
    // 提取内容
    const description = $('form > div').html();

    // 返回解析的结果
    return { description, pubDate };
}

const ProcessFeed = async (list, caches) => {
    const host = 'http://jwc.njnu.edu.cn/';

    // 使用 Promise.all() 进行 async 并发
    return await Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), host);

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '教务处',
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );
};

module.exports = {
    ProcessFeed,
};

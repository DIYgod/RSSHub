const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite'); // 转码
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

// 完整文章页
async function load(link) {
    const response = await got.get(link, {
        responseType: 'buffer',
    });

    const data = iconv.decode(response.data, 'gb2312'); // 转码

    // 加载文章内容
    const $ = cheerio.load(data);

    // 解析日期
    const pubDate = timezone(
        parseDate(
            $('.article')
                .text()
                .match(/\d{4}\/\d{2}\/\d{2}/)
        ),
        +8
    );

    // 提取内容
    const description = $('.article_con').html();

    // 返回解析的结果
    return { description, pubDate };
}

const ProcessFeed = (base, list, caches) =>
    Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), base).href; // 感谢@hoilc指导

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '绿色新闻网',
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );
module.exports = {
    ProcessFeed,
};

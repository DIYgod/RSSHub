const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const iconv = require('iconv-lite');

// 专门定义一个function用于加载文章内容
async function load(link) {
    // 异步请求文章
    const response = await got({
        method: 'get',
        url: link,
        responseType: 'buffer',
        headers: {
            Referer: 'http://www3.gdou.edu.cn/jwc/',
        },
    });

    // 加载文章内容
    // 先将HTML-buffer转为gb2312
    const data = iconv.decode(response.data, 'gb2312');
    const $ = cheerio.load(data);

    // 解析日期
    const date = new Date(
        $('.info')
            .text()
            .match(/\d{4}\/\d{1,2}\/\d{1,2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    // 提取内容
    const description = $('.left01').html();

    // 返回解析的结果
    return { description, pubDate };
}

const ProcessFeed = (list, caches) => {
    const host = 'http://www3.gdou.edu.cn/';

    return Promise.all(
        // 遍历每一篇文章
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(host, $title.attr('href'));

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: '教务部',
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};

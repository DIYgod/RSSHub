const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 加载文章页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // 解析日期
    const date = new Date(
        $('.meta>span:first-child')
            .text()
            .match(/\d{4}.\d{2}.\d{2}. \d{2}:\d{2}/)[0]
            .replace(/年|月/g, '-')
            .replace(/日/g, '')
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    // 还原图片地址
    $('img').each((index, elem) => {
        const $elem = $(elem);
        const src = $elem.attr('data-original');
        if (src && src !== '') {
            $elem.attr('src', `${src}`);
        }
        $elem.attr('referrerpolicy', 'no-referrer');
    });

    // 提取内容
    const description = $('.article-summary p').html() + '<br>' + $('.article-content').html();

    // 稿源
    const author = $('.source a span').text();

    return { description, pubDate, author };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.cnbeta.com/';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('dl dt a');
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(host, $title.attr('href'));

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                // author: $('.nickname').text(),
                guid: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};

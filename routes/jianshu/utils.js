const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

// 加载文章页
async function load(link) {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    // 解析日期
    const date = new Date(
        $('.publish-time')
            .text()
            .match(/\d{4}.\d{2}.\d{2} \d{2}:\d{2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    // 还原图片地址
    $('img').each((index, elem) => {
        const $elem = $(elem);
        const src = $elem.attr('data-original-src');
        if (src && src !== '') {
            $elem.attr('src', `https:${src}`);
        }
        $elem.attr('referrerpolicy', 'no-referrer');
    });
    // 去除样式
    $('.image-container, .image-container-fill').removeAttr('style');
    // 处理视频
    $('.video-package').each((index, elem) => {
        const $item = $(elem);
        const desc = $item.find('.video-description').html();
        const url = $item.attr('data-video-url');

        $item.html(`
            <p>${desc}</p>
            <iframe frameborder="0" src="${url}" allowFullScreen="true"></iframe>
        `);
    });
    // 提取内容
    const description = $('.show-content-free').html();

    return { description, pubDate };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.jianshu.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.title');
            // 还原相对链接为绝对链接
            const itemUrl = url.resolve(host, $title.attr('href'));

            // 列表上提取到的信息
            const single = {
                title: $title.text(),
                link: itemUrl,
                author: $('.nickname').text(),
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

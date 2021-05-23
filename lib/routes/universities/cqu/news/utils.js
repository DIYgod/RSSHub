const got = require('@/utils/got');
const cheerio = require('cheerio');

// 加载文章页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // 提取内容
    const description = $('.dinfo').html() + $('.acontent').html();

    return { description };
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title1 = $('.title a').eq(0);
            const $title2 = $('.title a').eq(1);
            let itemUrl = $title2.attr('href');
            let title = $title1.text() + ' - ' + $title2.text();

            if (typeof itemUrl === 'undefined') {
                itemUrl = $title1.attr('href');
                title = $title1.text();
            }

            // 列表上提取到的信息
            const single = {
                title: title,
                link: itemUrl,
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

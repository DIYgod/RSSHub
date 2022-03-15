const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

// 加载文章页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const date = parseDate($('.time').text(), 'YYYY-MM-DD HH:mm');

    const pubDate = timezone(date, +8);

    // 提取内容
    const description = $('#News_Body_Txt_A').html();

    return { description, pubDate };
}

const ProcessFeed = (list, caches) => {
    const host = 'https://www.fmprc.gov.cn/web/wjdt_674879/fyrbt_674889/';

    return Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('a');
            // 还原相对链接为绝对链接
            const itemUrl = new URL($title.attr('href'), host);

            // 列表上提取到的信息
            const single = {
                title: $.text(),
                link: itemUrl,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return { ...single, ...other };
        })
    );
};

module.exports = {
    ProcessFeed,
};

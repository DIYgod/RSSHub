const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

// 处理文章全文
async function load(link) {
    const responce = await got.get(link);
    const $ = cheerio.load(responce.data);
    // 解析日期
    const date = new Date(
        $('h6[style]')
            .text()
            .replace('年', '-')
            .replace('月', '-')
            .replace('日', '')
            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    );
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
    // 提取正文
    const description = $('div[id^=vsb_content]').html();

    return { description, pubDate };
}

const ProcessFeed = async (list, cache) => {
    const host = 'http://news.bwu.edu.cn/';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('span[class=showTitle] a');
            const source = $('span[class=showSource] a').text();
            const link = url.resolve(host, $title.attr('href'));

            const single = {
                title: $title.attr('title'),
                link: link,
                author: source,
                guid: link,
            };
            // 尝试使用缓存
            const other = await cache.tryGet(link, async () => await load(link));
            // 返回文章信息
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
};

module.exports = {
    ProcessFeed,
};

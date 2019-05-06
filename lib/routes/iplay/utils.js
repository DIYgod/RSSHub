const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

async function load(link) {
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    // 处理日期
    const datestr = $('.entry-meta li')
        .text()
        .match(/生产日期：异次纪元 ([\s\S]*?秒)/)[1]
        .match(/(\d{1,2})/gm);
    for (let i = 1; i < datestr.length; i++) {
        datestr[i] = datestr[i].padStart(2, '0');
    }
    const date = new Date('20' + datestr[0] + '-' + datestr[1] + '-' + datestr[2] + ' ' + datestr[3] + ':' + datestr[4] + ':' + datestr[5]);
    const timeZone = 8;
    const serverOffset = date.getTimezoneOffset() / 60;
    const pubDate = new Date(date.getTime() - 60 * 60 * 1000 * (timeZone + serverOffset)).toUTCString();
    // 提取详情
    const description = $('.entry-content').html();
    return { description, pubDate };
    // return { description };
}

const ProcessFeed = async (list, caches) => {
    const host = 'https://www.iplaysoft.com/';
    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $title = $('a');
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

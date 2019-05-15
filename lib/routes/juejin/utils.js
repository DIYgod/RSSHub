const axios = require('@/utils/axios');
const cheerio = require('cheerio');

// 加载文章页
async function load(link) {
    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });
    const $ = cheerio.load(response.data);

    // 解析日期
    const date = new Date($('time').attr('datetime'));
    const timeZone = 8 * 60;
    const serverOffset = date.getTimezoneOffset();
    const pubDate = new Date(date.getTime() + 60 * 1000 * (timeZone + serverOffset)).toUTCString();

    // 提取内容
    const description = $('.article-content')
        .html()
        .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')
        .replace(/(<img.*?)(data-src)(.*?>)/g, '$1src$3');

    return { description, pubDate };
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            // 列表上提取到的信息
            const single = {
                title: item.title,
                description: `${(item.content || item.summaryInfo || '无描述').replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')}`,
                pubDate: new Date(item.createdAt).toUTCString(),
                author: item.user.username,
                link: item.originalUrl,
                guid: item.originalUrl,
            };

            if (item.type === 'post') {
                // 使用tryGet方法从缓存获取内容。
                // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
                const other = await caches.tryGet(item.originalUrl, async () => await load(item.originalUrl));
                // 合并解析后的结果集作为该篇文章最终的输出结果
                return Promise.resolve(Object.assign({}, single, other));
            } else {
                return Promise.resolve(single);
            }
        })
    );

module.exports = {
    ProcessFeed,
};

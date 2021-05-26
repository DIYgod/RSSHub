const got = require('@/utils/got');
const cheerio = require('cheerio');
const util = require('./utils');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const response = await got({
        method: 'get',
        url: `https://www.meipai.com/user/${uid}`,
        headers: {
            Referer: 'https://www.meipai.com/',
        },
    });
    const data = response.data;

    const $ = cheerio.load(data); // 使用 cheerio 加载返回的 HTML
    const list = $('#mediasList').find('li').get();
    const name = $('.feed-left .content-l-h2').text();

    const result = await util.ProcessFeed(list, ctx.cache);

    // 使用 cheerio 选择器，选择 class="note-list" 下的所有 "li"元素，返回 cheerio node 对象数组
    // cheerio get() 方法将 cheerio node 对象数组转换为 node 对象数组

    // 注：每一个 cheerio node 对应一个 HTML DOM
    // 注：cheerio 选择器与 jquery 选择器几乎相同
    // 参考 cheerio 文档：https://cheerio.js.org/

    ctx.state.data = {
        title: `${name}又有更新了`,
        link: `https://www.meipai.com/user/${uid}/`,
        description: `${name}`,
        item: result,
    };
};

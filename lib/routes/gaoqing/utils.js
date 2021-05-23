const got = require('@/utils/got');
const cheerio = require('cheerio');

// 加载详情页
async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    // 提取标题
    const title = $('#mainrow > div:nth-child(2) > div.col-md-9 > div.row > div.col-md-12').html();

    // 提取图片
    const img = $('.x-m-poster').html();

    // 提取资料
    $('#viewfilm').find('img').remove();
    const info = $('#viewfilm').html();

    // 提取简介
    const intro = $('#des-ex').html() || $('#des-full').html();

    // 合并为描述
    const description = title + img + info + intro;

    return { description };
}

const ProcessFeed = async (list, caches) =>
    await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            // 获取链接
            const $title = $('div.item-desc.pull-left > p > a');
            const itemUrl = $title.attr('href');

            // 获取评分
            const rate = $('div.item-desc.pull-left > p > span').text();

            // 列表上提取到的信息
            const single = {
                title: $title.text() + ' - ' + rate,
                link: itemUrl,
                guid: itemUrl,
            };

            // 缓存
            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            // 合并结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );

module.exports = {
    ProcessFeed,
};

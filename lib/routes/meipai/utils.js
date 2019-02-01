const cheerio = require('cheerio');
const url = require('url');

const ProcessFeed = async (list) => {
    const host = 'https://www.meipai.com';

    return await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const $title = $('.detail-cover-title');
            const $desciption = $('.feed-description');

            // 详情页面的地址（视频页面地址）
            const itemUrl = url.resolve(host, $desciption.attr('href'));

            // RSS内容（美拍提供了友好的网页版视频展示）
            const imgSrc = $('.feed-v-wrap img').attr('src');
            const text = $desciption.text() + `<a href="${itemUrl}"><img src="https:${imgSrc}" /></a>`;

            // 列表上提取到的信息
            return {
                title: $title.text(),
                description: text,
                link: itemUrl,
                author: $('.feed-name').text(),
                guid: itemUrl,
            };
        })
    );
};

module.exports = {
    ProcessFeed,
};

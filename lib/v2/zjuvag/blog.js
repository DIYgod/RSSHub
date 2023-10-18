// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://zjuvag.org/blog/';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const items = $('div.post-preview-container')
        .find('.post-preview')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            return {
                title: item.find('a').first().text(),
                link: `https://zjuvag.org${item.find('a').first().attr('href')}`,
                pubDate: timezone(parseDate(item.find('.post-time').text(), 'YYYY-MM-DD'), 0),
                author: item.find('.tag').first().text(),
            };
        });

    ctx.state.data = {
        // 在此处输出您的 RSS
        title: '浙江大学可视分析小组博客',
        link: 'https://zjuvag.org/blog/',
        item: items,
    };
};

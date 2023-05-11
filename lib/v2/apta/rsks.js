// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑
    const baseUrl = 'http://www.apta.gov.cn';
    const { fenlei = 'Officer' } = ctx.params;

    const { data: response } = await got(`${baseUrl}/${fenlei}/ExamList`);
    const $ = cheerio.load(response);

    // 我们使用 Cheerio 选择器选择所有带类名“js-navigation-container”的“div”元素，
    // 其中包含带类名“flex-auto”的子元素。
    const items = $('div.js-navigation-container .flex-auto')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('relative-time').attr('datetime')),
                author: item.find('.opened-by a').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });

    ctx.state.data = {
        // 在此处输出您的 RSS
        // 源标题
        title: `${fenlei} `,
        // 源链接
        link: `${baseUrl}/${fenlei}/ExamList`,
        // 源文章
        item: items,
    };
};

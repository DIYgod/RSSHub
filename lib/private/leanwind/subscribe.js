// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑
    const baseUrl = 'https://www.leanwind.com/mechatronics/cae';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    const list = $('div.site-content .content')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const pubDate = parseDate(item.find('.date').first().text(), 'YYYY年 MM月 DD日');
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate
            };
        });
    // 添加全文
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.content-main').first().html();
                return item;
            })
        )
    );

    ctx.state.data = {
        // 源标题
        title: '坐倚北风CAE文章',
        // 源链接
        link: 'https://www.leanwind.com/mechatronics/cae',
        // 源文章
        item: items,
    };
};

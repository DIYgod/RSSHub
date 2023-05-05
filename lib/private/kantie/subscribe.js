// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
// const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑
    const baseUrl = 'https://kantie.org/';
    const { data: response } = await got(`${baseUrl}topics/today`);
    const $ = cheerio.load(response);

    const list = $('div.items .item')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a.content').first();
            const pubDate = '';
            return {
                title: a.find('.title').text(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate,
            };
        });

        const items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = cheerio.load(response);
                    // 选择类名为“comment-body”的第一个元素
                    item.description = $('.large').first().html();
                    // 上面每个列表项的每个属性都在此重用，
                    // 并增加了一个新属性“description”
                    return item;
                })
            )
        );

    ctx.state.data = {
        // 源标题
        title: '看贴神器-每日新帖',
        // 源链接
        link: 'https://kantie.org/topics/today',
        // 源文章
        item: items,
    };
};

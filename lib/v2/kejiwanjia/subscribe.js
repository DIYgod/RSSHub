// 导入必要的模组
const got = require('@/utils/got'); // 自订的 got
const cheerio = require('cheerio'); // 可以使用类似 jQuery 的 API HTML 解析器
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    // 在此处编写您的逻辑
    const baseUrl = 'https://www.kejiwanjia.com/jingxuanpost';
    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response);

    // 我们使用 Cheerio 选择器选择所有带类名“js-navigation-container”的“div”元素，
    // 其中包含带类名“flex-auto”的子元素。
    const list = $('div.post-list .post-info')
        // 使用“toArray()”方法将选择的所有 DOM 元素以数组的形式返回。
        .toArray()
        // 使用“map()”方法遍历数组，并从每个元素中解析需要的数据。
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: a.attr('href'),
                pubDate: parseDate(item.find('.b2timeago').attr('datetime')),
                author: item.find('.list-footer a').text(),
                // description: item.find('.post-excerpt').text(),
                category: item
                    .find('a[id^=label]')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        });
    // 添加全文
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                // 选择类名为“comment-body”的第一个元素
                item.description = $('.entry-content').first().html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );

    ctx.state.data = {
        // 源标题
        title: `科技玩家精选`,
        // 源链接
        link: `https://www.kejiwanjia.com/jingxuanpost`,
        // 源文章
        item: items,
    };
};

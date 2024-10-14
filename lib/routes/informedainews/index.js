const got = require('@/utils/got');
const logger = require('@/utils/logger');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { type } = ctx.param();
    logger('type: ' + type);
    const response = await got.get(`https://informedainews.com/zh-Hans/docs/${type}`);
    const $ = cheerio.load(response.data);
    const list = $('li.theme-doc-sidebar-item-category ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            const text = a.text();
            // 找到第一个'('字符的位置
            const start = text.indexOf('(');
            // 找到第一个')'字符的位置
            const end = text.indexOf(')');
            // 从第一个'('到第一个')'之间的子字符串就是日期
            const date = text.substring(start + 1, end);
            return {
                title: text,
                link: `https://informedainews.com${a.attr('href')}`,
                pubDate: parseDate(date),
                author: 'AI',
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got.get(item.link);
                const $ = cheerio.load(response.data);

                // 选择类名为“comment-body”的第一个元素
                item.description = $('.theme-doc-markdown.markdown').first().html();

                // 上面每个列表项的每个属性都在此重用，
                // 并增加了一个新属性“description”
                return item;
            })
        )
    );
    ctx.state.data = {
        // 源标题
        title: `${type} docs`,
        // 源链接
        link: `https://informedainews.com/zh-Hans/docs/${type}`,
        // 源文章
        item: items,
    };

};

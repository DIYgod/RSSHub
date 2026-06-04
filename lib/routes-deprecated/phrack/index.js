const cheerio = require('cheerio');
const got = require('@/utils/got');
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.phrack.org/',
    });

    const data = response.data;
    let $ = cheerio.load(data);
    const a = $('a[title="Paper Feed"]');
    const url = 'http://www.phrack.org/' + a.attr('href');
    const feed_data = await ctx.cache.tryGet(url, async () => {
        const result = await got.get(url);

        return result.data;
    });

    $ = cheerio.load(feed_data); // 使用 cheerio 加载返回的 HTML

    ctx.state.data = {
        title: 'phrack', // 项目的标题
        link: 'http://www.phrack.org/', // 指向项目的链接
        description: 'phrack magazine', // 描述项目
        allowEmpty: false, // 默认 false，设为 true 可以允许 item 为空
        item: [
            // 其中一篇文章或一项内容
            {
                title: $('div[id="article"]').text(), // 文章标题
                author: '', // 文章作者
                category: '', // 文章分类
                // category: [''], // 多个分类
                description: $('div[class="around"]').children().first().next().children('pre').text(), // 文章摘要或全文
                pubDate: '', // 文章发布时间
                link: url, // 指向文章的链接
            },
        ],
    };
};

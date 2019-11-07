const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {

    const now =  Math.round(new Date().getTime());
    const response = await got.get(`http://365jia.cn/news/index2019/list?page=1&id=22504014&_=${now}`);

    const $ = cheerio.load(response);


    const items = await Promise.all(
        list.map(async (e) => {
            if (e.link && !e.link.match(/^https?:\/\//)) {
                if (e.link.match(/^\/\//)) {
                    e.link = 'http:' + e.link;
                } else {
                    e.link = 'http://' + e.link;
                }
            }
            const response = await ctx.cache.tryGet(e.link, async () => (await got.get(e.link)).data);
            const $ = cheerio.load(response);

            const article = $('#mp-editor');

            article.find('#backsohucom, p[data-role="editor-name"]').each((i, e) => {
                $(e).remove();
            });

            const single = {
                title: e.title,
                link: e.link,
                description: article.html(),
                pubDate: date(e.publicTimeStr, 8),
                author,
            };

            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `搜狐号 - ${author}`,
        link,
        description: '',
        item: items,
    };
};

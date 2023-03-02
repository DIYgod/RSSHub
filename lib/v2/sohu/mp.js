const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const authorArticleAPI = `https://v2.sohu.com/author-page-api/author-articles/pc/${id}`;

    const response = await got.get(authorArticleAPI);
    const list = response.data.data.pcArticleVOS.splice(0, 10);
    let author, link;

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

            if (!author) {
                const meta = $('span[data-role="original-link"]');
                author = meta.find('a').text();
                // can't get author's link on server, so use the RSSHub link
                // link = meta.attr('href').split('==')[0];
            }

            const article = $('#mp-editor');

            article.find('#backsohucom, p[data-role="editor-name"]').each((i, e) => {
                $(e).remove();
            });

            const single = {
                title: e.title,
                link: e.link,
                description: article.html(),
                pubDate: parseDate(e.publicTime),
                author,
            };

            return single;
        })
    );

    ctx.state.data = {
        title: `搜狐号 - ${author}`,
        link,
        description: '',
        item: items,
    };
};

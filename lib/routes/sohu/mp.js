import got from '~/utils/got.js';
import cheerio from 'cheerio';
import date from '~/utils/date.js';

export default async (ctx) => {
    const { id } = ctx.params;

    const response = await got.get(`https://v2.sohu.com/author-page-api/author-articles/pc/${id}`);

    const list = response.data.data.pcArticleVOS.splice(0, 10);
    let author;
    let link;

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
                const meta = $('#article-container h4 > a');
                author = meta.text();
                [link] = meta.attr('href').split('==');
            }

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

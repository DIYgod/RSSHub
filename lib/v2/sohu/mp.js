const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const authorArticleAPI = `https://v2.sohu.com/author-page-api/author-articles/pc/${id}`;

    const response = await got(authorArticleAPI);
    const list = response.data.data.pcArticleVOS.map((item) => ({
        title: item.title,
        link: item.link.startsWith('http') ? item.link : `https://${item.link}`,
        pubDate: parseDate(item.publicTime),
    }));
    let author, link;

    const items = await Promise.all(
        list.map((e) =>
            ctx.cache.tryGet(e.link, async () => {
                const { data: response } = await got(e.link);
                const $ = cheerio.load(response);

                if (!author) {
                    const meta = $('span[data-role="original-link"]');
                    author = meta.find('a').text();
                    // can't get author's link on server, so use the RSSHub link
                    // link = meta.attr('href').split('==')[0];
                }

                if (/window\.sohu_mp\.article_video/.test($('script').text())) {
                    const videoSrc = $('script')
                        .text()
                        .match(/\s*url: "(.*?)",/)?.[1];
                    e.description = art(path.join(__dirname, 'templates/video.art'), {
                        poster: $('script')
                            .text()
                            .match(/cover: "(.*?)",/)?.[1],
                        src: videoSrc,
                        type: videoSrc?.split('.').pop().toLowerCase(),
                    });
                } else {
                    const article = $('#mp-editor');

                    article.find('#backsohucom, p[data-role="editor-name"]').each((i, e) => {
                        $(e).remove();
                    });

                    e.description = article.html();
                }

                e.author = author;

                return e;
            })
        )
    );

    ctx.state.data = {
        title: `搜狐号 - ${author}`,
        link,
        item: items,
    };
};

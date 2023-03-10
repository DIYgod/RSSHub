const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { cat } = ctx.params;

    const baseUrl = 'https://vcb-s.com';
    const currentUrl = cat ? `${baseUrl}/archives/category/${cat}` : `${baseUrl}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const articleLinks = $('div.title-article>h1>a')
        .toArray()
        .map((a) => $(a).attr('href'));

    const items = await Promise.all(
        articleLinks.map((link) =>
            ctx.cache.tryGet(link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: link,
                });

                const $$ = cheerio.load(detailResponse.data);

                const title = $$('div.title-article>h1>a').text().trim();
                const pubDate = $$('div.tag-article>span').eq(0).text().trim();
                const author = $$('div.tag-article a[rel="author"]').text().trim();
                const content = $$('div.centent-article')
                    .html()
                    .replace(/<div.+?abh_box[\w\W]+/g, '')
                    .replace(/<p.+?medie-info-switch[\w\W]+/g, '')
                    .replace(/<div.+?dw-box-download.+?>([\w\W]+?)<\/div>/g, '<pre>$1</pre>');

                return {
                    title,
                    link,
                    description: content,
                    author,
                    pubDate: timezone(parseDate(`20${pubDate}`, 'YYYY-M-D'), +8),
                };
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        image: `${baseUrl}/wp-content/customRes/favicon@180.png`,
        item: items,
    };
};

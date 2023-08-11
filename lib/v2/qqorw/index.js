const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 10;

    const rootUrl = 'https://qqorw.cn';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('article.excerpt')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text(),
                link: a.prop('href'),
                description: item.find('span.note').text(),
                category: item
                    .find('a.label')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: timezone(parseDate(item.find('p.auth-span span.muted').first().text().trim()), +8),
                upvotes: item.find('span.count').text() ? parseInt(item.find('span.count').text(), 10) : 0,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div.contenttxt').prev().nextAll().remove();

                item.title = content('h1.article-title').text();
                item.description = content('article.article-content').html();
                item.author = content('i.fa-user').parent().text().trim();
                item.category = content('#mute-category')
                    .toArray()
                    .map((c) => content(c).text().trim());
                item.pubDate = item.pubDate ?? parseDate(content('i.fa-clock-o').parent().text().trim());
                item.upvotes = content('#Addlike span.count').text() ? parseInt(content('#Addlike span.count').text(), 10) : item.upvotes;

                return item;
            })
        )
    );

    const author = '早报网';
    const icon = new URL('favicon.ico', rootUrl).href;
    const title = $('header.archive-header h1 a').last().text();

    ctx.state.data = {
        item: items,
        title: `${author}${title ? ` - ${title}` : ''}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: new URL($('h1.site-title a img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
    };
};

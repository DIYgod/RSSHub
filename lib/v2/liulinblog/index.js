const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { params } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 20;

    const rootUrl = 'https://www.liulinblog.com';
    const currentUrl = params ? new URL(params, rootUrl).href : rootUrl;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('div.scroll')
        .first()
        .find('article')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2.entry-title a');

            return {
                title: a.prop('title'),
                link: a.prop('href'),
                description: item.find('div.entry-excerpt').html(),
                author: item
                    .find('span.meta-author a')
                    .toArray()
                    .map((a) => $(a).prop('title'))
                    .join(' / '),
                category: item
                    .find('span.meta-category-dot a[rel="category"]')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `liulinblog-${item.prop('id')}`,
                pubDate: parseDate(item.find('span.meta-date time').prop('datetime')),
                comments: item.find('span.meta-comment').text() ? parseInt(item.find('span.meta-comment').text().trim(), 10) : 0,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);

                content('div[role="alert"]').remove();

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = content('div.entry-content').html();
                item.author = content('div.entry-meta')
                    .first()
                    .find('span.meta-author a')
                    .toArray()
                    .map((a) => content(a).prop('title'))
                    .join(' / ');
                item.category = content('div.entry-meta')
                    .first()
                    .find('span.meta-category a[rel="category"]')
                    .toArray()
                    .map((c) => content(c).text());
                item.guid = `liulinblog-${content('article').first().prop('id')}`;
                item.pubDate = parseDate(content('span.meta-date time').first().prop('datetime'));
                item.comments = content('h3.comments-title').text()
                    ? parseInt(
                          content('h3.comments-title')
                              .text()
                              .match(/\((\d+)\)/),
                          10
                      )
                    : 0;

                return item;
            })
        )
    );

    const icon = $('link[rel="icon"]').prop('href');
    const title = $('img.logo').prop('alt');

    ctx.state.data = {
        item: items,
        title: `${title} - ${params ? $('h1.term-title').text().split('搜索到')[0] : '最新'}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: $('img.logo').prop('src'),
        icon,
        logo: icon,
        subtitle: $('p.term-description').text(),
        author: title,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { category = '' } = ctx.params;
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 50;

    const rootUrl = 'https://www.jiemian.com';
    const currentUrl = new URL(category ? `${category}.html` : '', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = cheerio.load(response);

    let items = $('a.logStore, a[aid], div.title a, div.news-header a')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.prop('href'),
            };
        })
        .filter((item) => item.link && !item.link.startsWith(new URL('special', rootUrl).href));

    items = await Promise.all(
        items.slice(0, limit).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = cheerio.load(detailResponse);
                const image = content('div.article-img img').first();
                const video = content('#video-player').first();

                item.title = content('div.article-header h1').text();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: image
                        ? {
                              src: image.prop('src'),
                              alt: image.next('p').text() || item.title,
                          }
                        : undefined,
                    video: video
                        ? {
                              src: video.prop('data-url'),
                              poster: video.prop('data-poster'),
                              width: video.prop('width'),
                              height: video.prop('height'),
                          }
                        : undefined,
                    intro: content('div.article-header p').text(),
                    description: content('div.article-content').html(),
                });
                item.author = content('span.author')
                    .first()
                    .find('a')
                    .toArray()
                    .map((a) => content(a).text())
                    .join('/');
                item.category = content('meta.meta-container a')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('div.article-info span[data-article-publish-time]').prop('data-article-publish-time'), 'X');
                item.upvotes = content('span.opt-praise__count').text() ? parseInt(content('span.opt-praise__count').text(), 10) : 0;
                item.comments = content('span.opt-comment__count').text() ? parseInt(content('span.opt-comment__count').text(), 10) : 0;

                return item;
            })
        )
    );

    const title = $('title').text();
    const titleSplits = title.split(/_/);
    const image = $('div.logo img').prop('src');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    ctx.state.data = {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: titleSplits[0],
        author: titleSplits.pop(),
    };
};

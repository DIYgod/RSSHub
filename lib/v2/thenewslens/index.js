const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.thenewslens.com';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '/latest-article' : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('h1.title').remove();

    let items = $('.regular-article-list, #list-container, .list-container')
        .find('.article-title, .title')
        .find('a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: /\/article\//.test(link) ? `${link}/fullpage` : link,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#salon_comment_widget-anchor').remove();
                content('ad2-recommender, footer, noscript').remove();
                content('a[data-sk="tooltip_parent"]').parent().remove();
                content('.ad-section, .recommender-title, .navigation-content').remove();

                content('.article-img-container').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: content(this).find('img')?.attr('data-srcset').split('?')[0] ?? undefined,
                        })
                    );
                });

                item.author = content('meta[property="article:author"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));
                item.category = content('meta[property="article:tag"]')
                    .toArray()
                    .map((t) => content(t).attr('content'));
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('meta[property="og:image"]')?.attr('content').split('?')[0] ?? undefined,
                    description: content('.article-main-box, article[itemprop="articleBody"]').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

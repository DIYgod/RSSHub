const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const params = ctx.path;
    const isWork = params.indexOf('/work') === 0;

    const rootUrl = 'https://www.logonews.cn';
    const currentUrl = `${rootUrl}${params === '/' ? '' : params}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $(isWork ? 'h2 a' : 'a.article-link')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: item.attr('href'),
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

                content('.iconfont').remove();

                content('img[data-src]').each(function () {
                    content(this).attr(
                        'src',
                        content(this)
                            .attr('data-src')
                            .replace(/_logonews/, '')
                    );
                });

                item.title = content('title').text();
                item.author = content('.author-links').text();
                item.pubDate = parseDate(content('meta[property="og:release_date"]').attr('content'));
                item.category = content('a.category_link, a[rel="tag"]')
                    .toArray()
                    .map((c) => content(c).text().replace(/ · /g, ''));

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    isWork,
                    image: content('meta[property="og:image"]').attr('content'),
                    description: content('.This_Article_content, .w_info').html(),
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

const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.sinchew.com.my';
    const currentUrl = `${rootUrl}${ctx.path === '/' ? '' : ctx.path}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.title .internalLink')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.attr('data-title'),
                link: /^http/.test(link) ? link : `${rootUrl}${link}`,
                pubDate: timezone(parseDate(item.text()), +8),
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

                content('.ads-frame, .read-more-msg').remove();

                content('figure').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/images.art'), {
                            image: content(this).find('img').attr('src'),
                            caption: content(this).find('figcaption').text(),
                        })
                    );
                });

                item.description = content('.article-page-content').html();
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);

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

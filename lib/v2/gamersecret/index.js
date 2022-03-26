const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const type = ctx.params.type ?? 'latest-news';
    const category = ctx.params.category ?? '';

    const rootUrl = 'https://www.gamersecret.com';
    const currentUrl = `${rootUrl}/${type}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.jeg_post_title a')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
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

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-src'));
                });

                item.author = content('.jeg_meta_author').text().replace(/by/, '');
                item.pubDate = timezone(parseDate(detailResponse.data.match(/datePublished":"(.*)","dateModified/)[1]), +8);
                item.description = content('.thumbnail-container').html() + content('.elementor-text-editor, .content-inner').html();

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

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const language = ctx.params.language || '';

    const rootUrl = 'https://www.z-z-z.vip';
    const currentUrl = `${rootUrl}${language ? `/${language}` : ''}/${category === 'all' ? '' : `post/category/${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.blog-entry-title a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                content('amp-img').each(function () {
                    content(this)
                        .parent()
                        .append(`<img src="${content(this).attr('src')}">`);
                });

                content('amp-img').remove();

                item.description = content('.entry-content').html();
                item.pubDate = new Date(detailResponse.data.match(/"datePublished":"(.*)","dateModified"/)[1]);

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

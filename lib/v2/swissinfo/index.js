const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'eng';
    const category = ctx.params.category ?? 'latest-news';

    const rootUrl = 'https://www.swissinfo.ch';
    const currentUrl = `${rootUrl}/${language}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = cheerio.load(response.data);

    const title = $('title').text();

    const fragmentResponse = await got({
        method: 'get',
        url: `${rootUrl}${$('main div[data-fragment-placeholder]').attr('data-fragment-placeholder')}`,
    });

    $ = cheerio.load(fragmentResponse.data);

    let items = $('.si-teaser__link')
        .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
                title: item.find('.si-teaser__title').text(),
                pubDate: parseDate(item.find('.si-teaser__date').attr('datetime')),
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

                content('picture').each(function () {
                    content(this).html(`<img src="${content(this).find('source').first().attr('srcset')}">`);
                });

                item.description = content('.si-detail__content').html();
                item.author = content('meta[name="author"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title,
        link: currentUrl,
        item: items,
    };
};

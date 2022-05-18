const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const common = ctx.params.common ?? 'world';
    const rootUrl = 'https://www.reuters.com';
    let category;

    if (common === 'authors') {
        category = ctx.params.category ?? 'reuters';
    } else {
        category = ctx.params.category ?? '';
    }
    const currentUrl = category ? `${rootUrl}/${common}/${category}/` : `${rootUrl}/${common}/`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    const list = $('.media-story-card__body__3tRWy a.media-story-card__heading__eqhp9')
        .map((_, item) => {
            item = $(item);
            item.find('span.visually-hidden__hidden__2qXMW').remove();
            return {
                title: item.text(),
                link: rootUrl + item.prop('href'),
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                item.description = content('p[data-testid="paragraph-0"]').text();
                item.pubDate = parseDate(content('meta[name="article:published_time"]').attr('content'));
                item.author = content('meta[name="article:author"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: category ? `Reuters - ${common} - ${category}` : `Reuters - ${common}`,
        link: currentUrl,
        item: items,
    };
};

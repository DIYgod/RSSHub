const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const navigation = ctx.params.navigation ?? 'world';
    const rootUrl = 'https://www.reuters.com';
    let category;

    if (navigation === 'authors') {
        category = ctx.params.category ?? 'reuters';
    }
    else {
        category = ctx.params.category ?? '';
    }
    const currentUrl = category ? `${rootUrl}/${navigation}/${category}/` : `${rootUrl}/${navigation}/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
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
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                item.description = content('p[data-testid="paragraph-0"]').text();
                item.pubDate = parseDate(content('meta[name="article:published_time"]').attr('content'));
                item.author = content('meta[name="article:author"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `Reuters ${navigation} ${category}`,
        link: currentUrl,
        description: `Reuters ${navigation} ${category}`,
        item: items,
    };
};

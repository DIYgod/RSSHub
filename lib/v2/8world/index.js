const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'realtime';

    const rootUrl = 'https://www.8world.com';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('div[data-column="Two-Third"] .article-title .article-link')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
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

                item.description = content('.text-long').html();
                item.title = content('meta[name="cXenseParse:mdc-title"]').attr('content');
                item.author = content('meta[name="cXenseParse:author"]').attr('content');
                item.pubDate = parseDate(content('meta[name="cXenseParse:recs:publishtime"]').attr('content'));
                item.category = content('meta[name="cXenseParse:mdc-keywords"]')
                    .toArray()
                    .map((keyword) => content(keyword).attr('content'));

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

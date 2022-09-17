const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';
    const id = ctx.params.id ?? '';

    const rootUrl = 'https://hotchina.news';
    const currentUrl = `${rootUrl}${category && id ? `/archives/${category}/${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.title')
        .map((_, item) => {
            item = $(item);

            const a = item.find('a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.next().find('.mg-blog-date').text().trim(), 'M 月 D, YYYY'),
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

                item.description = content('div[itemprop="articleBody"]').html();

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

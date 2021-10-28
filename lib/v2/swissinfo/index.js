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

    const $ = cheerio.load(response.data);

    const list = $('.si-teaser__link')
        .slice(0, 1)
        .map((_, item) => {
            item = $(item);

            return {
                link: `${rootUrl}${item.attr('href')}`,
                title: item.find('.si-teaser__title').text(),
                pubDate: parseDate(item.find('.si-teaser__date').attr('datetime')),
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
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'article';

    const rootUrl = 'https://ngocn2.org';
    const currentUrl = `${rootUrl}/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.articleroll__article a')
        .map((_, item) => {
            item = $(item);

            return {
                title: item.find('.title').text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: parseDate(item.find('.meta').text()),
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

                content('.gatsby-resp-image-link').each(function () {
                    content(this).html(`<img src="${content(this).find('img').attr('src')}">`);
                });

                item.description = content('.article__content').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.sectitle__content').text()} - NGOCN`,
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://mathpix.com';
    const currentUrl = `${rootUrl}/blog`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.articles__text-content a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                pubDate: new Date(item.parent().find('.articles__date').text()).toUTCString(),
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    const titleImage = content('.article__image-area img');
                    titleImage.attr('src', `${rootUrl}${titleImage.attr('srcset')}`);
                    titleImage.removeAttr('srcset');

                    item.author = content('.article__titles-wrapper summary').text().replace('By ', '');
                    item.description = content('.article__image-area').html() + content('.article__content').html();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'Mathpix Blog',
        link: currentUrl,
        item: items,
    };
};

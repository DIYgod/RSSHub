const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');

module.exports = async (ctx) => {
    const lang = ctx.params.lang || 'www';
    const platform = ctx.params.platform || '';
    const year = ctx.params.year || '';
    if (!isValidHost(lang)) {
        throw Error('Invalid lang');
    }

    const rootUrl = `https://${lang === 'en' ? 'www' : lang}.weforum.org`;
    const currentUrl = `${rootUrl}/reports?platform=${platform}&year=${year}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.report-listing-tout__content')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.find('.report-listing-tout__title').text(),
                link: `${rootUrl}${item.find('.report-listing-tout__cta').attr('href')}`,
                description: `<a href="${item.find('.report__link').attr('href')}">Download PDF</a>`,
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

                content('.report__meta').remove();

                item.description += content('.report__display-info').html();

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

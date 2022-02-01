const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const year = ctx.params.year || new Date().getFullYear().toString();
    const month = ctx.params.month || '';

    const rootUrl = 'https://ustr.gov';
    const currentUrl = `${rootUrl}/about-us/policy-offices/press-office/press-releases/${year}/${month}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('ul.listing li a')
        .slice(0, 15)
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

                item.description = content('.field--name-body').html();
                item.pubDate = new Date(content('.title-underline').next().text()).toUTCString();

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

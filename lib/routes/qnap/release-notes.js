const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.qnap.com';
    const currentUrl = `${rootUrl}/en/release-notes/${ctx.params.id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('.tier1-menu li.active .tier2-menu li .tier3-menu li a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text().trim(),
                link: `${rootUrl}/en/release-notes/${item.attr('data-os')}/${item.attr('data-version')}/${item.attr('data-build-number')}`,
            };
        })
        .get();

    const items = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const links = item.link.split('/');
                    const apiUrl = `${rootUrl}/api/v1/release-notes/${links[4]}?locale=en&version=${links[5]}&build_number=${links[6]}`;

                    const detailResponse = await got({
                        method: 'get',
                        url: apiUrl,
                    });

                    const content = cheerio.load(detailResponse.data.result);

                    item.description = content('.content').html();
                    item.pubDate = new Date(content('.title-container p').text()).toUTCString();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: `${$('.tier1-menu li.active span').eq(0).text()} - QNAP`,
        link: currentUrl,
        item: items,
    };
};

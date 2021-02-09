const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://sub.shinybbs.vip';
    const currentUrl = `${rootUrl}/?page_id=152`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.wp-block-latest-posts__list li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: new Date(item.next('time').attr('datetime')).toUTCString(),
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

                    content('.elementor-section').last().remove();
                    content('.elementor-section').last().remove();

                    content('.elementor-tabs-wrapper').remove();

                    item.description = content('.elementor-inner').html();
                    item.enclosure_type = 'application/x-bittorrent';

                    const enclosureUrl = content('.elementor-tab-content a').last().attr('href');

                    item.enclosure_url = enclosureUrl ? enclosureUrl.replace('http://magnet', 'magnet') : '';

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

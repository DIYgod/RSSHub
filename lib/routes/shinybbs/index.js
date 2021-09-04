const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';

    const rootUrl = 'https://sub.shinybbs.vip';
    const currentUrl = `${rootUrl}/?page_id=${id}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.elementor-button-link, .kb-gallery-item-link')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                link: item.attr('href'),
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

                    item.title = content('.post-title').text();
                    item.description = content('.elementor-inner, .post-content').html();
                    item.pubDate = new Date(content('.post-date').text().replace(/年|月/g, '-').replace('日', '')).toUTCString();

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

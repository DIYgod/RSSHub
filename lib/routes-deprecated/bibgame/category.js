const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'pcgame';
    const type = ctx.params.type || '';

    const rootUrl = 'https://www.bibgame.com';
    const currentUrl = `${rootUrl}/${category}/${type}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.info_box a')
        .slice(0, 15)
        .map((_, item) => {
            item = $(item);
            const link = item.attr('href');

            return {
                title: item.text(),
                link: link.includes('http') ? link : `${rootUrl}${link}`,
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

                content('#comment').parent().remove();

                item.description = content('.abstract').html();
                item.pubDate = timezone(new Date(content('.time_box').text().trim()), +8);

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

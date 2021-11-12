const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const parseDate = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id || '';

    const rootUrl = 'https://www.or123.net';
    const currentUrl = `${rootUrl}${id ? `/?page_id=${id}` : ''}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.vc-carousel-slideline-inner')
        .eq(0)
        .find('.title')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item).parent();
            return {
                title: item.text(),
                link: item.attr('href'),
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

                item.description = content('.qfe_wrapper').eq(4).html();
                item.pubDate = timezone(parseDate(detailResponse.data.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/)[1], 'YYYY-MM-DD HH:mm'), +8);

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.header_title').eq(0).text()} - OR`,
        description: $('.header_subtitle').eq(0).text(),
        link: currentUrl,
        item: items,
    };
};

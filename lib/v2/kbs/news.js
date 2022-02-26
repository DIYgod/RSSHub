const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'all';
    const language = ctx.params.language ?? 'e';

    const rootUrl = 'http://world.kbs.co.kr';
    const currentUrl = `${rootUrl}/service/news_list.htm?lang=${language}${category === 'all' ? '' : `&id=${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.comp_pagination').remove();

    const list = $('.comp_contents_1x article')
        .map((_, item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text(),
                category: item.find('.cate').text(),
                link: `${rootUrl}/service${a.attr('href').replace('./', '/')}`,
                pubDate: timezone(
                    parseDate(
                        item
                            .find('.date')
                            .text()
                            .match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)[1]
                    ),
                    +9
                ),
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

                item.description = content('.body_txt').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('.active').text() || list[0].category} - KBS WORLD`,
        link: currentUrl,
        item: items,
    };
};

const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category ?? '';

    const start = category === 'hot' ? 6 : 0;
    const end = category === 'new' ? 6 : 12;

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/global_vision/index${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.topic').remove();

    let items = $('.news_cards ul li a')
        .toArray()
        .slice(start, end)
        .concat(category === '' ? $('.last24, h2').find('a').toArray() : [])
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.find('h3').text() || item.text(),
                link: /^http/.test(link) ? link : `${rootUrl}${item.attr('href')}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('#story_art_title, #story_bady_info, #story_also').remove();
                content('.social_bar, .photo_pop, .only_mobile, .area').remove();

                item.description = content('#tags').prev().html();
                item.author = content('#story_author_name').text();
                item.pubDate = timezone(parseDate(content('meta[name="date"]').attr('content')), +8);
                item.category = content('meta[name="news_keywords"]').attr('content').split(',');

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

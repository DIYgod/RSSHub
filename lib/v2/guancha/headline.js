const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.guancha.cn';
    const currentUrl = `${rootUrl}/GuanChaZheTouTiao/list_1.shtml`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = $('.headline-list li .content-headline h3 a')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                description: item.parent().next().html(),
                link: `${rootUrl}${item.attr('href').replace(/\.shtml$/, '_s.shtml')}`,
                pubDate: timezone(parseDate(item.parents('div').first().find('span').text()), +8),
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

                item.description += content('.all-txt').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '观察者网 - 头条',
        link: currentUrl,
        item: items,
    };
};

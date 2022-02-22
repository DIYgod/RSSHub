const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const rootUrl = 'https://www.guancha.cn';
    const currentUrl = `${rootUrl}/GuanChaZheTouTiao/list_1.shtml`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.headline-list li .content-headline h3 a')
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
                description: item.parent().next().html(),
                pubDate: new Date(item.parents('div').eq(0).find('span').text()).toUTCString(),
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

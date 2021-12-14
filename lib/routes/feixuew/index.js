const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let currentUrl;
    let query;

    const rootUrl = 'https://www.feixuew.com';

    ctx.params.id = ctx.params.id || 'latest';

    if (ctx.params.id === 'latest') {
        currentUrl = rootUrl;
    } else {
        currentUrl = `${rootUrl}/sort/${ctx.params.id}`;
    }

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    if (ctx.params.id === 'latest') {
        query = $('ul.ul-new li a').slice(4, 10);
    } else {
        query = $('a.sjwu').slice(0, 10);
    }

    const list = query
        .map((_, item) => {
            item = $(item);
            return {
                title: item.attr('title'),
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

                item.description = content('div.info-con').html();
                item.pubDate = new Date(content('p.f-sgray span').eq(1).text().replace('发布时间：', '') + ' GMT+8').toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `飞雪娱乐网 - ${$('title').text().split('-')[0]}`,
        link: currentUrl,
        item: items,
    };
};

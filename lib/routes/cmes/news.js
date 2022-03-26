const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category = ctx.params.category || 'Information';

    const rootUrl = 'https://www.cmes.org';
    const currentUrl = `${rootUrl}/News/${category}/index.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.r_ct')
        .find('a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);

            const link = item.attr('href');

            let date = '00000000';
            if (link.split('/')[2] !== 'mkc.ckcest.cn') {
                date = link.split('/')[5];
            }

            return {
                link,
                title: item.text(),
                pubDate: new Date(`${date.substr(0, 4)}-${date.substr(5, 2)}-${date.substr(7, 2)}`).toDateString(),
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

                content('h3, script, .bshare-custom').remove();

                item.description = content('.xhjj').html() || content('.detail-page').html();

                if (content('#articleTime').html()) {
                    item.pubDate = new Date(content('#articleTime').text()).toUTCString();
                }

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

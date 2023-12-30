const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || '';
    ctx.params.caty = ctx.params.caty === '' ? '' : `/navi/${ctx.params.caty}`;

    const rootUrl = 'http://forum.softhead-citavi.com';
    const currentUrl = `${rootUrl}${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('h5.media-heading a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: url.resolve(currentUrl, item.attr('href')),
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

                item.description = content('div.panel-body').html();
                item.pubDate = new Date(date(content('small.gray').eq(0).text().split(' • ')[1])).toUTCString();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('a.current').text()} - Citavi 中文网站论坛`,
        link: currentUrl,
        item: items,
    };
};

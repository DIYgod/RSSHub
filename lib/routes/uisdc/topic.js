const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const title = ctx.params.title || 'all';
    const sort = ctx.params.sort || '';

    const rootUrl = 'https://www.uisdc.com';
    const currentUrl = `${rootUrl}/${title === 'all' ? 'hunter' : 'topic/' + title}${sort === '' ? '' : '?od=' + sort}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('.item-left h2 a, .topic-item h2 a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
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

                item.author = content('h3.author').text().replace('：', '');

                content('.info .author').remove();

                item.description = content('span.img-zoom').html() + content('.main .info').html();
                item.pubDate = date(detailResponse.data.match(/<span class="item">时间：(.*)<\/span>/)[1]);

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

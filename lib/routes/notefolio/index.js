const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const caty = ctx.params.caty || 'all';
    const order = ctx.params.order || 'pick';
    const time = ctx.params.time || 'all';
    const query = ctx.params.query || '';

    const rootUrl = `https://notefolio.net/?work_categories=${caty === 'all' ? '' : caty}&order=${order}&from=${time}&q=${query}`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    $('div.mobile-category-order').remove();

    const list = $('div.work-list div.work-list-item')
        .slice(0, 5)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.go-to-work-info').eq(0);
            return {
                title: item.find('div.title').text(),
                link: `https://notefolio.net${a.attr('href')}`,
                author: item.find('span.go-profile-area').text(),
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

                item.description = '<ul>';

                content('li.block-image a img').each((_, i) => {
                    i = content(i);
                    item.description += `<li><img src="${i.attr('src')}"></li>`;
                });

                content('li.block-video iframe').each((_, i) => {
                    i = content(i);
                    item.description += `<li><iframe src="${i.attr('src')}"></li>`;
                });

                item.description += `<li>${content('li.block-text').html()}</li></ul>`;

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${$('title').text()}`,
        link: rootUrl,
        item: items,
    };
};

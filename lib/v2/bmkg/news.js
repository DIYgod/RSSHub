const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'https://www.bmkg.go.id';
    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('div .ms-slide')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            const img = item.find('img');

            return {
                title: a.text(),
                link: `${url}/${a.attr('href')}`,
                itunes_item_image: img.attr('data-src'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = cheerio.load(response.data);
                const p = $('div .blog-grid').find('p');
                item.description = p.text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: '印尼气象气候和地球物理局 新闻 | BMKG news',
        item: items,
        language: 'in',
    };
};

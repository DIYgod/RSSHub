const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let link;
    if (id.endsWith('.eth') || id.length === 42 || id.length === 40) {
        link = 'https://mirror.xyz/' + id;
    } else {
        link = 'https://' + id + '.mirror.xyz';
    }

    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.body;
    const $ = cheerio.load(data);

    let title = $('.css-1soq6ls a').first().text();
    title = title + ' - Mirror';

    const list = $('.css-1snnz1k');
    const items = list
        .map((_index, item) => {
            item = $(item);
            return {
                title: item.find('.css-1b1esvm').first().text(),
                author: item.find('.css-1sdf1k3').first().text(),
                description: item.find('.css-1koo5r3').text(),
                pubDate: item.find('.css-qng491').text(),
                link: link + item.find('.css-cts56n a').attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title,
        link,
        allowEmpty: true,
        item: items,
    };
};

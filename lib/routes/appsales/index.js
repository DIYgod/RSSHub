const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.caty = ctx.params.caty || 'highlights';
    ctx.params.time = ctx.params.time || '24h';

    const times = ['24h', 'week', 'alltime'];
    const rootUrl = `https://www.app-sales.net/${ctx.params.caty}/#!`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    if (ctx.params.caty === 'mostwanted') {
        times.forEach((i) => {
            if (i !== ctx.params.time) {
                $(`#charts-${i}`).remove();
            }
        });
    }

    $('i,img.play-icon-small').remove();

    const items = $('div.sale-list-item')
        .map((_, item) => {
            item = $(item);

            const icon = item.find('div.app-icon').html();
            const name = item.find('p.app-name').text();
            const developer = item.find('p.app-dev').text();
            const oldPrice = item.find('div.price-old').text();
            const newPrice = item.find('div.price-new').text();
            const discount = item.find('div.price-disco').text();
            const rating = item.find('p.rating').text();
            const downloads = item.find('p.downloads').text();
            const bookmarks = item.find('p.bookmarks').text();

            const description =
                `${icon}<p>${name}</p><table cellspacing="5">` +
                `<tr><td> Developer </td><td> ${developer} </td></tr>` +
                `<tr><td> Bookmarks </td><td> ${bookmarks} </td></tr>` +
                (rating ? `<tr><td>    Rating    </td><td> ${rating}    </td></tr>` : '') +
                (downloads ? `<tr><td> Downloads </td><td> ${downloads} </td></tr>` : '') +
                (discount ? `<tr><td>  Discount  </td><td> ${discount}  </td></tr>` : '') +
                (oldPrice ? `<tr><td>  Old Price </td><td> ${oldPrice}  </td></tr>` : '') +
                (newPrice ? `<tr><td>  New Price </td><td> ${newPrice}  </td></tr>` : '') +
                '</table>';

            return {
                title: `${name} ${newPrice ? '[' + newPrice + ']' : ''}`,
                link: item.find('a.waves-effect').attr('href'),
                description,
                author: developer,
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    };
};

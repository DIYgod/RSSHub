const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || '';

    const rootUrl = 'https://ditto-cp.sourceforge.io';
    const currentUrl = `${rootUrl}/${type === '' ? 'changeHistory.php' : `${type}/changes.php`}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(type === '' ? response.data : `<div class="post">${response.data.split('\r\n').join('</div><div class="post">')}</div>`);

    const items = $('.post')
        .map((_, item) => {
            item = $(item);

            const title = type === '' ? item.find('.title').text() : item.text();

            return {
                title,
                link: currentUrl,
                pubDate: new Date(title.split(' ')[type === '' ? 1 : 0]).toUTCString(),
                description: type === '' ? item.find('.entry').html() : `<p>${item.text()}</p>`,
            };
        })
        .get();

    ctx.state.data = {
        title: `Ditto clipboard manager ${type === '' ? '' : `(${type}) `}changes`,
        link: currentUrl,
        item: items,
    };
};

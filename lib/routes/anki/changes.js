const got = require('@/utils/got');
const cheerio = require('cheerio');
const md = require('markdown-it')({
    html: true,
});

module.exports = async (ctx) => {
    const rootUrl = 'https://changes.ankiweb.net';
    const currentUrl = `${rootUrl}/README.md`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const html = md.render(response.data.replace(/# Changes in/g, '## Changes in').replace(/### Changes in/g, '## Changes in'));
    const $ = cheerio.load(html.replace(/<h2>/g, '</div><div><h2>'));

    const items = $('div')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            const h2 = item.find('h2');
            const match = item.find('p').text().match('Released (.*).');
            h2.remove();
            return {
                title: h2.text(),
                description: item.html(),
                link: `${rootUrl}/#/?id=changes-in-${h2.text().toLowerCase().split(' ').join('-').replace(/\./g, '')}`,
                pubDate: match ? new Date(match[1].split(',')[0] + ' GMT+8').toUTCString() : '',
            };
        })
        .get();

    ctx.state.data = {
        title: 'Changes - Anki',
        link: rootUrl,
        item: items,
    };
};

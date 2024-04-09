const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.baby-kingdom.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const order = ctx.params.order;

    let link = `https://www.baby-kingdom.com/forum.php?mod=forumdisplay&fid=${id}`;

    switch (order) {
        case 'dateline':
            link += '&filter=author&orderby=dateline';

            break;

        case 'reply':
            link += '&filter=reply&orderby=replies';

            break;

        case 'view':
            link += '&filter=reply&orderby=views';

            break;

        case 'lastpost':
            link += '&filter=lastpost&orderby=lastpost';

            break;

        case 'heat':
            link += '&filter=heat&orderby=heats';

            break;

        default:
        // Do nothing
    }

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('h1.xs2 a').text();
    const out = $('tbody[id^="normalthread"]')
        .slice(0, 10)
        .map(function () {
            const info = {
                title: $(this).find('td:nth-child(2) > a:nth-child(1)').text(),
                link: url.resolve(host, $(this).find('td:nth-child(2) > a:nth-child(1)').attr('href')),
                author: $(this).find('td.by.by_author cite a').text(),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: `${title}-親子王國`,
        link,
        item: out,
    };
};

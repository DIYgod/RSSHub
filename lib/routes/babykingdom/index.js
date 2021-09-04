const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.baby-kingdom.com';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const order = ctx.params.order;

    let link = `https://www.baby-kingdom.com/forum.php?mod=forumdisplay&fid=${id}`;

    if (order === 'dateline') {
        link += '&filter=author&orderby=dateline';
    } else if (order === 'reply') {
        link += '&filter=reply&orderby=replies';
    } else if (order === 'view') {
        link += '&filter=reply&orderby=views';
    } else if (order === 'lastpost') {
        link += '&filter=lastpost&orderby=lastpost';
    } else if (order === 'heat') {
        link += '&filter=heat&orderby=heats';
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
        link: link,
        item: out,
    };
};

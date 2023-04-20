const got = require('@/utils/got'); // get web content
const cheerio = require('cheerio'); // html parser

module.exports = async function getArticle(item) {
    const response = await got({
        method: 'get',
        url: item.link,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('div.view-title').text();
    const content = $('#vsb_content').html();
    $('[name="_newscontent_fromname"] ul a').each((_, e) => {
        const href = $(e).attr('href');
        if (href.startsWith('/')) {
            $(e).attr('href', new URL(href, item.link).href);
        }
    });

    item.title = title;
    item.description = content + ($('ul[style]').length ? $('ul[style]').html() : '');

    return item;
};

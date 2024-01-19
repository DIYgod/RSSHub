const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const rootUrl = 'http://news.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const column = ctx.params.column;
    const id = ctx.params.id || '';
    const toUrl = id === '' ? `${rootUrl}/${column}.htm` : `${rootUrl}/${column}/${id}.htm`;

    const response = await got(toUrl, {
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const bigTitle = $('div.list-left-tt')
        .text()
        .replaceAll(/[\n\r ]/g, '');

    const card = $('li.clearfix')
        .map((_, item) => ({
            title: $(item).find('div.list-right-tt').text(),
            pubDate: parseDate($(item).find('.news-date-li').text(), 'DDYYYY-MM'),
            link: $(item).find('a').attr('href'),
            description: $(item).find('div.list-right-p').text(),
        }))
        .get();

    ctx.state.data = {
        title: '工学-' + bigTitle,
        link: toUrl,
        item: card,
    };
};

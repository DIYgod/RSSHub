const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://news.hrbeu.edu.cn';

module.exports = async (ctx) => {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const column = ctx.params.column;
    const id = ctx.params.id || '';
    let toUrl;
    if (id !== '') {
        toUrl = rootUrl.concat('/', column, '/', id, '.htm');
    } else {
        toUrl = rootUrl.concat('/', column, '.htm');
    }

    const response = await got({
        method: 'get',
        url: toUrl,
        headers: {
            Referer: rootUrl,
        },
    });

    const $ = cheerio.load(response.data);

    const bigTitle = $('div.list-left-tt')
        .text()
        .replace(/[ ]|[\r\n]/g, '');

    const card = $('li.clearfix')
        .map((_, item) => ({
            title: $(item).find('div.list-right-tt').text(),
            pubDate: $(item).find('span').text() + ' ' + hour + ':' + minute,
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

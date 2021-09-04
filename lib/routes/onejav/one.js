const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'new';
    const key = type === 'day' ? ctx.params.key.slice(0, 4) + '/' + ctx.params.key.slice(4, 6) + '/' + ctx.params.key.slice(6, 8) : ctx.params.key || '';
    const link = 'https://onejav.com' + `/${type === 'day' ? '' : type}${type === 'new' ? '' : '/' + key}`.replace('//', '/');
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);
    const list = $('div.columns');

    let itemPicUrl;

    ctx.state.data = {
        title: `OneJAV - ${type} ${key}`,
        link: link,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = item.find('img').attr('src');
                    return {
                        title: '【' + item.find('div.card-content.is-flex > h5 > a').text() + '】' + item.find('div.card-content.is-flex > h5 > span').text(),
                        description: `<img src="${itemPicUrl}"/><br/>Time: ${item.find('p.subtitle.is-6 > a').text()}<br/>Desc: ${item.find('p.level.has-text-grey-dark').text()}`,
                        link: item.find('div.card-content.is-flex > h5 > a').attr('href'),
                        enclosure_url: 'https://onejav.com' + item.find('p.control.is-expanded > a').attr('href'),
                        enclosure_type: 'application/x-bittorrent',
                    };
                })
                .get(),
    };
};

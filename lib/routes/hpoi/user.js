const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://www.hpoi.net';
const caties = {
    want: '想买的手办',
    preorder: '预定的手办',
    buy: '已入的手办',
};

module.exports = async (ctx) => {
    const { user_id, caty } = ctx.params;
    let title = caties[caty];
    if (!title) {
        throw Error('Bad category. See <a href="https://docs.rsshub.app/anime.html#hpoi-shou-ban-wei-ji">https://docs.rsshub.app/anime.html#hpoi-shou-ban-wei-ji</a>');
    }

    const url = `${root_url}/user/${user_id}/hobby?order=actionDate&favState=${caty}&view=5&category=100&sortType=1`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const $ = cheerio.load(response.data);
    const list = $('#content > div.action-box div.action-detail')
        .map((_, item) => {
            item = $(item);
            const img = item.find('div.list-5-left > a > img').attr('src');
            const a = item.find('div.list-5-right > a.action-title');
            return {
                title: a.text(),
                link: a.attr('href'),
                description: `<img src="${img}"><p>${a.text()}</p>`,
            };
        })
        .get();

    title = $('div.col-md-15.col-sm-15 > div:nth-child(2)').text() + title;

    ctx.state.data = {
        title: title,
        link: url,
        item: list,
    };
};

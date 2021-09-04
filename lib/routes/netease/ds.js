const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

const root_url = 'https://ds.163.com/';

module.exports = async (ctx) => {
    const id = ctx.params.id;
    if (!id) {
        throw Error('Bad parameter. See <a href="https://docs.rsshub.app/game.html#wang-yi-da-shen">https://docs.rsshub.app/game.html#wang-yi-da-shen</a>');
    }

    const current_url = url.resolve(root_url, '/user/' + id);
    const response = await got({
        method: 'get',
        url: current_url,
    });

    const $ = cheerio.load(response.data);
    const list = $('main.user-page__main div.feed-card')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a.feed-card__link-hide');
            const desc = item.find('div.feed-card__body');
            const title = desc.find('div.feed-text').text();
            return {
                title: title,
                link: a.attr('href'),
                description: desc.html(),
                pubDate: date(item.find('time.userbar__time').text().trim()),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: current_url,
        item: list,
    };
};

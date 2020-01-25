const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const root_url = 'https://ds.163.com/';

const re_hours = /(\d+)小时前/;
const re_yesterday = /昨天(\d+):(\d+)/;
const re_before = /前天(\d+):(\d+)/;
const re_month = /^(\d+\/\d+)$/;
const re_date = /(\d\d\d\d\/\d+\/\d+)/;

const guess_date = (s) => {
    let m = null;
    const now = parseInt(new Date().getTime() / 1000);
    if ((m = re_hours.exec(s))) {
        return new Date((now - m[1] * 3600) * 1000);
    } else if ((m = re_yesterday.exec(s))) {
        return new Date((now - 86400 - (now % 86400) + (m[1] - 8) * 3600 + m[2] * 60) * 1000);
    } else if ((m = re_before.exec(s))) {
        return new Date((now - 86400 * 2 - (now % 86400) + (m[1] - 8) * 3600 + m[2] * 60) * 1000);
    } else if ((m = re_month.exec(s))) {
        return new Date(new Date().getFullYear() + '/' + m[1] + ' GMT+8');
    } else if ((m = re_date.exec(s))) {
        return new Date(m[1] + ' GMT+8');
    }
    return new Date();
};

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
            const title =
                desc
                    .find('div.feed-text')
                    .text()
                    .slice(0, 20) + '...';
            return {
                title: title,
                link: a.attr('href'),
                description: desc.html(),
                pubDate: guess_date(
                    item
                        .find('time.userbar__time')
                        .text()
                        .trim()
                ).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: current_url,
        item: list,
    };
};

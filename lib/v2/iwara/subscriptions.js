const got = require('@/utils/got');
const config = require('@/config').value;
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const rootUrl = `https://ecchi.iwara.tv`;
    const subUrl = `https://ecchi.iwara.tv/subscriptions`;
    const cookie = config.iwara.cookie;

    if (cookie === undefined) {
        throw Error('Iwara subscription RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const response = await got({
        method: 'get',
        url: subUrl,
        headers: {
            Cookie: cookie,
        },
    });
    const $ = cheerio.load(response.data);
    const username = $('a.btn.btn-info.btn-sm.user').text().trim();
    const list = $('div.views-column');

    const items = list
        .map((_, item) => {
            const imageUrl = 'https:' + $(item).find('img').attr('src');
            const type = $(item).find('div.field').hasClass('field-type-video') ? 'Video' : 'Image';
            return {
                title: $(item).find('h3.title').text(),
                author: $(item).find('a.username').text(),
                link: rootUrl + $(item).find('h3.title > a').attr('href'),
                category: type,
                description: art(path.join(__dirname, 'templates/subscriptions.art'), {
                    type,
                    imageUrl,
                }),
            };
        })
        .get();

    ctx.state.data = {
        title: `${username}'s iwara Subscription`,
        link: rootUrl,
        item: items,
    };
};

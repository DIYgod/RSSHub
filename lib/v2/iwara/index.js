const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://ecchi.iwara.tv';

const typeMap = {
    video: 'Videos',
    image: 'Images',
};

const selectorMap = {
    video: 'div.node.node-video.node-teaser.node-teaser.clearfix',
    image: 'div.node.node-image.node-teaser.node-teaser.clearfix',
};

module.exports = async (ctx) => {
    const username = ctx.params.username;
    const type = ctx.params.type ?? 'video';
    const userUrl = `${rootUrl}/users/${username}`;

    const response = await got.get(userUrl);
    const $ = cheerio.load(response.data);
    const list = $(selectorMap[type]);

    const items = list
        .map((_, item) => {
            const imageUrl = 'https:' + $(item).find('img').attr('src');
            return {
                title: $(item).find('h3.title').text(),
                author: username,
                link: rootUrl + $(item).find('h3.title > a').attr('href'),
                description: `<img src="${imageUrl}">`,
            };
        })
        .get();

    ctx.state.data = {
        title: `${username}'s iwara - ${typeMap[type]}`,
        link: userUrl,
        item: items,
    };
};

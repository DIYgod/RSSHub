const got = require('@/utils/got');
const Parser = require('rss-parser');

module.exports = async (ctx) => {
    const domain = 'http://www.yimg.net';

    const path = ctx.params.path;
    const rssLink = encodeURI(`${domain}/feed/${path.replace('_', '/')}/`);

    const page = await got.get(rssLink);
    const parser = new Parser();
    const feed = await parser.parseString(page.body);

    ctx.state.data = {
        title: feed.title,
        link: feed.link,
        description: feed.title,
        item: feed.items.map((x) => ({
            title: x.title,
            link: x.link,
            pubDate: x.pubDate,
            description: x['content:encoded']._.replace(/<.*?>/g, '')
                .split('|')
                .filter((x) => x.trim().length > 0)
                .map((x) => `<img referrerpolicy="no-referrer" src="${x}">`)
                .join('</br>'),
        })),
    };
};

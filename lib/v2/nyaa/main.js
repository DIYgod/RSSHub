const config = require('@/config').value;
const Parser = require('rss-parser');

module.exports = async (ctx) => {
    const parser = new Parser({
        customFields: {
            item: ['magnet', ['nyaa:infoHash', 'infoHash']],
        },
        headers: {
            'User-Agent': config.ua,
        },
    });

    let currentURL;
    let currentLink;

    if (ctx.routerPath.split('/')[1] === 'sukebei') {
        const rootURL = 'https://sukebei.nyaa.si';
        const { username = 'ohys' } = ctx.params;
        const { query = '' } = ctx.params;
        if (ctx.routerPath.split('/')[2] === 'user') {
            currentURL = `${rootURL}/?page=rss&u=${username}`;
            currentLink = `${rootURL}/user/${username}`;
        } else {
            currentURL = `${rootURL}/?page=rss&c=0_0&f=0&q=${encodeURI(query)}`;
            currentLink = `${rootURL}/?f=0&c=0_0&q=${query}`;
        }
    } else {
        const rootURL = 'https://nyaa.si';
        const { username = 'Tarakara168' } = ctx.params;
        const { query = '' } = ctx.params;
        if (ctx.routerPath.split('/')[1] === 'user') {
            currentURL = `${rootURL}/?page=rss&u=${username}`;
            currentLink = `${rootURL}/user/${username}`;
        } else {
            currentURL = `${rootURL}/?page=rss&c=0_0&f=0&q=${encodeURI(query)}`;
            currentLink = `${rootURL}/?f=0&c=0_0&q=${query}`;
        }
    }

    const feed = await parser.parseURL(currentURL);

    feed.items.map((item) => {
        item.link = item.guid;
        item.description = item.content;
        item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
        item.enclosure_type = 'application/x-bittorrent';
        return item;
    });

    ctx.state.data = {
        title: feed.title,
        link: currentLink,
        description: feed.description,
        item: feed.items,
    };
};

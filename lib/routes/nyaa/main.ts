// @ts-nocheck
import { config } from '@/config';
const Parser = require('rss-parser');

export default async (ctx) => {
    const parser = new Parser({
        customFields: {
            item: ['magnet', ['nyaa:infoHash', 'infoHash']],
        },
        headers: {
            'User-Agent': config.ua,
        },
    });

    const { query, username } = ctx.req.param();

    const rootURL = ctx.routerPath.split('/')[1] === 'sukebei' ? 'https://sukebei.nyaa.si' : 'https://nyaa.si';

    let currentRSSURL = `${rootURL}/?page=rss`;
    let currentLink = `${rootURL}/`;
    if (username !== undefined) {
        currentRSSURL = `${currentRSSURL}&u=${encodeURI(username)}`;
        currentLink = `${currentLink}user/${encodeURI(username)}`;
    }
    if (query !== undefined) {
        currentRSSURL = `${currentRSSURL}&q=${encodeURI(query)}`;
        currentLink = `${currentLink}?q=${encodeURI(query)}`;
    }

    const feed = await parser.parseURL(currentRSSURL);

    feed.items.map((item) => {
        item.link = item.guid;
        item.description = item.content;
        item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
        item.enclosure_type = 'application/x-bittorrent';
        return item;
    });

    ctx.set('data', {
        title: feed.title,
        link: currentLink,
        description: feed.description,
        item: feed.items,
    });
};

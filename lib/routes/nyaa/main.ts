import { Route } from '@/types';
import { config } from '@/config';
import Parser from 'rss-parser';

export const route: Route = {
    path: ['/search/:query?', '/user/:username?', '/user/:username/search/:query?', '/sukebei/search/:query?', '/sukebei/user/:username?', '/sukebei/user/:username/search/:query?'],
    categories: ['multimedia'],
    example: '/nyaa/search/psycho-pass',
    parameters: { query: 'Search keyword' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: true,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search Result',
    maintainers: ['Lava-Swimmer', 'noname1776', 'camera-2018'],
    handler,
};

async function handler(ctx) {
    const parser = new Parser({
        customFields: {
            item: ['magnet', ['nyaa:infoHash', 'infoHash']],
        },
        headers: {
            'User-Agent': config.ua,
        },
    });

    const { query, username } = ctx.req.param();

    const rootURL = ctx.req.path.split('/')[2] === 'sukebei' ? 'https://sukebei.nyaa.si' : 'https://nyaa.si';

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
        item.description = item.content;
        item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
        item.enclosure_type = 'application/x-bittorrent';
        return item;
    });

    return {
        title: feed.title,
        link: currentLink,
        description: feed.description,
        item: feed.items,
    };
}

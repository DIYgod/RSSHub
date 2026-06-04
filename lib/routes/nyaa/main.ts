import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import Parser from 'rss-parser';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const md = MarkdownIt({
    breaks: true,
    html: true,
    linkify: true,
    typographer: true,
});

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
    maintainers: ['Lava-Swimmer', 'noname1776', 'camera-2018', 'Q16KBreak'],
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

    /**
     * Shares the same `mode=fulltext` trigger condition with
     * DIYgod/RSSHub/lib/middleware/parameter.ts
     *
     * @caution
     * Due to semantic differences in Nyaa (where `link` = torrent file, `guid` = web page),
     * the middleware may trigger unnecessary requests to torrent files, and when a 429 error occurs,
     * you can observe request errors for the torrent file in the console.
     *
     * @impact
     * Does NOT affect the final RSS output. The actual fulltext is correctly fetched from `item.guid`.
     */
    if (ctx.req.query('mode')?.toLowerCase() === 'fulltext') {
        const limit = Number.parseInt(ctx.req.query('limit')) || 6; // prevent 429 rate limiting
        const items = await Promise.all(
            feed.items.slice(0, limit).map((item) =>
                cache.tryGet(item.guid, async () => {
                    const response = await ofetch(item.guid);
                    const $ = load(response);

                    item.description = md.render($('div#torrent-description.panel-body[markdown-text]').text());
                    item.enclosure_url = `magnet:?xt=urn:btih:${item.infoHash}`;
                    item.enclosure_type = 'application/x-bittorrent';
                    return item;
                })
            )
        );

        return {
            title: feed.title,
            link: currentLink,
            description: feed.description,
            item: items,
        };
    } else {
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
}

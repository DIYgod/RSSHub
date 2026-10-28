import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';
import Parser from 'rss-parser';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

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
    maintainers: ['LandonLi', 'noname1776', 'camera-2018', 'Q16KBreak'],
    handler,
};

type NyaaItem = {
    magnet?: string;
    infoHash?: string;
    description?: string;
    enclosure_url?: string;
    enclosure_type?: string;
};

const toDataItems = (item: Parser.Item & NyaaItem): DataItem[] => {
    if (!item.title || !item.guid) {
        return [];
    }
    return [
        {
            title: item.title,
            link: item.guid,
            guid: item.guid,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            description: item.description,
            ...(item.link && { enclosure_url: item.link, enclosure_type: 'application/x-bittorrent' }),
        },
    ];
};

async function handler(ctx) {
    const parser = new Parser<object, NyaaItem>({
        customFields: {
            item: ['magnet', ['nyaa:infoHash', 'infoHash']],
        },
        headers: {
            'User-Agent': config.ua,
        },
    });

    const { query, username } = ctx.req.param();

    const rootURL = ctx.req.path.split('/', 3)[2] === 'sukebei' ? 'https://sukebei.nyaa.si' : 'https://nyaa.si';

    let currentRSSURL = `${rootURL}/?page=rss`;
    let currentLink = `${rootURL}/`;
    if (username !== undefined) {
        currentRSSURL += `&u=${encodeURIComponent(username)}`;
        currentLink += `user/${encodeURIComponent(username)}`;
    }
    if (query !== undefined) {
        currentRSSURL += `&q=${encodeURIComponent(query)}`;
        currentLink += `?q=${encodeURIComponent(query)}`;
    }

    const feed = await parser.parseURL(currentRSSURL);

    if (ctx.req.query('mode')?.toLowerCase() === 'fulltext') {
        const limit = getRouteLimit(ctx, 6); // Preserve the first-page full-text default.
        const items = await pMap(
            feed.items.slice(0, limit),
            async (item) => ({
                ...item,
                description: await cache.tryGet(item.guid + ':body', async () => {
                    const response = await ofetch(item.guid!);
                    const $ = load(response);
                    return md.render($('div#torrent-description.panel-body[markdown-text]').text());
                }),
            }),
            { concurrency: 3 }
        );

        return {
            title: feed.title!,
            link: currentLink,
            description: feed.description,
            item: items.flatMap(toDataItems),
        };
    }
    feed.items.map((item) => {
        item.description = item.content;
        return item;
    });

    return {
        title: feed.title!,
        link: currentLink,
        description: feed.description,
        item: feed.items.flatMap(toDataItems),
    };
}

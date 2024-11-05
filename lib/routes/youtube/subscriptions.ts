import { Route } from '@/types';
import cache from '@/utils/cache';
import { config } from '@/config';
import utils from './utils';
import { parseDate } from '@/utils/parse-date';
import asyncPool from 'tiny-async-pool';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/subscriptions/:embed?',
    categories: ['social-media'],
    example: '/youtube/subscriptions',
    parameters: { embed: 'Default to embed the video, set to any value to disable embedding' },
    features: {
        requireConfig: [
            {
                name: 'YOUTUBE_KEY',
                description: '',
            },
            {
                name: 'YOUTUBE_CLIENT_ID',
                description: '',
            },
            {
                name: 'YOUTUBE_CLIENT_SECRET',
                description: '',
            },
            {
                name: 'YOUTUBE_REFRESH_TOKEN',
                description: '',
            },
        ],
    },
    radar: [
        {
            source: ['www.youtube.com/feed/subscriptions', 'www.youtube.com/feed/channels'],
            target: '/subscriptions',
        },
    ],
    name: 'Subscriptions',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.youtube.com/feed/subscriptions',
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key || !config.youtube.clientId || !config.youtube.clientSecret || !config.youtube.refreshToken) {
        throw new ConfigNotFoundError('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const embed = !ctx.req.param('embed');

    const channelIds = (await utils.getSubscriptions('snippet', cache)).data.items.map((item) => item.snippet.resourceId.channelId);

    const playlistIds = [];
    for await (const playlistId of asyncPool(30, channelIds, async (channelId) => (await utils.getChannelWithId(channelId, 'contentDetails', cache)).data.items[0].contentDetails.relatedPlaylists.uploads)) {
        playlistIds.push(playlistId);
    }

    let items = [];
    for await (const item of asyncPool(30, playlistIds, async (playlistId) => (await utils.getPlaylistItems(playlistId, 'snippet', cache))?.data.items)) {
        items.push(item);
    }

    // https://measurethat.net/Benchmarks/Show/7223
    // concat > reduce + concat >>> flat
    items = items.flat();

    items = items
        .filter((i) => i && !i.error && i.snippet.title !== 'Private video' && i.snippet.title !== 'Deleted video')
        .map((item) => {
            const snippet = item.snippet;
            const videoId = snippet.resourceId.videoId;
            const img = utils.getThumbnail(snippet.thumbnails);
            return {
                title: snippet.title,
                description: utils.renderDescription(embed, videoId, img, utils.formatDescription(snippet.description)),
                pubDate: parseDate(snippet.publishedAt),
                link: `https://www.youtube.com/watch?v=${videoId}`,
                author: snippet.videoOwnerChannelTitle,
                image: img.url,
            };
        });

    const ret = {
        title: 'Subscriptions - YouTube',
        description: 'YouTube Subscriptions',
        link: 'www.youtube.com/feed/subscriptions',
        item: items,
    };

    ctx.set('json', {
        ...ret,
        channelIds,
        playlistIds,
    });
    return ret;
}

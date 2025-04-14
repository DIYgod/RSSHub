import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';

export const route: Route = {
    path: '/channel/:id/:routeParams?',
    categories: ['social-media'],
    example: '/youtube/channel/UCDwDMPOZfxVV0x_dz0eQ8KQ',
    parameters: {
        id: 'YouTube channel id',
        routeParams: 'Extra parameters, see the table below',
    },
    radar: [
        {
            source: ['www.youtube.com/channel/:id'],
            target: '/channel/:id',
        },
    ],
    name: 'Channel with id',
    maintainers: ['DIYgod', 'pseudoyu'],
    handler,
    description: `:::tip Parameter
| Name       | Description                                                                         | Default |
| ---------- | ----------------------------------------------------------------------------------- | ------- |
| embed      | Whether to embed the video, fill in any value to disable embedding                  | embed   |
| filterShorts | Whether to filter out shorts from the feed, fill in any falsy value to show shorts | true    |
:::

::: tip
YouTube provides official RSS feeds for channels, for instance [https://www.youtube.com/feeds/videos.xml?channel\_id=UCDwDMPOZfxVV0x\_dz0eQ8KQ](https://www.youtube.com/feeds/videos.xml?channel_id=UCDwDMPOZfxVV0x_dz0eQ8KQ).
:::`,
    features: {
        requireConfig: [
            {
                name: 'YOUTUBE_KEY',
                description: ' YouTube API Key, support multiple keys, split them with `,`, [API Key application](https://console.developers.google.com/)',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key) {
        throw new ConfigNotFoundError('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const id = ctx.req.param('id');

    // Parse route parameters
    const routeParams = ctx.req.param('routeParams');
    const params = new URLSearchParams(routeParams);

    // Get embed parameter
    const embed = !params.get('embed');

    // Get filterShorts parameter (default to true if not specified)
    const filterShortsStr = params.get('filterShorts');
    const filterShorts = filterShortsStr === null || filterShortsStr === '' || filterShortsStr === 'true';

    if (!utils.isYouTubeChannelId(id)) {
        throw new InvalidParameterError(`Invalid YouTube channel ID. \nYou may want to use <code>/youtube/user/:id</code> instead.`);
    }

    // Get original uploads playlist ID if needed
    const originalPlaylistId = filterShorts ? null : (await utils.getChannelWithId(id, 'contentDetails', cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

    // Use the utility function to get the appropriate playlist ID based on filterShorts setting
    const playlistId = filterShorts ? utils.getPlaylistWithShortsFilter(id) : originalPlaylistId;

    const data = (await utils.getPlaylistItems(playlistId, 'snippet', cache)).data.items;

    return {
        title: `${data[0].snippet.channelTitle} - YouTube`,
        link: `https://www.youtube.com/channel/${id}`,
        description: `YouTube channel ${data[0].snippet.channelTitle}`,
        item: data
            .filter((d) => d.snippet.title !== 'Private video' && d.snippet.title !== 'Deleted video')
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
            }),
    };
}

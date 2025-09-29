import { Route } from '@/types';
import utils, { callApi } from './utils';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import { getDataByChannelId as getDataByChannelIdYoutubei } from './api/youtubei';
import { getDataByChannelId as getDataByChannelIdGoogle } from './api/google';

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
    description: `::: tip Parameter
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
                optional: true,
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

    const data = await callApi({
        googleApi: getDataByChannelIdGoogle,
        youtubeiApi: getDataByChannelIdYoutubei,
        params: { channelId: id, embed, filterShorts },
    });

    return data;
}

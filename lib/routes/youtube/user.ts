import { Route, ViewType } from '@/types';
import { getDataByUsername as getDataByUsernameYoutubei } from './api/youtubei';
import { getDataByUsername as getDataByUsernameGoogle } from './api/google';
import { callApi } from './utils';

export const route: Route = {
    path: '/user/:username/:routeParams?',
    categories: ['social-media', 'popular'],
    view: ViewType.Videos,
    example: '/youtube/user/@JFlaMusic',
    parameters: {
        username: 'YouTuber handle with @',
        routeParams: 'Extra parameters, see the table below',
    },
    description: `:::tip Parameter
| Name       | Description                                                                         | Default |
| ---------- | ----------------------------------------------------------------------------------- | ------- |
| embed      | Whether to embed the video, fill in any value to disable embedding                  | embed   |
| filterShorts | Whether to filter out shorts from the feed, fill in any falsy value to show shorts | true    |
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
    radar: [
        {
            source: ['www.youtube.com/user/:username', 'www.youtube.com/:username', 'www.youtube.com/:username/videos'],
            target: '/user/:username',
        },
    ],
    name: 'Channel with user handle',
    maintainers: ['DIYgod', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');

    // Parse route parameters
    const routeParams = ctx.req.param('routeParams');
    const params = new URLSearchParams(routeParams);

    // Get embed parameter
    const embed = !params.get('embed');

    // Get filterShorts parameter (default to true if not specified)
    const filterShortsStr = params.get('filterShorts');
    const filterShorts = filterShortsStr === null || filterShortsStr === '' || filterShortsStr === 'true';

    const data = await callApi({
        googleApi: getDataByUsernameGoogle,
        youtubeiApi: getDataByUsernameYoutubei,
        params: { username, embed, filterShorts },
    });

    return data;
}

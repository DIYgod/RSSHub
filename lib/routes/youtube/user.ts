import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import utils, { getVideoUrl } from './utils';
import { config } from '@/config';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import NotFoundError from '@/errors/types/not-found';

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
            source: ['www.youtube.com/user/:username', 'www.youtube.com/:username'],
            target: '/user/:username',
        },
    ],
    name: 'Channel with user handle',
    maintainers: ['DIYgod', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    if (!config.youtube || !config.youtube.key) {
        throw new ConfigNotFoundError('YouTube RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const username = ctx.req.param('username');

    // Parse route parameters
    const routeParams = ctx.req.param('routeParams');
    const params = new URLSearchParams(routeParams);

    // Get embed parameter
    const embed = !params.get('embed');

    // Get filterShorts parameter (default to true if not specified)
    const filterShortsStr = params.get('filterShorts');
    const filterShorts = filterShortsStr === null || filterShortsStr === '' || filterShortsStr === 'true';

    let userHandleData;
    if (username.startsWith('@')) {
        userHandleData = await cache.tryGet(`youtube:handle:${username}`, async () => {
            const link = `https://www.youtube.com/${username}`;
            const response = await ofetch(link);
            const $ = cheerio.load(response);
            const ytInitialData = JSON.parse(
                $('script')
                    .text()
                    .match(/ytInitialData = ({.*?});/)?.[1] || '{}'
            );
            const metadataRenderer = ytInitialData.metadata.channelMetadataRenderer;

            const channelId = metadataRenderer.externalId;
            const channelName = metadataRenderer.title;
            const image = metadataRenderer.avatar?.thumbnails?.[0]?.url;
            const description = metadataRenderer.description;
            const playlistId = (await utils.getChannelWithId(channelId, 'contentDetails', cache)).data.items[0].contentDetails.relatedPlaylists.uploads;

            return {
                channelName,
                image,
                description,
                playlistId,
            };
        });
    }

    // Get the appropriate playlist ID based on filterShorts setting
    const playlistId = await (async () => {
        if (userHandleData?.playlistId) {
            const origPlaylistId = userHandleData.playlistId;

            return utils.getPlaylistWithShortsFilter(origPlaylistId, filterShorts);
        } else {
            const channelData = await utils.getChannelWithUsername(username, 'contentDetails', cache);
            const items = channelData.data.items;

            if (!items) {
                throw new NotFoundError(`The channel https://www.youtube.com/user/${username} does not exist.`);
            }

            const channelId = items[0].id;

            return filterShorts ? utils.getPlaylistWithShortsFilter(channelId, filterShorts) : items[0].contentDetails.relatedPlaylists.uploads;
        }
    })();

    const playlistItems = await utils.getPlaylistItems(playlistId, 'snippet', cache);
    if (!playlistItems) {
        throw new NotFoundError("This channel doesn't have any content.");
    }

    return {
        title: `${userHandleData?.channelName || username} - YouTube`,
        link: username.startsWith('@') ? `https://www.youtube.com/${username}` : `https://www.youtube.com/user/${username}`,
        description: userHandleData?.description || `YouTube user ${username}`,
        image: userHandleData?.image,
        item: playlistItems.data.items
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
                    attachments: [
                        {
                            url: getVideoUrl(videoId),
                            mime_type: 'text/html',
                        },
                    ],
                };
            }),
    };
}

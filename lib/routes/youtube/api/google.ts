import { google } from 'googleapis';
const { OAuth2 } = google.auth;
import { config } from '@/config';
import utils, { getVideoUrl } from '../utils';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import NotFoundError from '@/errors/types/not-found';
import { Data } from '@/types';

let count = 0;
const youtube = {};
if (config.youtube && config.youtube.key) {
    const keys = config.youtube.key.split(',');

    for (const [index, key] of keys.entries()) {
        if (key) {
            youtube[index] = google.youtube({
                version: 'v3',
                auth: key,
            });
            count = index + 1;
        }
    }
}

let index = -1;
const exec = async (func) => {
    let result;
    for (let i = 0; i < count; i++) {
        index++;
        try {
            // eslint-disable-next-line no-await-in-loop
            result = await func(youtube[index % count]);
            break;
        } catch {
            // console.error(error);
        }
    }
    return result;
};

let youtubeOAuth2Client;
if (config.youtube && config.youtube.clientId && config.youtube.clientSecret && config.youtube.refreshToken) {
    youtubeOAuth2Client = new OAuth2(config.youtube.clientId, config.youtube.clientSecret, 'https://developers.google.com/oauthplayground');
    youtubeOAuth2Client.setCredentials({ refresh_token: config.youtube.refreshToken });
}

export { youtubeOAuth2Client, exec };

export const getDataByUsername = async ({ username, embed, filterShorts }: { username: string; embed: boolean; filterShorts: boolean }): Promise<Data> => {
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
};

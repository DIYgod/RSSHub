import { google } from 'googleapis';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';
import { youtubeOAuth2Client, exec } from './api/google';

export const getPlaylistItems = (id, part, cache) =>
    cache.tryGet(
        `youtube:getPlaylistItems:${id}`,
        async () => {
            const res = await exec((youtube) =>
                youtube.playlistItems.list({
                    part,
                    playlistId: id,
                    maxResults: 50, // youtube api param value default is 5
                })
            );
            return res;
        },
        config.cache.routeExpire,
        false
    );
export const getPlaylist = (id, part, cache) =>
    cache.tryGet(`youtube:getPlaylist:${id}`, async () => {
        const res = await exec((youtube) =>
            youtube.playlists.list({
                part,
                id,
            })
        );
        return res;
    });
export const getChannelWithId = (id, part, cache) =>
    cache.tryGet(`youtube:getChannelWithId:${id}`, async () => {
        const res = await exec((youtube) =>
            youtube.channels.list({
                part,
                id,
            })
        );
        return res;
    });
export const getChannelWithUsername = (username, part, cache) =>
    cache.tryGet(`youtube:getChannelWithUsername:${username}`, async () => {
        const res = await exec((youtube) =>
            youtube.channels.list({
                part,
                forUsername: username,
            })
        );
        return res;
    });
export const getVideos = (id, part, cache) =>
    cache.tryGet(`youtube:getVideos:${id}`, async () => {
        const res = await exec((youtube) =>
            youtube.videos.list({
                part,
                id,
            })
        );
        return res;
    });
export const getThumbnail = (thumbnails) => thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;
export const formatDescription = (description) => description?.replaceAll(/\r\n|\r|\n/g, '<br>');
export const renderDescription = (embed, videoId, img, description) =>
    art(path.join(__dirname, 'templates/description.art'), {
        embed,
        videoId,
        img,
        description,
    });

export const getSubscriptions = async (part, cache) => {
    // access tokens expire after one hour
    let accessToken = await cache.get('youtube:accessToken', false);
    if (!accessToken) {
        const data = await youtubeOAuth2Client.getAccessToken();
        accessToken = data.token;
        await cache.set('youtube:accessToken', accessToken, 3600); // ~3600s
    }
    youtubeOAuth2Client.setCredentials({ access_token: accessToken, refresh_token: config.youtube.refreshToken });

    return cache.tryGet('youtube:getSubscriptions', () => getSubscriptionsRecusive(part), config.cache.routeExpire, false);
};
export async function getSubscriptionsRecusive(part, nextPageToken?) {
    const res = await google.youtube('v3').subscriptions.list({
        auth: youtubeOAuth2Client,
        part,
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken ?? undefined,
    });
    // recursively get next page
    if (res.data.nextPageToken) {
        const next = await getSubscriptionsRecusive(part, res.data.nextPageToken);
        if (next.data.items) {
            res.data.items = [...(res.data.items || []), ...next.data.items];
        }
    }
    return res;
}
// taken from https://webapps.stackexchange.com/a/101153
export const isYouTubeChannelId = (id) => /^UC[\w-]{21}[AQgw]$/.test(id);
export const getLive = (id, cache) =>
    cache.tryGet(`youtube:getLive:${id}`, async () => {
        const res = await exec((youtube) =>
            youtube.search.list({
                part: 'snippet',
                channelId: id,
                eventType: 'live',
                type: 'video',
            })
        );
        return res;
    });
export const getVideoUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?controls=1&autoplay=1&mute=0`;

// Get the appropriate playlist ID with or without shorts
export const getPlaylistWithShortsFilter = (id: string, filterShorts = true): string => {
    // If filtering shorts is enabled
    if (filterShorts) {
        if (id.startsWith('UC')) {
            // For channel IDs (UC...), convert to playlist format without shorts (UULF...)
            return 'UULF' + id.slice(2);
        } else if (id.startsWith('UU')) {
            // For playlist IDs (UU...), convert to playlist format without shorts (UULF...)
            return 'UULF' + id.slice(2);
        }
    }
    // If filterShorts is false or the ID format doesn't match known patterns, return original ID
    return id;
};

export const callApi = async <T>({ googleApi, youtubeiApi, params }: { googleApi: (params: any) => Promise<T>; youtubeiApi: (params: any) => Promise<T>; params: any }): Promise<T> => {
    if (config.youtube?.key) {
        try {
            return await googleApi(params);
        } catch {
            return await youtubeiApi(params);
        }
    }
    return await youtubeiApi(params);
};

export default {
    getPlaylistItems,
    getPlaylist,
    getChannelWithId,
    getChannelWithUsername,
    getVideos,
    getThumbnail,
    formatDescription,
    renderDescription,
    getSubscriptions,
    getSubscriptionsRecusive,
    isYouTubeChannelId,
    getLive,
    getVideoUrl,
    getPlaylistWithShortsFilter,
};

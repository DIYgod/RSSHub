import { Innertube } from 'youtubei.js';

import type { Data } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';

import utils, { getVideoUrl } from '../utils';
import { getSrtAttachmentBatch } from './subtitles';

const innertubePromise = Innertube.create({
    fetch: (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        return fetch(url, {
            method: input?.method,
            ...init,
        });
    },
});

export const getChannelIdByUsername = (username: string) =>
    cache.tryGet(`youtube:getChannelIdByUsername:${username}`, async () => {
        const innertube = await innertubePromise;
        const navigationEndpoint = await innertube.resolveURL(`https://www.youtube.com/${username}`);
        return navigationEndpoint.payload.browseId;
    });

export const getDataByUsername = async ({ username, embed, filterShorts, isJsonFeed }: { username: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const channelId = (await getChannelIdByUsername(username)) as string;
    return getDataByChannelId({ channelId, embed, filterShorts, isJsonFeed });
};

export const getDataByChannelId = async ({ channelId, embed, isJsonFeed }: { channelId: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await innertubePromise;
    const channel = await innertube.getChannel(channelId);
    const videos = await channel.getVideos();
    const videoSubtitles = isJsonFeed ? await getSrtAttachmentBatch(videos.videos.filter((video) => 'video_id' in video).map((video) => video.video_id)) : {};

    return {
        title: `${channel.metadata.title || channelId} - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: await Promise.all(
            videos.videos
                .filter((video) => 'video_id' in video)
                .map((video) => {
                    const srtAttachments = isJsonFeed ? videoSubtitles[video.video_id] || [] : [];
                    const img = 'best_thumbnail' in video ? video.best_thumbnail?.url : 'thumbnails' in video ? video.thumbnails?.[0]?.url : undefined;

                    return {
                        title: video.title.text || `YouTube Video ${video.video_id}`,
                        description: 'description_snippet' in video ? utils.renderDescription(embed, video.video_id, img, utils.formatDescription(video.description_snippet?.toHTML())) : null,
                        link: `https://www.youtube.com/watch?v=${video.video_id}`,
                        author: typeof video.author === 'string' ? video.author : video.author.name === 'N/A' ? undefined : video.author.name,
                        image: img,
                        pubDate: 'published' in video && video.published?.text ? parseRelativeDate(video.published.text) : undefined,
                        attachments: [
                            {
                                url: getVideoUrl(video.video_id),
                                mime_type: 'text/html',
                                duration_in_seconds: video.duration && 'seconds' in video.duration ? video.duration.seconds : undefined,
                            },
                            ...srtAttachments,
                        ],
                    };
                })
        ),
    };
};

export const getDataByPlaylistId = async ({ playlistId, embed }: { playlistId: string; embed: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await innertubePromise;
    const playlist = await innertube.getPlaylist(playlistId);
    const videos = await playlist.videos;

    return {
        title: `${playlist.info.title || playlistId} by ${playlist.info.author.name} - YouTube`,
        link: `https://www.youtube.com/playlist?list=${playlistId}`,
        image: playlist.info.thumbnails?.[0].url,
        description: playlist.info.description || `${playlist.info.title} by ${playlist.info.author.name}`,

        item: videos
            .filter((video) => 'id' in video)
            .map((video) => {
                const img = 'best_thumbnail' in video ? video.best_thumbnail?.url : video.thumbnails?.[0]?.url;

                return {
                    title: video.title.text || `YouTube Video ${video.id}`,
                    description: utils.renderDescription(embed, video.id, img, ''),
                    link: `https://www.youtube.com/watch?v=${video.id}`,
                    pubDate: 'published' in video && video.published?.text ? parseRelativeDate(video.published.text) : undefined,
                    author:
                        'author' in video
                            ? [
                                  {
                                      name: video.author.name,
                                      url: video.author.url,
                                      avatar: video.author.thumbnails?.[0]?.url,
                                  },
                              ]
                            : undefined,
                    image: img,
                    attachments: [
                        {
                            url: getVideoUrl(video.id),
                            mime_type: 'text/html',
                            duration_in_seconds: 'duration' in video && video.duration && 'seconds' in video.duration ? video.duration.seconds : undefined,
                        },
                    ],
                };
            }),
    };
};

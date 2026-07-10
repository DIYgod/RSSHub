import { Innertube } from 'youtubei.js';

import type { Data } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';

import utils, { getVideoUrl } from '../utils';
import { getSrtAttachmentBatch } from './subtitles';

let innertubePromise: Promise<Innertube> | undefined;

const getInnertube = () => {
    if (!innertubePromise) {
        // Lazy init to avoid network calls during import time (e.g. when building)
        innertubePromise = Innertube.create({
            fetch: (input, init) => {
                const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

                return fetch(url, {
                    method: input?.method,
                    ...init,
                });
            },
        });
    }
    return innertubePromise;
};

export const getChannelIdByUsername = (username: string) =>
    cache.tryGet(`youtube:getChannelIdByUsername:${username}`, async () => {
        const innertube = await getInnertube();
        const navigationEndpoint = await innertube.resolveURL(`https://www.youtube.com/${username}`);
        return navigationEndpoint.payload.browseId;
    });

export const getDataByUsername = async ({ username, embed, filterShorts, isJsonFeed }: { username: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const channelId = (await getChannelIdByUsername(username)) as string;
    return getDataByChannelId({ channelId, embed, filterShorts, isJsonFeed });
};

/**
 * Extract video ID from either legacy Video/GridVideo objects (video_id)
 * or the newer LockupView objects (content_id).
 */
const extractVideoId = (video: any): string | undefined => {
    if ('video_id' in video) {
        return video.video_id;
    }
    if ('content_id' in video && video.content_type === 'VIDEO') {
        return video.content_id;
    }
    if ('id' in video) {
        return video.id;
    }
    return undefined;
};

/**
 * Extract the relative-time publish string.
 * Legacy format: video.published.text
 * LockupView format: metadata.metadata.metadata_rows[].metadata_parts[].text.text
 */
const extractPublishedText = (video: any): string | undefined => {
    if ('published' in video && video.published?.text) {
        return video.published.text;
    }
    const rows = video.metadata?.metadata?.metadata_rows;
    if (Array.isArray(rows)) {
        for (const row of rows) {
            const parts = row?.metadata_parts;
            if (Array.isArray(parts)) {
                for (const part of parts) {
                    const text = part?.text?.text;
                    if (typeof text === 'string' && /ago$/i.test(text)) {
                        return text;
                    }
                }
            }
        }
    }
    return undefined;
};

/**
 * Extract the best available thumbnail URL.
 * Legacy: best_thumbnail.url or thumbnails[0].url
 * LockupView: content_image.image[0].url
 */
const extractThumbnail = (video: any): string | undefined => {
    if ('best_thumbnail' in video) {
        return video.best_thumbnail?.url;
    }
    if ('thumbnails' in video) {
        return video.thumbnails?.[0]?.url;
    }
    const images = video.content_image?.image;
    if (Array.isArray(images) && images.length > 0) {
        return images[0].url;
    }
    return undefined;
};

/**
 * Extract title text.
 * Legacy: video.title.text
 * LockupView: video.metadata.title.text
 */
const extractTitle = (video: any, videoId: string): string => {
    if (video.title?.text) {
        return video.title.text;
    }
    if (video.metadata?.title?.text) {
        return video.metadata.title.text;
    }
    return `YouTube Video ${videoId}`;
};

const extractAuthor = (video: any): string | undefined => {
    if (typeof video.author === 'string') {
        return video.author;
    }
    if (video.author && video.author.name !== 'N/A') {
        return video.author.name;
    }
    return undefined;
};

/**
 * Extract duration in seconds.
 * Legacy: video.duration.seconds
 * LockupView: parse from content_image.overlays[].badges[].text (e.g. "3:22")
 */
const extractDurationSeconds = (video: any): number | undefined => {
    if (video.duration && 'seconds' in video.duration) {
        return video.duration.seconds;
    }
    const overlays = video.content_image?.overlays;
    if (Array.isArray(overlays)) {
        for (const overlay of overlays) {
            const badges = overlay?.badges;
            if (Array.isArray(badges)) {
                for (const badge of badges) {
                    const text = badge?.text;
                    if (typeof text === 'string' && /^\d+:\d{2}(:\d{2})?$/.test(text)) {
                        const parts = text.split(':').map(Number);
                        if (parts.length === 3) {
                            return parts[0] * 3600 + parts[1] * 60 + parts[2];
                        }
                        return parts[0] * 60 + parts[1];
                    }
                }
            }
        }
    }
    return undefined;
};

export const getDataByChannelId = async ({ channelId, embed, isJsonFeed }: { channelId: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const videos = await channel.getVideos();

    const validVideos = videos.videos.filter((video) => extractVideoId(video) !== undefined);
    const videoIds = validVideos.map((video) => extractVideoId(video)!);
    const videoSubtitles = isJsonFeed ? await getSrtAttachmentBatch(videoIds) : {};

    return {
        title: `${channel.metadata.title || channelId} - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: await Promise.all(
            validVideos.map((video) => {
                const videoId = extractVideoId(video)!;
                const srtAttachments = isJsonFeed ? videoSubtitles[videoId] || [] : [];
                const img = extractThumbnail(video);
                const title = extractTitle(video, videoId);
                const publishedText = extractPublishedText(video);

                return {
                    title,
                    description: 'description_snippet' in video ? utils.renderDescription(embed, videoId, img, utils.formatDescription(video.description_snippet?.toHTML())) : utils.renderDescription(embed, videoId, img, ''),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                    author: extractAuthor(video),
                    image: img,
                    pubDate: publishedText ? parseRelativeDate(publishedText) : undefined,
                    attachments: [
                        {
                            url: getVideoUrl(videoId),
                            mime_type: 'text/html',
                            duration_in_seconds: extractDurationSeconds(video),
                        },
                        ...srtAttachments,
                    ],
                };
            })
        ),
    };
};

export const getDataByPlaylistId = async ({ playlistId, embed }: { playlistId: string; embed: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await getInnertube();
    const playlist = await innertube.getPlaylist(playlistId);
    const videos = await playlist.videos;

    return {
        title: `${playlist.info.title || playlistId} by ${playlist.info.author.name} - YouTube`,
        link: `https://www.youtube.com/playlist?list=${playlistId}`,
        image: playlist.info.thumbnails?.[0].url,
        description: playlist.info.description || `${playlist.info.title} by ${playlist.info.author.name}`,

        item: videos
            .filter((video) => extractVideoId(video) !== undefined)
            .map((video) => {
                const videoId = extractVideoId(video)!;
                const img = extractThumbnail(video);
                const title = extractTitle(video, videoId);
                const publishedText = extractPublishedText(video);

                return {
                    title,
                    description: utils.renderDescription(embed, videoId, img, ''),
                    link: `https://www.youtube.com/watch?v=${videoId}`,
                    pubDate: publishedText ? parseRelativeDate(publishedText) : undefined,
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
                            url: getVideoUrl(videoId),
                            mime_type: 'text/html',
                            duration_in_seconds: extractDurationSeconds(video),
                        },
                    ],
                };
            }),
    };
};

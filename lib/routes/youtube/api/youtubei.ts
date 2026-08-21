import { Innertube, YTNodes } from 'youtubei.js';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseRelativeDate } from '@/utils/parse-date';

import { getVideoUrl, renderYoutube } from '../utils';
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

const isLockupVideo = (video: unknown): video is YTNodes.LockupView => video instanceof YTNodes.LockupView;

const lockupViewToItem = (video: YTNodes.LockupView, embed: boolean): DataItem => {
    const videoId = video.content_id;
    const thumbnail = video.content_image?.is(YTNodes.ThumbnailView) ? video.content_image : undefined;
    const img = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const metadataRows = video.metadata?.metadata?.metadata_rows ?? [];
    const publishedText = metadataRows
        .flatMap((row) => row.metadata_parts ?? [])
        .map((part) => part.text?.text)
        .findLast((text) => text?.endsWith('ago'));
    const durationText = thumbnail?.overlays
        ?.filter((overlay) => overlay.is(YTNodes.ThumbnailBottomOverlayView))
        .flatMap((overlay) => overlay.badges ?? [])
        .find((badge) => /^\d+(?::\d+)+$/.test(badge.text))?.text;

    return {
        title: video.metadata?.title?.text || `YouTube Video ${videoId}`,
        description: renderYoutube(embed, videoId, img, ''),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        author: metadataRows.length > 1 ? metadataRows[0].metadata_parts?.[0]?.text?.text : undefined,
        image: img,
        pubDate: publishedText ? parseRelativeDate(publishedText) : undefined,
        attachments: [
            {
                url: getVideoUrl(videoId),
                mime_type: 'text/html',
                duration_in_seconds: durationText ? durationText.split(':').reduce((acc, part) => acc * 60 + Number(part), 0) : undefined,
            },
        ],
    };
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

export const getDataByChannelId = async ({ channelId, embed, isJsonFeed }: { channelId: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const videos = await channel.getVideos();
    const lockupVideos = videos.videos.filter((video) => isLockupVideo(video));
    const videoSubtitles = isJsonFeed ? await getSrtAttachmentBatch(lockupVideos.map((video) => video.content_id)) : {};

    return {
        title: `${channel.metadata.title || channelId} - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: lockupVideos.map((video) => {
            const item = lockupViewToItem(video, embed);
            item.attachments?.push(...(isJsonFeed ? videoSubtitles[video.content_id] || [] : []));
            return item;
        }),
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

        item: videos.filter((video) => isLockupVideo(video)).map((video) => lockupViewToItem(video, embed)),
    };
};

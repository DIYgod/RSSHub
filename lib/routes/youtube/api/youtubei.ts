import { Innertube } from 'youtubei.js';

import type { Data, DataItem } from '@/types';
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

const getVideoId = (video: any) => ('video_id' in video ? video.video_id : 'content_id' in video ? video.content_id : video.id);
const getVideoTitle = (video: any) => ('metadata' in video ? video.metadata?.title?.text : video.title?.text);
const getVideoImage = (video: any) => ('content_image' in video ? video.content_image?.image?.[0]?.url : 'best_thumbnail' in video ? video.best_thumbnail?.url : video.thumbnails?.[0]?.url);
const getVideoPublished = (video: any) => {
    if ('published' in video && video.published?.text) {
        return video.published.text;
    }
    const texts = (video.metadata?.metadata?.metadata_rows ?? []).flatMap((row: any) => (row.metadata_parts ?? []).map((part: any) => part.text?.text)).filter(Boolean);
    return texts.find((t: string) => /\d+\s+\w+\s+ago/i.test(t)) ?? texts.find((t: string) => /\b(?:today|yesterday|now)\b/i.test(t));
};
const parseDurationText = (text: string) => {
    if (!text || !/^\d+:\d{2}(?::\d{2})?$/.test(text)) {
        return;
    }
    return text
        .split(':')
        .map(Number)
        .reduce((acc, part) => acc * 60 + part, 0);
};
const getVideoDuration = (video: any) => {
    if (video.duration && 'seconds' in video.duration) {
        return video.duration.seconds;
    }
    const badgeText = (video.content_image?.overlays ?? [])
        .flatMap((overlay: any) => overlay.badges ?? [])
        .map((badge: any) => badge.text)
        .find(Boolean);
    return parseDurationText(badgeText);
};
const getVideoAuthor = (video: any) => {
    if ('content_id' in video) {
        return;
    }
    const author = video.author;
    if (typeof author === 'string') {
        return author;
    }
    if (Array.isArray(author)) {
        return author.map((a: any) => ({ name: a.name, url: a.url, avatar: a.thumbnails?.[0]?.url }));
    }
    if (author) {
        return author.name === 'N/A' ? undefined : author.name;
    }
    return;
};

const mapVideoToItem = (video: any, { embed, isJsonFeed, videoSubtitles }: { embed: boolean; isJsonFeed: boolean; videoSubtitles: Record<string, NonNullable<DataItem['attachments']>> }): DataItem => {
    const videoId = getVideoId(video);
    const img = getVideoImage(video);
    const description = 'description_snippet' in video ? utils.renderDescription(embed, videoId, img, utils.formatDescription(video.description_snippet?.toHTML())) : utils.renderDescription(embed, videoId, img, '');
    const srtAttachments = isJsonFeed ? videoSubtitles[videoId] || [] : [];
    const published = getVideoPublished(video);

    return {
        title: getVideoTitle(video) || `YouTube Video ${videoId}`,
        description,
        link: `https://www.youtube.com/watch?v=${videoId}`,
        author: getVideoAuthor(video),
        image: img,
        pubDate: published ? parseRelativeDate(published) : undefined,
        attachments: [
            {
                url: getVideoUrl(videoId),
                mime_type: 'text/html',
                duration_in_seconds: getVideoDuration(video),
            },
            ...srtAttachments,
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
    const videoSubtitles = isJsonFeed ? await getSrtAttachmentBatch(videos.videos.filter((video) => 'video_id' in video || 'content_id' in video).map((video) => getVideoId(video))) : {};

    return {
        title: `${channel.metadata.title || channelId} - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: videos.videos.filter((video) => 'video_id' in video || 'content_id' in video).map((video) => mapVideoToItem(video, { embed, isJsonFeed, videoSubtitles })),
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

        item: videos.filter((video) => 'id' in video || 'video_id' in video || 'content_id' in video).map((video) => mapVideoToItem(video, { embed, isJsonFeed: false, videoSubtitles: {} })),
    };
};

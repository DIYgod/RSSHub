import { Innertube, YTNodes } from 'youtubei.js';

import { config } from '@/config';
import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';

import { formatDescription, getVideoUrl, renderYoutube } from '../utils';
import { getSrtAttachmentBatch } from './subtitles';

let innertubePromise: Promise<Innertube> | undefined;

const getInnertube = () => {
    if (!innertubePromise) {
        // Lazy init to avoid network calls during import time (e.g. when building)
        innertubePromise = Innertube.create({
            fetch: (input, init) => {
                const url = input instanceof Request ? input.url : input.toString();

                return fetch(url, {
                    method: input?.method,
                    ...init,
                });
            },
        });
    }
    return innertubePromise;
};

const getThumbnailBadges = (video: YTNodes.LockupView) => {
    const thumbnail = video.content_image?.is(YTNodes.ThumbnailView) ? video.content_image : undefined;
    return thumbnail?.overlays.filter((overlay) => overlay.is(YTNodes.ThumbnailBottomOverlayView)).flatMap((overlay) => overlay.badges ?? []) ?? [];
};

const getMetadataTexts = (video: YTNodes.LockupView) => (video.metadata?.metadata?.metadata_rows ?? []).flatMap((row) => row.metadata_parts ?? []).map((part) => part.text?.text);

type StreamState = 'live' | 'upcoming' | 'completed';

// An ongoing stream carries a "LIVE" badge and a scheduled one an "Upcoming" badge, so anything else has already ended
const getStreamState = (video: YTNodes.LockupView): StreamState => {
    const badges = getThumbnailBadges(video);
    if (badges.some((badge) => badge.badge_style === 'THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE')) {
        return 'live';
    }
    if (badges.some((badge) => badge.text === 'Upcoming') || getMetadataTexts(video).some((text) => text?.startsWith('Scheduled for '))) {
        return 'upcoming';
    }
    return 'completed';
};

// The lockup of a video only carries its title, so the description takes one player request per video
const getVideoInfo = (videoId: string) =>
    cache.tryGet<{ description: string; startTimestamp?: string }>(
        `youtube:getVideoInfo:${videoId}`,
        async () => {
            const innertube = await getInnertube();
            const info = await innertube.getBasicInfo(videoId);
            return { description: info.basic_info.short_description ?? '', startTimestamp: info.basic_info.start_timestamp?.toISOString() };
        },
        config.cache.contentExpire,
        // The expiration is not renewed on a hit, so an edited description still shows up in a steadily polled feed
        false
    );

const lockupViewToItem = (video: YTNodes.LockupView, embed: boolean, description = ''): DataItem => {
    const videoId = video.content_id;
    const img = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const metadataRows = (video.metadata?.metadata?.metadata_rows ?? []).filter((row) => row.metadata_parts?.length);
    const publishedText = getMetadataTexts(video).findLast((text) => text?.endsWith('ago'));
    // A duration is grouped for readability once it reaches a thousand hours, e.g. `20,772:51:34`
    const durationText = getThumbnailBadges(video).find((badge) => /^[\d,]+(?::\d+)+$/.test(badge.text))?.text;

    return {
        title: video.metadata?.title?.text || `YouTube Video ${videoId}`,
        description: renderYoutube(embed, videoId, img, formatDescription(description)),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        author: metadataRows.length > 1 ? metadataRows[0].metadata_parts?.[0]?.text?.text : undefined,
        image: img,
        pubDate: publishedText ? parseRelativeDate(publishedText) : undefined,
        attachments: [
            {
                url: getVideoUrl(videoId),
                mime_type: 'text/html',
                duration_in_seconds: durationText ? durationText.split(':').reduce((acc, part) => acc * 60 + Number(part.replaceAll(',', '')), 0) : undefined,
            },
        ],
    };
};

export const getChannelIdByUsername = (username: string) =>
    cache.tryGet<string>(`youtube:getChannelIdByUsername:${username}`, async () => {
        const innertube = await getInnertube();
        const navigationEndpoint = await innertube.resolveURL(`https://www.youtube.com/${username}`);
        return navigationEndpoint.payload.browseId;
    });

export const getDataByUsername = async ({ username, embed, filterShorts, isJsonFeed }: { username: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const channelId = await getChannelIdByUsername(username);
    return getDataByChannelId({ channelId, embed, filterShorts, isJsonFeed });
};

export const getDataByChannelId = async ({ channelId, embed, isJsonFeed }: { channelId: string; embed: boolean; filterShorts: boolean; isJsonFeed: boolean }): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const videos = await channel.getVideos();
    const lockupVideos = videos.videos.filter((video) => video instanceof YTNodes.LockupView);
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

export const getStreamsByChannelId = async ({ channelId, embed }: { channelId: string; embed: boolean }): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const streams = await channel.getLiveStreams();
    const videos = streams.videos.filter((video) => video instanceof YTNodes.LockupView);
    const infos = await Promise.all(videos.map((video) => getVideoInfo(video.content_id)));

    return {
        title: `${channel.metadata.title || channelId} - Live - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}/streams`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        // The state is exposed as a category so that a single state can be picked out with the common `filter_category` parameter
        item: videos.map((video, index) => {
            const { description, startTimestamp } = infos[index];
            const item = lockupViewToItem(video, embed, description);
            return {
                ...item,
                pubDate: startTimestamp ? parseDate(startTimestamp) : item.pubDate,
                category: [getStreamState(video)],
            };
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

        item: videos.filter((video) => video instanceof YTNodes.LockupView).map((video) => lockupViewToItem(video, embed)),
    };
};

export const getShowsByChannelId = async (channelId: string): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const shows = await channel.getShows();

    return {
        title: `${channel.metadata.title || channelId} - Shows - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}/shows`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: shows.playlists
            .filter((show) => show instanceof YTNodes.GridShow)
            .map((show) => {
                const img = show.thumbnail_renderer?.thumbnail[0]?.url.replace(/\/hqdefault\.jpg\?.*$/, '/maxresdefault.jpg');
                const episodes = show.thumbnail_overlays[0]?.text?.text;
                return {
                    title: show.title.toString(),
                    description: `${img ? `<img src="${img}"><br>` : ''}${episodes ?? ''}`,
                    link: new URL(show.endpoint.metadata.url!, 'https://www.youtube.com').href,
                    author: show.author.name,
                    image: img,
                };
            }),
    };
};

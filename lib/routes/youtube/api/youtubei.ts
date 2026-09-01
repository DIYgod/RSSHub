import pMap from 'p-map';
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

// A duration is grouped for readability once it reaches a thousand hours, e.g. `20,772:51:34`
const DURATION_BADGE_REGEX = /^[\d,]+(?::\d+)+$/;
const UPCOMING_BADGE_TEXT = 'Upcoming';
const SCHEDULED_PREFIX = 'Scheduled for ';

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
    if (badges.some((badge) => badge.text === UPCOMING_BADGE_TEXT) || getMetadataTexts(video).some((text) => text?.startsWith(SCHEDULED_PREFIX))) {
        return 'upcoming';
    }
    return 'completed';
};

const getPubDate = (metadataTexts: Array<string | undefined>) => {
    const publishedText = metadataTexts.findLast((text) => text?.endsWith('ago'));
    if (publishedText) {
        return parseRelativeDate(publishedText);
    }
    // A stream that hasn't started has no publish date, only the time it is scheduled to start at
    const scheduledText = metadataTexts.find((text) => text?.startsWith(SCHEDULED_PREFIX));
    return scheduledText ? parseDate(scheduledText.slice(SCHEDULED_PREFIX.length), 'M/D/YY, h:mm A') : undefined;
};

// The lockup of a video only carries its title, so the description takes one player request per video
const getVideoDescription = async (videoId: string) => {
    try {
        // The value is wrapped in an object because an empty string does not survive a cache round trip
        const { description } = await cache.tryGet<{ description: string }>(
            `youtube:getVideoDescription:${videoId}`,
            async () => {
                const innertube = await getInnertube();
                const info = await innertube.getBasicInfo(videoId);
                return { description: info.basic_info.short_description ?? '' };
            },
            config.cache.contentExpire,
            // The expiration is not renewed on a hit, so an edited description still shows up in a steadily polled feed
            false
        );
        return description;
    } catch {
        // A stream can be unplayable, e.g. a members-only one, which should not take the whole feed down
        return '';
    }
};

const lockupViewToItem = (video: YTNodes.LockupView, embed: boolean, description = ''): DataItem => {
    const videoId = video.content_id;
    const img = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const metadataRows = video.metadata?.metadata?.metadata_rows ?? [];
    const durationText = getThumbnailBadges(video).find((badge) => DURATION_BADGE_REGEX.test(badge.text))?.text;

    return {
        title: video.metadata?.title?.text || `YouTube Video ${videoId}`,
        description: renderYoutube(embed, videoId, img, formatDescription(description)),
        link: `https://www.youtube.com/watch?v=${videoId}`,
        author: metadataRows.length > 1 ? metadataRows[0].metadata_parts?.[0]?.text?.text : undefined,
        image: img,
        pubDate: getPubDate(getMetadataTexts(video)),
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

export const getStreamsByChannelId = async ({
    channelId,
    embed,
    includeLive,
    includeUpcoming,
    includeCompleted,
    includeDescription,
}: {
    channelId: string;
    embed: boolean;
    includeLive: boolean;
    includeUpcoming: boolean;
    includeCompleted: boolean;
    includeDescription: boolean;
}): Promise<Data> => {
    const innertube = await getInnertube();
    const channel = await innertube.getChannel(channelId);
    const streams = await channel.getLiveStreams();
    const included = {
        live: includeLive,
        upcoming: includeUpcoming,
        completed: includeCompleted,
    };
    const videos = streams.videos.filter((video) => video instanceof YTNodes.LockupView).filter((video) => included[getStreamState(video)]);
    // pMap keeps the results in the order of the input, so a description matches the stream at the same index
    const descriptions = includeDescription ? await pMap(videos, (video) => getVideoDescription(video.content_id), { concurrency: 5 }) : [];

    return {
        title: `${channel.metadata.title || channelId} - Live - YouTube`,
        link: `https://www.youtube.com/channel/${channelId}/streams`,
        image: channel.metadata.avatar?.[0].url,
        description: channel.metadata.description,

        item: videos.map((video, index) => lockupViewToItem(video, embed, descriptions[index])),
        allowEmpty: true,
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

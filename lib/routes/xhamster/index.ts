import { load } from 'cheerio';
import { html } from 'hono/html';

import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:creators',
    categories: ['multimedia'],
    example: '/xhamster/faustina-pierre',
    parameters: {
        creators: 'Creator slug from the URL (e.g. `faustina-pierre`)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['xhamster.com/creators/:creators', 'xhamster.com/creators/:creators/newest'],
            target: '/:creators',
        },
    ],
    name: 'Newest Videos by Creator',
    maintainers: ['eve2ptp'],
    handler,
    url: 'xhamster.com/creators/faustina-pierre/newest',
};
interface VideoThumb {
    id: number;
    title: string;
    pageURL: string;
    thumbURL?: string;
    imageURL?: string;
    trailerURL?: string;
    trailerFallbackUrl?: string;
    created?: number;
    duration?: number;
    views?: number;
    isUHD?: boolean;
}
interface Initials {
    infoComponent?: {
        pornstarTop?: {
            name?: string;
        };
    };
    trendingVideoSectionComponent?: {
        videoListProps?: {
            videoThumbProps?: VideoThumb[];
        };
    };
}
function extractInitials(scriptContent: string): Initials {
    const match = scriptContent.match(/window\.initials\s*=\s*(\S[\s\S]*?);?$/);
    if (!match) {
        throw new Error('initials not found');
    }
    return JSON.parse(match[1]);
}
function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}
function renderDescription(video: VideoThumb): string {
    const thumb = video.imageURL ?? video.thumbURL;
    const duration = video.duration ? formatDuration(video.duration) : '';
    const views = video.views === undefined ? '' : video.views.toLocaleString();
    const parts: Array<ReturnType<typeof html>> = [];
    if (video.isUHD) {
        parts.push(html`<span>4K</span>`);
    }
    if (duration) {
        parts.push(html`<strong>Duration:</strong> ${duration}`);
    }
    if (views) {
        parts.push(html`<strong>Views:</strong> ${views}`);
    }
    const meta = parts.map((part, index) => html`${index ? ' · ' : ''}${part}`);
    return html(Object.assign(['\n        ', '\n        <p>', '</p>\n    '], { raw: ['\n        ', '\n        <p>', '</p>\n    '] }), thumb ? html`<img src="${thumb}" alt="${video.title}" style="max-width:100%" />` : '', meta)
        .toString()
        .trim();
}
function getMedia(video: VideoThumb): DataItem['media'] {
    const media: NonNullable<DataItem['media']> = {};
    const thumbnail = video.imageURL ?? video.thumbURL;
    if (thumbnail) {
        media.thumbnail = { url: thumbnail };
    }
    if (video.trailerURL) {
        media.content = {
            url: video.trailerURL,
            type: 'video/mp4',
        };
    }
    return media;
}
function getPublicationDate(timestamp?: number) {
    if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
        return;
    }
    const date = parseDate(timestamp * 1000);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function handler(ctx) {
    const { creators } = ctx.req.param();
    const pageUrl = `https://xhamster.com/creators/${encodeURIComponent(creators)}/newest`;
    const response = await got(pageUrl);
    const $ = load(response.data);
    const initialsRaw = $('#initials-script').text();
    if (!initialsRaw) {
        throw new Error('Could not locate initials script on page');
    }
    let initials: Initials;
    try {
        initials = extractInitials(initialsRaw);
    } catch {
        throw new Error('Failed to parse page data');
    }
    const creatorName = initials.infoComponent?.pornstarTop?.name ?? creators;
    const videos = initials.trendingVideoSectionComponent?.videoListProps?.videoThumbProps ?? [];
    const items = videos.map((video) => ({
        title: `${video.title}${video.isUHD ? ' [4K]' : ''}`,
        link: video.pageURL,
        pubDate: getPublicationDate(video.created),
        author: creatorName,
        description: renderDescription(video),
        media: getMedia(video),
    }));
    return {
        title: `${creatorName} - newest videos on xHamster`,
        link: pageUrl,
        description: `Latest videos from ${creatorName} on xHamster`,
        item: items,
    };
}

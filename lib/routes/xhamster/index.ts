import { load } from 'cheerio';
import type { Route } from '@/types';
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
    url: 'xhamster.com/faustina-pierre/newest',
};

interface VideoThumb {
    id: number;
    title: string;
    pageURL: string;
    thumbURL: string;
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
    const match = scriptContent.match(/window\.initials\s*=\s*([\s\S]*?);?$/);
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
    const quality = video.isUHD ? '<span>4K</span>' : '';

    let meta = "";

    if (quality) {
        meta += quality;
    }
    if (duration) {
        meta += `${meta ? " · " : ""}<strong>Duration:</strong> ${duration}`;
    }
    if (views) {
        meta += `${meta ? " · " : ""}<strong>Views:</strong> ${views}`;
    }

    return `
        <img src="${thumb}" alt="${video.title}" style="max-width:100%" />
        <p>${meta}</p>
    `.trim();
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
        pubDate: video.created ? parseDate(video.created * 1000) : undefined,
        author: creatorName,
        description: renderDescription(video),
        media: {
            content: {
                url: video.trailerURL ?? video.pageURL,
                type: 'video/mp4',
                ...(video.duration && { duration: video.duration }),
            },
            thumbnail: {
                url: video.imageURL ?? video.thumbURL,
            },
        },
    }));

    return {
        title: `${creatorName} - newest videos on xHamster`,
        link: pageUrl,
        description: `Latest videos from ${creatorName} on xHamster`,
        item: items,
    };
}

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
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
    name: '最近更新',
    maintainers: [],
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
    const withoutPrefix = scriptContent.replace(/^\s*window\.initials\s*=\s*/, '').trim();
    const jsonStr = withoutPrefix.endsWith(';') ? withoutPrefix.slice(0, -1) : withoutPrefix;
    return JSON.parse(jsonStr);
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function renderDescription(video: VideoThumb & { author?: string }): string {
    const thumb = video.imageURL ?? video.thumbURL;
    const duration = video.duration ? formatDuration(video.duration) : '';
    const views = video.views === undefined ? '' : video.views.toLocaleString();
    const quality = video.isUHD ? '<span>4K</span>' : '';

    return `
        <a href="${video.pageURL}">
            <img src="${thumb}" alt="${video.title}" style="max-width:100%" />
        </a>
        <p>
            ${quality}
            ${duration ? `<strong>Duration:</strong> ${duration}` : ''}
            ${views ? `｜<strong>Views:</strong> ${views}` : ''}
            ${video.author ? `｜<strong>Author:</strong> ${video.author}` : ''}
        </p>
    `.trim();
}

const GOT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: 'https://xhamster.com/',
};

async function handler(ctx) {
    const { creators } = ctx.req.param();
    const pageUrl = `https://xhamster.com/creators/${encodeURIComponent(creators)}/newest`;

    const response = await got(pageUrl, { headers: GOT_HEADERS });

    const $ = load(response.data);
    const initialsRaw = $('#initials-script').html();
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

    const items = await Promise.all(
        videos.map((video) =>
            cache.tryGet(`xhamster:video:${video.id}`, async () => {
                // 尝试获取单个视频页面以提取更完整的信息
                let author = creatorName;
                try {
                    const { data } = await got(video.pageURL, { headers: GOT_HEADERS });
                    const $page = load(data);
                    // 从视频页面提取作者名，xHamster 视频页的上传者通常在此选择器
                    const uploaderText = $page('.video-author-wrap a').first().text().trim();
                    if (uploaderText) {
                        author = uploaderText;
                    }
                } catch {
                    // 页面抓取失败时降级使用列表页数据
                }

                const enriched = { ...video, author };

                return {
                    title: `${video.title}${video.isUHD ? ' [4K]' : ''}`,
                    link: video.pageURL,
                    pubDate: video.created ? parseDate(video.created * 1000) : undefined,
                    author,
                    description: renderDescription(enriched),
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
                };
            })
        )
    );

    return {
        title: `${creatorName} – Newest | xHamster`,
        link: pageUrl,
        description: `Latest videos from ${creatorName} on xHamster`,
        item: items,
    };
}

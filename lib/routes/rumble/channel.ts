import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://rumble.com';
type RumbleVideoObject = {
    author?: {
        name?: string;
    };
    description?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
};
type RumbleListVideo = {
    relative_url?: string;
    tags?: string[];
    thumb?: string;
    title?: string;
    upload_date?: string;
    url?: string;
};

export const route: Route = {
    path: '/c/:channel/:embed?',
    categories: ['multimedia'],
    view: ViewType.Videos,
    name: 'Channel',
    maintainers: ['luckycold'],
    example: '/rumble/c/MikhailaPeterson',
    parameters: {
        channel: 'Channel slug from `https://rumble.com/c/<channel>`',
        embed: 'Default to embed the video, set to any value to disable embedding',
    },
    description: 'Fetches full Rumble video descriptions and embeds the player by default.',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rumble.com/c/:channel', 'rumble.com/c/:channel/videos'],
            target: '/c/:channel',
        },
    ],
    handler,
};

function parseChannelTitle($: ReturnType<typeof load>): string {
    return $('title').first().text().trim() || 'Rumble';
}

function parseDescription($: ReturnType<typeof load>, fallback: string | undefined): string | undefined {
    const paragraphs = $('div[data-js="media_long_description_container"] > p.media-description')
        .toArray()
        .map((element) => $.html(element))
        .filter(Boolean)
        .join('');

    return paragraphs || $('meta[name="description"]').attr('content')?.trim() || fallback || undefined;
}

function parseStructuredVideoObject($: ReturnType<typeof load>): RumbleVideoObject | undefined {
    const content = $('script[type="application/ld+json"]').text().trim();
    if (!content) {
        return;
    }

    const parsed = JSON.parse(content);
    const type = parsed?.['@type'];
    return type === 'VideoObject' ? (parsed as RumbleVideoObject) : undefined;
}

function parseListVideos($: ReturnType<typeof load>): RumbleListVideo[] {
    const content = $('rum-videos-grid script[type="application/json"]').text().trim();
    if (!content) {
        return [];
    }

    const parsed = JSON.parse(content);
    return Array.isArray(parsed?.items) ? parsed.items : [];
}

function parseImage($: ReturnType<typeof load>, videoObject: RumbleVideoObject | undefined) {
    const image = videoObject?.thumbnailUrl || $('meta[property="og:image"]').attr('content')?.trim();

    return image ? new URL(image, rootUrl).href : undefined;
}

function renderDescription(image: string | undefined, description: string | undefined, embedUrl: string | undefined, includeEmbed: boolean): string | undefined {
    let descriptionHtml = '';

    if (includeEmbed && embedUrl) {
        descriptionHtml += `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    } else if (image) {
        descriptionHtml += `<p><img src="${image}"></p>`;
    }

    if (description) {
        descriptionHtml += description;
    }

    return descriptionHtml || undefined;
}

function getMedia(image: string | undefined): DataItem['media'] {
    return image
        ? {
              thumbnail: {
                  url: image,
              },
              content: {
                  url: image,
                  medium: 'image',
              },
          }
        : undefined;
}

async function buildItem(link: string, title: string, listImage: string | undefined, pubDate: Date | undefined, includeEmbed: boolean, category: string[] | undefined): Promise<DataItem> {
    const response = await ofetch(link, {
        headers: {
            'user-agent': config.trueUA,
        },
        retryStatusCodes: [403],
    });

    const $ = load(response);
    const videoObject = parseStructuredVideoObject($);
    const image = listImage || parseImage($, videoObject);
    const description = renderDescription(image, parseDescription($, videoObject?.description?.trim()), videoObject?.embedUrl, includeEmbed);
    const author = videoObject?.author?.name;

    return {
        title,
        author,
        image,
        link,
        description,
        category,
        itunes_item_image: image,
        media: getMedia(image),
        pubDate,
    };
}

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const includeEmbed = !ctx.req.param('embed');
    const channelUrl = new URL(`/c/${encodeURIComponent(channel)}`, rootUrl).href;
    const videosUrl = `${channelUrl}/videos`;

    const response = await ofetch(videosUrl, {
        headers: {
            'user-agent': config.trueUA,
        },
        retryStatusCodes: [403],
    });

    const $ = load(response);

    const title = parseChannelTitle($);

    const videos = parseListVideos($);
    const items = await pMap(
        videos,
        (video) => {
            const videoUrl = video.url || video.relative_url;
            if (!videoUrl) {
                return null;
            }

            const url = new URL(videoUrl, rootUrl);
            url.search = '';

            const title = video.title;
            if (!title) {
                return null;
            }

            const imageRaw = video.thumb;
            const listImage = imageRaw ? new URL(imageRaw, rootUrl).href : undefined;
            const pubDateRaw = video.upload_date;
            const pubDate = pubDateRaw ? parseDate(pubDateRaw) : undefined;
            const category = video.tags?.length ? video.tags : undefined;

            return cache.tryGet(`${url.href}:${includeEmbed ? 'embed' : 'noembed'}`, () => buildItem(url.href, title, listImage, pubDate, includeEmbed, category));
        },
        { concurrency: 5 }
    );

    return {
        title: `Rumble - ${title}`,
        link: videosUrl,
        item: items.filter((item): item is DataItem => Boolean(item && item.link)),
    };
}

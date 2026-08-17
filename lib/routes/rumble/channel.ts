import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://rumble.com';
type RumbleVideoObject = {
    description?: string;
    embedUrl?: string;
    thumbnailUrl?: string;
};
type RumbleListVideo = {
    relative_url: string;
    thumb: string;
    title: string;
    upload_date: string;
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
        embed: 'Default to not embed the video, set to `embed` to enable embedding',
    },
    description: 'Fetches full Rumble video descriptions without embedding the player by default.',
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

function parseDescription($: CheerioAPI, fallback: string | undefined): string | undefined {
    const paragraphs = $('div[data-js="media_long_description_container"] > p.media-description')
        .toArray()
        .map((element) => $.html(element))
        .filter(Boolean)
        .join('');

    return paragraphs || $('meta[name="description"]').attr('content') || fallback || undefined;
}

function parseStructuredVideoObject($: CheerioAPI): RumbleVideoObject | undefined {
    const elements = $('script[type="application/ld+json"]').toArray();

    for (const element of elements) {
        try {
            const parsed = JSON.parse($(element).text());
            const videoObject = Array.isArray(parsed) ? parsed.find((item) => item?.['@type'] === 'VideoObject') : parsed;
            if (videoObject?.['@type'] === 'VideoObject') {
                return videoObject as RumbleVideoObject;
            }
        } catch {
            continue;
        }
    }
}

function parseListVideos($: CheerioAPI): RumbleListVideo[] {
    const content = $('rum-videos-grid script[type="application/json"]').text();
    if (!content) {
        return [];
    }

    try {
        const parsed = JSON.parse(content);
        return parsed.items;
    } catch {
        return [];
    }
}

function parseImage($: CheerioAPI, videoObject: RumbleVideoObject | undefined) {
    const image = videoObject?.thumbnailUrl || $('meta[property="og:image"]').attr('content');

    return image || undefined;
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

async function buildItem(link: string, title: string, listImage: string, pubDate: Date, includeEmbed: boolean): Promise<DataItem> {
    const initialResponse = await ofetch.raw<string>(link, {
        ignoreResponseError: true,
    });
    const cookies = (initialResponse.headers.getSetCookie?.() || []).map((cookie) => cookie.split(';', 1)[0]).join('; ');
    if (!cookies) {
        throw new Error(`Failed to get Rumble page cookie from ${link}`);
    }

    const response = await ofetch<string>(link, {
        headers: {
            Cookie: cookies,
        },
    });

    const $ = load(response);
    const videoObject = parseStructuredVideoObject($);
    const image = listImage || parseImage($, videoObject);
    const description = renderDescription(image, parseDescription($, videoObject?.description), videoObject?.embedUrl, includeEmbed);

    return {
        title,
        image,
        link,
        description,
        itunes_item_image: image,
        media: getMedia(image),
        pubDate,
    };
}

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const includeEmbed = ctx.req.param('embed') === 'embed';
    const channelUrl = new URL(`/c/${encodeURIComponent(channel)}`, rootUrl).href;
    const videosUrl = `${channelUrl}/videos`;

    const response = await ofetch(videosUrl);

    const $ = load(response);

    const title = $('title').first().text() || 'Rumble';

    const videos = parseListVideos($);
    const items = await pMap(
        videos,
        (video) => {
            const link = new URL(video.url || video.relative_url, rootUrl).href;
            const listImage = new URL(video.thumb, rootUrl).href;
            const pubDate = parseDate(video.upload_date);

            return cache.tryGet(`${link}:${includeEmbed ? 'embed' : 'noembed'}`, () => buildItem(link, video.title, listImage, pubDate, includeEmbed));
        },
        { concurrency: 5 }
    );

    return {
        title: `Rumble - ${title}`,
        link: videosUrl,
        item: items,
    };
}

import { load } from 'cheerio';
import type { Element } from 'domhandler';
import pMap from 'p-map';

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

    try {
        const parsed = JSON.parse(content);
        const type = parsed?.['@type'];
        return type === 'VideoObject' || (Array.isArray(type) && type.includes('VideoObject')) ? (parsed as RumbleVideoObject) : undefined;
    } catch {
        return;
    }
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

async function buildItem(link: string, title: string, listImage: string | undefined, pubDate: Date | undefined, includeEmbed: boolean): Promise<DataItem> {
    const response = await ofetch(link, {
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
        retryStatusCodes: [403],
    });

    const $ = load(response);

    const title = parseChannelTitle($);

    const videoElements = $('.videostream.thumbnail__grid--item[data-video-id]').toArray();
    const items = await pMap(
        videoElements,
        (element: Element) => {
            const $video = $(element);
            const href = $video.find('.videostream__link[href]').attr('href')?.trim();
            if (!href) {
                return null;
            }

            const url = new URL(href, rootUrl);
            url.search = '';

            const title = $video.find('.thumbnail__title').text().trim();
            if (!title) {
                return null;
            }

            const imageRaw = $video.find('img.thumbnail__image').attr('src');
            const listImage = imageRaw ? new URL(imageRaw, rootUrl).href : undefined;
            const pubDateRaw = $video.find('time.videostream__time[datetime]').attr('datetime')?.trim();
            const pubDate = pubDateRaw ? parseDate(pubDateRaw) : undefined;

            return cache.tryGet(`${url.href}:${includeEmbed ? 'embed' : 'noembed'}`, () => buildItem(url.href, title, listImage, pubDate, includeEmbed));
        },
        { concurrency: 5 }
    );

    return {
        title: `Rumble - ${title}`,
        link: videosUrl,
        item: items.filter((item): item is DataItem => Boolean(item && item.link)),
    };
}

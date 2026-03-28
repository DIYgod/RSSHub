import { load } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://rumble.com';

export const route: Route = {
    path: '/c/:channel/:embed?',
    categories: ['social-media'],
    view: ViewType.Videos,
    name: 'Channel',
    maintainers: ['luckycold'],
    example: '/rumble/c/Timcast',
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
            source: ['rumble.com/c/:channel'],
            target: '/c/:channel',
        },
    ],
    handler,
};

function parseChannelTitle($: ReturnType<typeof load>): string {
    const h1 = $('h1').first().text().trim();
    if (h1) {
        return h1;
    }

    const title = $('title').first().text().trim();
    return title || 'Rumble';
}

function parseDescription($: ReturnType<typeof load>): string | undefined {
    const paragraphs = $('div[data-js="media_long_description_container"] > p.media-description')
        .toArray()
        .map((element) => $.html(element))
        .filter(Boolean)
        .join('');

    return paragraphs || $('meta[name="description"]').attr('content')?.trim() || undefined;
}

function parseStructuredVideoObject($: ReturnType<typeof load>) {
    for (const element of $('script[type="application/ld+json"]').toArray()) {
        const content = $(element).text().trim();
        if (!content) {
            continue;
        }

        try {
            const parsed = JSON.parse(content);
            const entries = Array.isArray(parsed) ? parsed : [parsed];

            for (const entry of entries) {
                if (entry?.['@type'] === 'VideoObject') {
                    return entry as {
                        embedUrl?: string;
                        author?: {
                            name?: string;
                        };
                    };
                }
            }
        } catch {
            continue;
        }
    }
}

function renderDescription(image: string | undefined, description: string | undefined, embedUrl: string | undefined, includeEmbed: boolean): string | undefined {
    const parts: string[] = [];

    if (includeEmbed && embedUrl) {
        parts.push(`<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`);
    } else if (image) {
        parts.push(`<p><img src="${image}"></p>`);
    }

    if (description) {
        parts.push(description);
    }

    return parts.join('');
}

function fetchVideoDetails(link: string) {
    return cache.tryGet(link, async () => {
        const response = await ofetch(link, {
            headers: {
                'user-agent': config.trueUA,
            },
            retryStatusCodes: [403],
        });

        const $ = load(response);
        const videoObject = parseStructuredVideoObject($);
        const category = $('.media-by--category a').first().text().trim();

        return {
            author: videoObject?.author?.name || $('.channel-header--title').first().text().trim() || undefined,
            category: category || undefined,
            description: parseDescription($),
            embedUrl: videoObject?.embedUrl,
        };
    });
}

async function parseItemFromVideoElement($: ReturnType<typeof load>, videoElement: Element, includeEmbed: boolean): Promise<DataItem | null> {
    const $video = $(videoElement);
    const $link = $video.find('.title__link[href], .videostream__link[href]').first();
    const href = $link.attr('href')?.trim();
    if (!href) {
        return null;
    }

    const url = new URL(href, rootUrl);
    url.search = '';
    url.hash = '';

    const $title = $video.find('.thumbnail__title').first();
    const title = $title.attr('title')?.trim() || $title.text().trim() || url.pathname;

    const $img = $video.find('img.thumbnail__image, .thumbnail__thumb img').first();
    const imageRaw = $img.attr('src') || $img.attr('data-src');
    const image = imageRaw ? new URL(imageRaw, rootUrl).href : undefined;
    const pubDateRaw = $video.find('time.videostream__time[datetime], time[datetime]').first().attr('datetime')?.trim();
    const pubDate = pubDateRaw ? parseDate(pubDateRaw) : undefined;
    const details = await fetchVideoDetails(url.href);

    const media = image
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

    const description = renderDescription(image, details.description, details.embedUrl, includeEmbed);

    return {
        title,
        author: details.author,
        category: details.category ? [details.category] : undefined,
        link: url.href,
        description,
        itunes_item_image: image,
        media,
        pubDate,
    };
}

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const includeEmbed = !ctx.req.param('embed');
    const channelUrl = new URL(`/c/${encodeURIComponent(channel)}`, rootUrl).href;

    const response = await ofetch(channelUrl, {
        headers: {
            'user-agent': config.trueUA,
        },
        retryStatusCodes: [403],
    });

    const $ = load(response);

    const title = parseChannelTitle($);

    const uniqueIds = new Set<string>();
    const items = await Promise.all(
        $('.channel-listing__container .videostream[data-video-id], .videostream.thumbnail__grid--item[data-video-id]')
            .toArray()
            .map((element) => {
                const videoId = $(element).attr('data-video-id')?.trim();
                if (!videoId || uniqueIds.has(videoId)) {
                    return null;
                }

                uniqueIds.add(videoId);
                return parseItemFromVideoElement($, element, includeEmbed);
            })
    );

    return {
        title: `Rumble - ${title}`,
        link: channelUrl,
        item: items.filter((item): item is DataItem => Boolean(item && item.link)),
    };
}

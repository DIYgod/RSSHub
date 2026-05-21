import { load } from 'cheerio';
import { decodeHTML } from 'entities';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.ivoox.com';
const itunesAuthorSelector = String.raw`itunes\:author`;
const itunesCategorySelector = String.raw`itunes\:category`;
const itunesDurationSelector = String.raw`itunes\:duration`;
const itunesExplicitSelector = String.raw`itunes\:explicit`;
const itunesImageSelector = String.raw`itunes\:image`;

export const route: Route = {
    path: '/podcast/:id',
    categories: ['multimedia'],
    example: '/ivoox/podcast/11178419',
    parameters: {
        id: 'Podcast ID, can be found in the iVoox podcast URL after `_sq_f`, for example `11178419` or `f11178419`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.ivoox.com/podcast-*_sq_f:id_1.html', 'www.ivoox.com/en/podcast-*_sq_f:id_1.html', 'www.ivoox.com/*_sq_f:id_1.html', 'www.ivoox.com/en/*_sq_f:id_1.html'],
            target: (params) => `/podcast/${params.id}`,
        },
    ],
    name: 'Podcast',
    url: 'www.ivoox.com',
    maintainers: ['guillevc'],
    handler,
    description: 'Transforms an iVoox podcast page into an RSS feed that exposes the full episode audio enclosures instead of the short clip feed.',
    view: ViewType.Audios,
};

async function handler(ctx): Promise<Data> {
    const id = normalizePodcastId(ctx.req.param('id'));
    const limit = Number.parseInt(ctx.req.query('limit') ?? '10', 10);
    const feedUrl = `${rootUrl}/feed_fg_f${id}_filtro_1.xml`;
    const response = await ofetch(feedUrl, {
        parseResponse: (txt) => txt,
    });

    const $ = load(response, { xmlMode: true });
    const channel = $('channel').first();
    if (!channel.length) {
        throw new Error(`Invalid iVoox podcast feed for ID ${id}`);
    }

    const items = (
        await Promise.all(
            channel
                .children('item')
                .toArray()
                .slice(0, Number.isNaN(limit) ? 10 : limit)
                .map(async (element): Promise<DataItem | undefined> => {
                    const itemElement = $(element);
                    const enclosure = itemElement.children('enclosure').first();
                    const enclosureUrl = enclosure.attr('url');
                    const itemId = normalizeEpisodeId(childText(itemElement, 'guid') || childText(itemElement, 'link'));

                    if (!enclosureUrl) {
                        return;
                    }

                    const title = childText(itemElement, 'title');
                    const image = childAttr(itemElement, itunesImageSelector, 'href');
                    const length = parseOptionalInteger(enclosure.attr('length'));
                    const resolvedEnclosureUrl = itemId ? await resolveEpisodeAudioUrl(itemId, enclosureUrl, childText(itemElement, 'link')) : enclosureUrl;

                    return {
                        title,
                        description: childText(itemElement, 'description') || undefined,
                        link: childText(itemElement, 'link') || undefined,
                        pubDate: parseOptionalDate(childText(itemElement, 'pubDate')),
                        guid: childText(itemElement, 'guid') || undefined,
                        enclosure_url: resolvedEnclosureUrl,
                        enclosure_type: enclosure.attr('type') || mediaTypeFromUrl(resolvedEnclosureUrl),
                        enclosure_title: title,
                        ...(length === undefined ? {} : { enclosure_length: length }),
                        itunes_duration: childText(itemElement, itunesDurationSelector) || undefined,
                        itunes_item_image: image,
                    };
                })
        )
    ).filter((current): current is DataItem => current !== undefined);

    return {
        title: childText(channel, 'title'),
        description: childText(channel, 'description') || undefined,
        link: childText(channel, 'link') || rootUrl,
        item: items,
        image: childText(channel.children('image').first(), 'url') || childAttr(channel, itunesImageSelector, 'href'),
        itunes_image: childAttr(channel, itunesImageSelector, 'href') || childText(channel.children('image').first(), 'url') || undefined,
        language: normalizeLanguage(childText(channel, 'language')),
        feedLink: feedUrl,
        itunes_author: childText(channel, itunesAuthorSelector) || undefined,
        itunes_category: childAttr(channel, itunesCategorySelector, 'text'),
        itunes_explicit: childText(channel, itunesExplicitSelector) || undefined,
    };
}

function normalizePodcastId(id: string): string {
    const match = /^f?(\d+)$/i.exec(id);
    if (!match) {
        throw new InvalidParameterError(`Invalid iVoox podcast ID: ${id}`);
    }

    return match[1];
}

function normalizeEpisodeId(value: string): string | undefined {
    const match = /(?:_rf_|\/)(\d+)(?:_\d+)?(?:\.html)?/i.exec(value) ?? /(\d+)/.exec(value);
    return match?.[1];
}

function resolveEpisodeAudioUrl(audioId: string, fallbackUrl: string, referer: string): Promise<string> {
    return cache.tryGet(`ivoox:audio-url:${audioId}`, async () => {
        try {
            const response = await ofetch(`https://vcore-web.ivoox.com/v1/public/audios/${audioId}/download-url`);
            const downloadUrl = response?.data?.downloadUrl;
            if (typeof downloadUrl === 'string' && downloadUrl) {
                const audioResponse = await ofetch.raw(new URL(downloadUrl, rootUrl).href, {
                    headers: {
                        Referer: referer,
                    },
                    redirect: 'manual',
                    method: 'GET',
                });

                if (audioResponse.status >= 300 && audioResponse.status < 400) {
                    const location = audioResponse.headers.get('location');
                    if (location) {
                        return new URL(location, rootUrl).href;
                    }
                }

                if (audioResponse.url) {
                    return audioResponse.url;
                }

                return new URL(downloadUrl, rootUrl).href;
            }
        } catch {
            // Fall back to the original feed enclosure when iVoox does not return a direct URL.
        }

        return fallbackUrl;
    });
}

function childText(element, selector: string): string {
    return decodeHTML(element.children(selector).first().text());
}

function childAttr(element, selector: string, attribute: string): string | undefined {
    return element.children(selector).first().attr(attribute);
}

function parseOptionalDate(value: string): Date | undefined {
    return value ? parseDate(value) : undefined;
}

function parseOptionalInteger(value: string | undefined): number | undefined {
    if (!value) {
        return;
    }

    const number = Number.parseInt(value, 10);
    return Number.isNaN(number) ? undefined : number;
}

function normalizeLanguage(value: string): Data['language'] | undefined {
    const language = value.toLowerCase();
    return language ? ((language === 'es-es' ? 'es' : language) as Data['language']) : undefined;
}

function mediaTypeFromUrl(url: string): string {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith('.m4a')) {
        return 'audio/mp4';
    }

    if (pathname.endsWith('.ogg') || pathname.endsWith('.opus')) {
        return 'audio/ogg';
    }

    if (pathname.endsWith('.aac')) {
        return 'audio/aac';
    }

    return 'audio/mpeg';
}

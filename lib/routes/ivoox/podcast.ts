import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.ivoox.com';

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
    const rawId: string = ctx.req.param('id');
    const idMatch = /^f?(\d+)$/i.exec(rawId);
    if (!idMatch) {
        throw new InvalidParameterError(`Invalid iVoox podcast ID: ${rawId}`);
    }
    const id = idMatch[1];
    const feedUrl = `https://feeds.ivoox.com/feed_fg_f${id}_filtro_1.xml`;
    const response = await ofetch(feedUrl);

    const $ = load(response, { xml: true });
    const channel = $('channel');
    if (!channel.length) {
        throw new Error(`Invalid iVoox podcast feed for ID ${id}`);
    }

    const items = (
        await Promise.all(
            channel
                .children('item')
                .toArray()
                .map(async (element): Promise<DataItem | undefined> => {
                    const itemElement = $(element);
                    const enclosure = itemElement.children('enclosure');
                    const enclosureUrl = enclosure.attr('url');
                    const guid = itemElement.children('guid').text();
                    const itemIdMatch = /(?:_rf_|\/)(\d+)(?:_\d+)?(?:\.html)?/i.exec(guid) ?? /(\d+)/.exec(guid);
                    const itemId = itemIdMatch?.[1];

                    if (!enclosureUrl) {
                        return;
                    }

                    const title = itemElement.children('title').text();
                    const link = itemElement.children('link').text();
                    const image = itemElement.children(String.raw`itunes\:image`).attr('href');
                    const length = parseOptionalInteger(enclosure.attr('length'));
                    const resolvedEnclosureUrl = itemId ? await resolveEpisodeAudioUrl(itemId, enclosureUrl, link) : enclosureUrl;

                    return {
                        title,
                        description: itemElement.children('description').text() || undefined,
                        link: link || undefined,
                        pubDate: parseOptionalDate(itemElement.children('pubDate').text()),
                        guid: guid || undefined,
                        enclosure_url: resolvedEnclosureUrl,
                        enclosure_type: enclosure.attr('type') || mediaTypeFromUrl(resolvedEnclosureUrl),
                        enclosure_title: title,
                        ...(length !== undefined && { enclosure_length: length }),
                        itunes_duration: itemElement.children(String.raw`itunes\:duration`).text() || undefined,
                        itunes_item_image: image,
                    };
                })
        )
    ).filter((current): current is DataItem => current !== undefined);

    const rssImageUrl = channel.children('image').children('url').text();
    const itunesImageUrl = channel.children(String.raw`itunes\:image`).attr('href');

    return {
        title: channel.children('title').text(),
        description: channel.children('description').text() || undefined,
        link: channel.children('link').text() || rootUrl,
        item: items,
        image: rssImageUrl || itunesImageUrl,
        itunes_image: itunesImageUrl || rssImageUrl || undefined,
        language: normalizeLanguage(channel.children('language').text()),
        feedLink: feedUrl,
        itunes_author: channel.children(String.raw`itunes\:author`).text() || undefined,
        itunes_category: channel.children(String.raw`itunes\:category`).attr('text'),
        itunes_explicit:
            channel
                .children(String.raw`itunes\:explicit`)
                .first()
                .text() || undefined,
    };
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

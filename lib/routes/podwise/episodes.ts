import { type CheerioAPI, load } from 'cheerio';
import { escape } from 'entities/escape';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/explore/:type',
    categories: ['multimedia'],
    example: '/podwise/explore/latest',
    parameters: { type: 'latest or all episodes.' },
    radar: [
        {
            source: ['podwise.ai/explore/:type'],
        },
    ],
    name: 'Episodes',
    maintainers: ['lyling'],
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const link = `https://podwise.ai/explore/${type}`;
        const pageSource1 = await ofetch(link);
        const $ = load(pageSource1);
        const links = [
            ...new Set(
                $('main a.group[href^="/episodes/"]')
                    .toArray()
                    .map((item) => new URL($(item).attr('href')!, link).href)
            ),
        ];
        const items = await pMap(
            links,
            async (episodeLink): Promise<DataItem> => ({
                link: episodeLink,
                ...(await cache.tryGet(`podwise:episode:v5:${episodeLink}`, async () => {
                    const pageSource2 = await ofetch(episodeLink);
                    const $ = load(pageSource2);
                    const data = parseEpisodeData($);
                    const episode = data.episode;
                    const enclosureType = toEnclosureType(episode.LinkType);
                    const date = episode.PublishTime?.replace(/^\$D/, '');
                    return {
                        title: episode.Title,
                        author: episode.PodName,
                        language: toEpisodeLanguage(episode.Language),
                        description: renderEpisodeDescription(episode.Description || data.previewContent?.summary),
                        pubDate: date ? parseDate(date) : undefined,
                        itunes_item_image: episode.EpImg || episode.Img,
                        itunes_duration: parseDuration(episode.Duration),
                        ...(enclosureType && episode.Link && { enclosure_url: episode.Link, enclosure_type: enclosureType }),
                    };
                })),
            }),
            { concurrency: 3 }
        );
        return {
            title: $('main h1').first().text(),
            description: $('meta[name="description"]').attr('content'),
            link,
            item: items,
        };
    },
};

interface EpisodeData {
    episode: {
        Title: string;
        Description?: string;
        Language?: string | null;
        PodName?: string;
        Link?: string;
        LinkType?: string;
        PublishTime?: string;
        Img?: string;
        EpImg?: string;
        Duration?: string;
    };
    previewContent?: { summary?: string };
}

function parseEpisodeData($: CheerioAPI): EpisodeData {
    const stream = $('script')
        .toArray()
        .flatMap((script) => {
            const match = $(script)
                .text()
                .match(/self\.__next_f\.push\(([\s\S]+)\)/);
            if (!match) {
                return [];
            }
            const frame = JSON.parse(match[1]);
            return frame[0] === 1 && typeof frame[1] === 'string' ? [frame[1]] : [];
        })
        .join('');
    const bytes = Buffer.from(stream, 'utf8');
    const textRecords = new Map<string, string>();
    const records: Array<[unknown, unknown, unknown, { data?: EpisodeData }?]> = [];
    let offset = 0;
    while (offset < bytes.length) {
        const colon = bytes.indexOf(':', offset);
        const newline = bytes.indexOf('\n', offset);
        if (colon === -1 || !/^[a-f\d]+$/i.test(bytes.subarray(offset, colon).toString())) {
            offset = newline === -1 ? bytes.length : newline + 1;
            continue;
        }
        const id = bytes.subarray(offset, colon).toString();
        if (bytes[colon + 1] === 84) {
            const comma = bytes.indexOf(',', colon + 2);
            const size = bytes.subarray(colon + 2, comma).toString();
            if (comma === -1 || !/^[a-f\d]+$/i.test(size)) {
                throw new Error('Podwise contains an invalid public text record.');
            }
            const end = comma + 1 + Number.parseInt(size, 16);
            if (end > bytes.length) {
                throw new Error('Podwise contains an incomplete public text record.');
            }
            textRecords.set(id, bytes.subarray(comma + 1, end).toString('utf8'));
            offset = end;
            if (bytes[offset] === 10) {
                offset++;
            }
            continue;
        }
        const record = bytes.subarray(colon + 1, newline === -1 ? bytes.length : newline).toString('utf8');
        if (record.startsWith('[')) {
            try {
                records.push(JSON.parse(record));
            } catch {
                // Other public transport records are not episode metadata.
            }
        }
        offset = newline === -1 ? bytes.length : newline + 1;
    }
    for (const record of records) {
        const data: EpisodeData | undefined = record[3]?.data;
        if (data?.episode?.Title) {
            return {
                ...data,
                episode: { ...data.episode, Description: resolveFlightText(data.episode.Description, textRecords) },
                previewContent: data.previewContent ? { ...data.previewContent, summary: resolveFlightText(data.previewContent.summary, textRecords) } : undefined,
            };
        }
    }
    throw new Error('Podwise episode metadata was not found in the public page.');
}

function resolveFlightText(value: string | undefined, records: Map<string, string>): string | undefined {
    if (value?.startsWith('$$')) {
        return value.slice(1);
    }
    const reference = value?.match(/^\$([a-f\d]+)$/i);
    if (reference) {
        const text = records.get(reference[1]);
        if (text === undefined) {
            throw new Error('A referenced Podwise public text record was not found.');
        }
        return text;
    }
    return value === '$undefined' ? undefined : value;
}

function parseDuration(duration?: string): number | undefined {
    if (!duration) {
        return;
    }
    const parts = duration.split(':').map(Number);
    return parts.every((part) => Number.isFinite(part) && part >= 0) ? parts.reduce((total, part) => total * 60 + part, 0) : undefined;
}

function toEnclosureType(linkType?: string): string | undefined {
    switch (linkType) {
        case 'mp3':
            return 'audio/mpeg';
        case 'm4a':
            return 'audio/mp4';
        case 'mp4':
            return 'video/mp4';
    }
}

function renderEpisodeDescription(description?: string): string | undefined {
    if (!description) {
        return;
    }
    return /<\/?[a-z][^>]*>/i.test(description) ? description : `<p>${escape(description).replaceAll('\n', '<br>')}</p>`;
}

function toEpisodeLanguage(language?: string | null): DataItem['language'] {
    switch (language) {
        case 'Chinese':
            return 'zh-CN';
        case 'English':
            return 'en';
        case 'Czech':
            return 'cs';
        case 'German':
            return 'de';
    }
}

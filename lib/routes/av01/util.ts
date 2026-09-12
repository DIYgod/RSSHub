import type { Context } from 'hono';

import type { Data, DataItem } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.av01.media';

type Endpoint = 'actress' | 'tag';

interface Named {
    name: string;
    name_translations?: Record<string, string> | null;
}

interface Video {
    id: number;
    dvd_id: string;
    title: string;
    description: string;
    description_translations?: Record<string, string> | null;
    uploaded_time: string;
    maker: string;
    actresses: Named[];
    tags: Named[];
}

const allNames = (named: Named) => [...new Set([named.name, ...Object.values(named.name_translations ?? {})])].join(' / ');

const resolveId = (endpoint: Endpoint, name: string) =>
    cache.tryGet(`av01:${endpoint}:${name}`, async () => {
        const { aggregations } = await ofetch<{ aggregations: Record<'actresses' | 'tags', Array<Named & { id: number }>> }>(`${baseUrl}/api/v1/videos/search`, {
            method: 'POST',
            query: { lang: 'jp', include_facets: true },
            body: { query: name, pagination: { page: 1, limit: 20 } },
        });
        const candidates = aggregations[endpoint === 'actress' ? 'actresses' : 'tags'];
        return String((candidates.find((c) => c.name === name) ?? candidates[0]).id);
    });

export const fetchVideos = async (ctx: Context, endpoint: Endpoint, key: string): Promise<Data> => {
    const id = /^\d+$/.test(key) ? key : await resolveId(endpoint, key);
    const limit = ctx.req.query('limit') ?? '20';
    const response = await ofetch<Record<'actress' | 'tag', Named> & { videos: Video[] }>(`${baseUrl}/api/v1/videos/${endpoint}/${id}`, {
        query: { page: 1, limit },
    });

    return {
        title: `${response[endpoint].name} - AV01`,
        link: `${baseUrl}/jp/${endpoint}/${id}`,
        item: response.videos.map((video): DataItem => ({
            title: `${video.dvd_id} ${video.title}`,
            description: [video.description, ...Object.entries(video.description_translations ?? {}).map(([lang, text]) => `${lang}: ${text}`)].join('<br><br>'),
            link: `${baseUrl}/jp/video/${video.id}/${video.dvd_id.toLowerCase()}`,
            pubDate: parseDate(video.uploaded_time),
            author: video.actresses.map((actress) => allNames(actress)).join(', ') || video.maker,
            category: video.tags.map((tag) => allNames(tag)),
        })),
    };
};

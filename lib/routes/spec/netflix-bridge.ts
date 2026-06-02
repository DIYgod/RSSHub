import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { assertEnv, buildCacheKey } from './utils';

const NETFLIX_ORIGIN = 'https://www.netflix.com';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const BRIDGE_TTL = 30 * 24 * 60 * 60; // 30 days — IDs never change

export interface TmdbBridge {
    tmdbSeriesId: string;
    tmdbType: 'tv' | 'movie';
    imdbId: string;
}

/** Sentinel stored in cache when a Netflix title is not found, to avoid repeated fetches. */
interface BridgeNotFound {
    _notFound: true;
}

type BridgeResult = TmdbBridge | BridgeNotFound;

interface TmdbFindResult {
    tv_results?: Array<{ id: number }>;
    movie_results?: Array<{ id: number }>;
}

async function fetchBridgeResult(netflixTitleId: string): Promise<BridgeResult> {
    const apiKey = assertEnv('TMDB_API_KEY', 'ERR_TMDB_API_KEY_MISSING');

    let html: string | null = null;
    try {
        html = await ofetch<string>(`${NETFLIX_ORIGIN}/title/${netflixTitleId}`, {
            parseResponse: (txt) => txt,
        });
    } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
            return { _notFound: true };
        }
        throw error;
    }

    const imdbMatch = html.match(/<meta property="imdb:pageConst" content="(tt\d+)"/);
    if (!imdbMatch) {
        return { _notFound: true };
    }
    const imdbId = imdbMatch[1];

    const findResult = await ofetch<TmdbFindResult>(`${TMDB_API_BASE}/find/${imdbId}`, {
        query: { external_source: 'imdb_id', api_key: apiKey },
    });

    const tvHit = findResult.tv_results?.[0];
    if (tvHit) {
        return { tmdbSeriesId: String(tvHit.id), tmdbType: 'tv', imdbId };
    }

    const movieHit = findResult.movie_results?.[0];
    if (movieHit) {
        return { tmdbSeriesId: String(movieHit.id), tmdbType: 'movie', imdbId };
    }

    return { _notFound: true };
}

export async function resolveNetflixToTmdb(netflixTitleId: string): Promise<TmdbBridge | null> {
    const result = (await cache.tryGet(buildCacheKey('netflix', 'bridge', netflixTitleId), () => fetchBridgeResult(netflixTitleId), BRIDGE_TTL)) as BridgeResult;

    if ('_notFound' in result) {
        return null;
    }
    return result as TmdbBridge;
}

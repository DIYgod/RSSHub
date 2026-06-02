import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { assertEnv, buildCacheKey } from './utils';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

export interface TmdbEpisode {
    id: number;
    name: string;
    overview: string;
    still_path: string | null;
    air_date: string | null;
    season_number: number;
    episode_number: number;
}

export interface TmdbSeason {
    season_number: number;
    episodes: TmdbEpisode[];
}

export interface TmdbSeries {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    number_of_seasons: number;
    genres: Array<{ id: number; name: string }>;
}

export interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string | null;
}

function tmdbGet<T>(path: string, query: Record<string, string> = {}): Promise<T> {
    const apiKey = assertEnv('TMDB_API_KEY', 'ERR_TMDB_API_KEY_MISSING');
    return ofetch<T>(`${TMDB_API_BASE}${path}`, {
        query: { api_key: apiKey, ...query },
    });
}

export async function fetchTmdbSeries(tmdbId: string): Promise<TmdbSeries> {
    const result = await cache.tryGet(buildCacheKey('netflix', 'tmdb', 'series', tmdbId), () => tmdbGet<TmdbSeries>(`/tv/${tmdbId}`), 24 * 60 * 60);
    return result as TmdbSeries;
}

export async function fetchTmdbSeason(tmdbId: string, seasonNumber: number): Promise<TmdbSeason> {
    const result = await cache.tryGet(buildCacheKey('netflix', 'tmdb', 'season', tmdbId, String(seasonNumber)), () => tmdbGet<TmdbSeason>(`/tv/${tmdbId}/season/${seasonNumber}`), 6 * 60 * 60);
    return result as TmdbSeason;
}

export async function fetchTmdbMovie(tmdbId: string): Promise<TmdbMovie> {
    const result = await cache.tryGet(buildCacheKey('netflix', 'tmdb', 'movie', tmdbId), () => tmdbGet<TmdbMovie>(`/movie/${tmdbId}`), 24 * 60 * 60);
    return result as TmdbMovie;
}

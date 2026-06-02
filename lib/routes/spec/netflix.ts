import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import type { SpecExtraNetflix } from '@/types/spec-extra';
import { parseDate } from '@/utils/parse-date';

import { resolveNetflixToTmdb } from './netflix-bridge';
import { fetchTmdbMovie, fetchTmdbSeason, fetchTmdbSeries, TMDB_IMAGE_BASE } from './netflix-tmdb';

const NETFLIX_ORIGIN = 'https://www.netflix.com';

export const route: Route = {
    path: '/netflix/:netflixTitleId',
    categories: ['multimedia'],
    example: '/spec/netflix/81249997',
    parameters: {
        netflixTitleId: 'Netflix title ID from netflix.com/title/:id (e.g. 81249997 for Squid Game)',
    },
    features: {
        requireConfig: [
            {
                name: 'TMDB_API_KEY',
                optional: false,
                description: 'Free TMDB API key from themoviedb.org/settings/api',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        supportRadar: true,
    },
    url: 'netflix.com',
    name: 'Title Episodes',
    maintainers: ['koreanpatch'],
    radar: [
        {
            source: ['www.netflix.com/title/:netflixTitleId'],
            target: '/spec/netflix/:netflixTitleId',
        },
        {
            source: ['www.netflix.com/watch/:netflixTitleId'],
            target: '/spec/netflix/:netflixTitleId',
        },
    ],
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const netflixTitleId = ctx.req.param('netflixTitleId');

    const bridge = await resolveNetflixToTmdb(netflixTitleId);
    if (!bridge) {
        return {
            title: `Netflix ${netflixTitleId}`,
            item: [],
            allowEmpty: true,
            description: 'Title not found or removed from Netflix.',
        };
    }

    const { tmdbSeriesId, tmdbType, imdbId } = bridge;

    if (tmdbType === 'movie') {
        const movie = await fetchTmdbMovie(tmdbSeriesId);
        const thumbnailUrl = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '';
        const pubDate = movie.release_date ? parseDate(movie.release_date) : undefined;

        const extra: SpecExtraNetflix = {
            type: 'netflix/film',
            platform: 'netflix',
            sourceUrl: `${NETFLIX_ORIGIN}/title/${netflixTitleId}`,
            externalId: netflixTitleId,
            seriesExternalId: netflixTitleId,
            publishedAt: pubDate?.toISOString(),
            netflixTitleId,
            tmdbSeriesId,
            imdbId,
            thumbnailUrl,
            subtitleStatus: 'none',
            captionLanguages: [],
        };

        return {
            title: `${movie.title} — Netflix`,
            link: `${NETFLIX_ORIGIN}/title/${netflixTitleId}`,
            item: [
                {
                    title: movie.title,
                    link: `${NETFLIX_ORIGIN}/title/${netflixTitleId}`,
                    guid: `spec-netflix-film-${netflixTitleId}`,
                    pubDate,
                    image: thumbnailUrl,
                    description: [thumbnailUrl ? `<img src="${thumbnailUrl}" />` : '', movie.overview ? `<p>${movie.overview}</p>` : ''].filter(Boolean).join('\n'),
                    _extra: extra,
                },
            ],
        };
    }

    const series = await fetchTmdbSeries(tmdbSeriesId);

    const latestSeasons = Math.max(1, series.number_of_seasons);
    const seasonsToFetch = [latestSeasons, latestSeasons - 1].filter((n) => n >= 1);

    const seasonResults = await Promise.all(seasonsToFetch.map((n) => fetchTmdbSeason(tmdbSeriesId, n)));

    const items: DataItem[] = [];

    for (const season of seasonResults) {
        for (const ep of season.episodes) {
            const link = `${NETFLIX_ORIGIN}/title/${netflixTitleId}`;
            const thumbnailUrl = ep.still_path ? `${TMDB_IMAGE_BASE}${ep.still_path}` : series.poster_path ? `${TMDB_IMAGE_BASE}${series.poster_path}` : '';
            const pubDate = ep.air_date ? parseDate(ep.air_date) : undefined;
            const episodeLabel = `S${String(ep.season_number).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;

            const extra: SpecExtraNetflix = {
                type: 'netflix/episode',
                platform: 'netflix',
                sourceUrl: link,
                externalId: `${netflixTitleId}-S${ep.season_number}E${ep.episode_number}`,
                seriesExternalId: netflixTitleId,
                episodeLabel,
                publishedAt: pubDate?.toISOString(),
                netflixTitleId,
                tmdbSeriesId,
                tmdbEpisodeId: ep.id,
                imdbId,
                thumbnailUrl,
                subtitleStatus: 'none',
                captionLanguages: [],
            };

            items.push({
                title: `${series.name} — ${episodeLabel} ${ep.name}`,
                link,
                guid: `spec-netflix-${netflixTitleId}-${ep.id}`,
                pubDate,
                image: thumbnailUrl,
                description: [thumbnailUrl ? `<img src="${thumbnailUrl}" />` : '', ep.overview ? `<p>${ep.overview}</p>` : ''].filter(Boolean).join('\n'),
                _extra: extra,
            });
        }
    }

    items.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));

    return {
        title: `${series.name} — Netflix`,
        link: `${NETFLIX_ORIGIN}/title/${netflixTitleId}`,
        item: items,
    };
}

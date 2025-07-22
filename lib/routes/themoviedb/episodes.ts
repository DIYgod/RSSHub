import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import apiKey from './api-key';
import { handleDescription } from './utils';

export const route: Route = {
    path: '/tv/:id/seasons/:seasonNumber/episodes/:lang?',
    categories: ['multimedia'],
    example: '/themoviedb/tv/70593/seasons/1/episodes/en-US',
    parameters: { id: 'TV show ID', seasonNumber: 'Season number', lang: 'Language' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'TV Show Episodes',
    maintainers: ['x2cf'],
    handler,
};

async function handler(ctx) {
    const { id, seasonNumber, lang } = ctx.req.param();
    const searchParams = {
        language: lang,
        api_key: apiKey(),
    };
    const { data: tvShowDetails } = await got(`https://api.themoviedb.org/3/tv/${id}`, { searchParams });
    const { data: seasonDetails } = await got(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`, { searchParams });

    return {
        title: `${tvShowDetails.name} ${seasonDetails.name} — TMDB`,
        description: seasonDetails.overview.trim(),
        image: `https://image.tmdb.org/t/p/original${seasonDetails.poster_path}`,
        link: `https://www.themoviedb.org/tv/${tvShowDetails.id}/season/${seasonDetails.season_number}`,
        item: seasonDetails.episodes.toReversed().map((item) => ({
            title: `${item.episode_number} ${item.name}`,
            link: `https://www.themoviedb.org/tv/${tvShowDetails.id}/season/${item.season_number}/episode/${item.episode_number}`,
            description: handleDescription(item),
            pubDate: item.air_date ? parseDate(item.air_date) : undefined,
        })),
    };
}

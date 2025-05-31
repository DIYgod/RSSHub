import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import apiKey from './api-key';
import { handleDescription } from './utils';

export const route: Route = {
    path: '/tv/:id/seasons/:lang?',
    categories: ['multimedia'],
    view: ViewType.Notifications,
    example: '/themoviedb/tv/70593/seasons/en-US',
    parameters: { id: 'TV show ID', lang: 'Language' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'TV Show Seasons',
    maintainers: ['x2cf'],
    handler,
};

async function handler(ctx) {
    const { id, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/tv/${id}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    return {
        title: `${data.name} - Seasons — TMDB`,
        description: data.overview.trim(),
        image: `https://image.tmdb.org/t/p/original${data.poster_path}`,
        link: `https://www.themoviedb.org/tv/${data.id}/seasons`,
        item: data.seasons.map((item) => {
            item.vote_average = data.vote_average;
            item.vote_count = data.vote_count;
            return {
                title: item.name,
                link: `https://www.themoviedb.org/tv/${data.id}/season/${item.season_number}`,
                description: handleDescription(item),
                pubDate: item.air_date ? parseDate(item.air_date) : undefined,
            };
        }),
    };
}

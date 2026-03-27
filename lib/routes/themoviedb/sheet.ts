import type { Route } from '@/types';
import got from '@/utils/got';

import apiKey from './api-key';
import { MEDIA_TYPE_TO_ITEM_HANDLE } from './utils';

const API_PATH = {
    movie: {
        'now-playing': 'movie/now_playing',
        upcoming: 'movie/upcoming',
        'top-rated': 'movie/top_rated',
    },
    tv: {
        'airing-today': 'tv/airing_today',
        'on-the-air': 'tv/on_the_air',
        'top-rated': 'tv/top_rated',
    },
};

const TITLE = {
    movie: {
        'now-playing': 'Now Playing Movies',
        upcoming: 'Upcoming Movies',
        'top-rated': 'Top Rated Movies',
    },
    tv: {
        'airing-today': 'TV Shows Airing Today',
        'on-the-air': 'Currently Airing TV Shows',
        'top-rated': 'Top Rated TV Shows',
    },
};

export const route: Route = {
    path: '/:mediaType/:sheet/:lang?',
    categories: ['multimedia'],
    example: '/themoviedb/tv/top-rated/en-US',
    parameters: { mediaType: '`movie` or `tv`', sheet: 'Sheet, see below', lang: 'Language' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Sheet',
    maintainers: ['x2cf'],
    handler,
    description: `When \`mediaType\` is \`tv\`, \`sheet\` should be:

| Airing Today | On TV      | Top Rated |
| ------------ | ---------- | --------- |
| airing-today | on-the-air | top-rated |

  When \`mediaType\` is \`movie\`, \`sheet\` should be:

| Now Playing | Upcoming | Top Rated |
| ----------- | -------- | --------- |
| now-playing | upcoming | top-rated |`,
};

async function handler(ctx) {
    const { mediaType, sheet, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/${API_PATH[mediaType][sheet]}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    return {
        title: `${TITLE[mediaType][sheet]} — TMDB`,
        link: `https://www.themoviedb.org/${mediaType}/${sheet}`,
        item: data.results.map((item) => MEDIA_TYPE_TO_ITEM_HANDLE[mediaType](item, lang)),
    };
}

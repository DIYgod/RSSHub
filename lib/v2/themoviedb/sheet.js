const got = require('@/utils/got');
const apiKey = require('./api-key');
const { MEDIA_TYPE_TO_ITEM_HANDLE } = require('./utils');

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

module.exports = async (ctx) => {
    const { mediaType, sheet, lang } = ctx.params;
    const { data } = await got(`https://api.themoviedb.org/3/${API_PATH[mediaType][sheet]}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    ctx.state.data = {
        title: `${TITLE[mediaType][sheet]} — TMDB`,
        link: `https://www.themoviedb.org/${mediaType}/${sheet}`,
        item: data.results.map((item) => MEDIA_TYPE_TO_ITEM_HANDLE[mediaType](item, lang)),
    };
};

const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const apiKey = require('./api-key');
const { handleDescription } = require('./utils');

module.exports = async (ctx) => {
    const { id, seasonNumber, lang } = ctx.params;
    const searchParams = {
        language: lang,
        api_key: apiKey(),
    };
    const { data: tvShowDetails } = await got(`https://api.themoviedb.org/3/tv/${id}`, { searchParams });
    const { data: seasonDetails } = await got(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`, { searchParams });

    ctx.state.data = {
        title: `${tvShowDetails.name} ${seasonDetails.name} — TMDB`,
        description: seasonDetails.overview.trim(),
        image: `https://image.tmdb.org/t/p/original${seasonDetails.poster_path}`,
        link: `https://www.themoviedb.org/tv/${tvShowDetails.id}/season/${seasonDetails.season_number}`,
        item: seasonDetails.episodes.reverse().map((item) => ({
            title: `${item.episode_number} ${item.name}`,
            link: `https://www.themoviedb.org/tv/${tvShowDetails.id}/season/${item.season_number}/episode/${item.episode_number}`,
            description: handleDescription(item),
            pubDate: item.air_date ? parseDate(item.air_date) : undefined,
        })),
    };
};

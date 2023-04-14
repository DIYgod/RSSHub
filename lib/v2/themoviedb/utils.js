const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

const handleDescription = (item) =>
    art(path.join(__dirname, 'templates/description.art'), {
        poster: `https://image.tmdb.org/t/p/original${item.poster_path ?? item.still_path}`,
        description: item.overview.trim(),
        vote_average: item.vote_average,
        vote_count: item.vote_count,
    });

const handleMovieItem = (item, lang) => ({
    title: lang ? item.title : item.original_title,
    link: `https://www.themoviedb.org/movie/${item.id}`,
    description: handleDescription(item),
    pubDate: parseDate(item.release_date),
});

const handleTVShowItem = (item, lang) => ({
    title: lang ? item.name : item.original_name,
    link: `https://www.themoviedb.org/tv/${item.id}`,
    description: handleDescription(item),
    pubDate: parseDate(item.first_air_date),
});

const MEDIA_TYPE_TO_ITEM_HANDLE = {
    tv: handleTVShowItem,
    movie: handleMovieItem,
};

module.exports = { handleDescription, handleMovieItem, handleTVShowItem, MEDIA_TYPE_TO_ITEM_HANDLE };

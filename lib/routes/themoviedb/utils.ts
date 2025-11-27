import path from 'node:path';

import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

const handleDescription = (item) => {
    const poster_path = item.poster_path ?? item.still_path;
    return art(path.join(__dirname, 'templates/description.art'), {
        poster: poster_path ? `https://image.tmdb.org/t/p/original${poster_path}` : null,
        description: item.overview.trim(),
        vote_average: item.vote_average,
        vote_count: item.vote_count,
    });
};

const handleMovieItem = (item, lang) => ({
    title: lang ? item.title : item.original_title,
    link: `https://www.themoviedb.org/movie/${item.id}`,
    description: handleDescription(item),
    pubDate: item.release_date ? parseDate(item.release_date) : undefined,
});

const handleTVShowItem = (item, lang) => ({
    title: lang ? item.name : item.original_name,
    link: `https://www.themoviedb.org/tv/${item.id}`,
    description: handleDescription(item),
    pubDate: item.first_air_date ? parseDate(item.first_air_date) : undefined,
});

const MEDIA_TYPE_TO_ITEM_HANDLE = {
    tv: handleTVShowItem,
    movie: handleMovieItem,
};

export { handleDescription, handleMovieItem, handleTVShowItem, MEDIA_TYPE_TO_ITEM_HANDLE };

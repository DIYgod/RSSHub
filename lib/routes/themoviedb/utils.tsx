import { renderToString } from 'hono/jsx/dom/server';

import { parseDate } from '@/utils/parse-date';

const handleDescription = (item) => {
    const posterPath = item.poster_path ?? item.still_path;
    const poster = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : undefined;
    const description = item.overview.trim();
    return renderToString(
        <>
            {poster ? <img src={poster} /> : null}
            <p>
                User Score: {item.vote_average}
                <br />
                Vote Count: {item.vote_count}
            </p>
            <p>{description}</p>
        </>
    );
};

const handleMovieItem = (item, lang) => ({
    title: lang ? item.title : item.original_title,
    link: `https://www.themoviedb.org/movie/${item.id}`,
    description: handleDescription(item),
    pubDate: item.release_date ? parseDate(`${item.release_date}T00:00:00Z`) : undefined,
});

const handleTVShowItem = (item, lang) => ({
    title: lang ? item.name : item.original_name,
    link: `https://www.themoviedb.org/tv/${item.id}`,
    description: handleDescription(item),
    pubDate: item.first_air_date ? parseDate(`${item.first_air_date}T00:00:00Z`) : undefined,
});

const MEDIA_TYPE_TO_ITEM_HANDLE = {
    tv: handleTVShowItem,
    movie: handleMovieItem,
};

export { handleDescription, handleMovieItem, MEDIA_TYPE_TO_ITEM_HANDLE };

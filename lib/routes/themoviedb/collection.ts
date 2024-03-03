// @ts-nocheck
import got from '@/utils/got';
const apiKey = require('./api-key');
const { handleMovieItem } = require('./utils');

export default async (ctx) => {
    const { id, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/collection/${id}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    ctx.set('data', {
        title: `${data.name} — TMDB`,
        description: data.overview.trim(),
        image: `https://image.tmdb.org/t/p/original${data.poster_path}`,
        link: `https://www.themoviedb.org/collection/${data.id}`,
        item: data.parts.map((item) => handleMovieItem(item, lang)),
    });
};

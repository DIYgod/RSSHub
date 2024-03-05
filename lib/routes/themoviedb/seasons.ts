// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const apiKey = require('./api-key');
const { handleDescription } = require('./utils');

export default async (ctx) => {
    const { id, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/tv/${id}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    ctx.set('data', {
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
    });
};

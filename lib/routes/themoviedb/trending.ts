// @ts-nocheck
import got from '@/utils/got';
const apiKey = require('./api-key');
const { MEDIA_TYPE_TO_ITEM_HANDLE } = require('./utils');

const MEDIA_TYPE_TO_TITLE = {
    tv: 'TV Shows',
    movie: 'Movies',
};

export default async (ctx) => {
    const { mediaType, timeWindow, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    ctx.set('data', {
        title: `Popular ${MEDIA_TYPE_TO_TITLE[mediaType]} — TMDB`,
        link: `https://www.themoviedb.org/${mediaType}`,
        item: data.results.map((item) => MEDIA_TYPE_TO_ITEM_HANDLE[mediaType](item, lang)),
    });
};

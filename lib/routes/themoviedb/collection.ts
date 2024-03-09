import { Route } from '@/types';
import got from '@/utils/got';
import apiKey from './api-key';
import { handleMovieItem } from './utils';

export const route: Route = {
    path: '/collection/:id/:lang?',
    categories: ['multimedia'],
    example: '/themoviedb/collection/131292/en-US',
    parameters: { id: 'Collection ID', lang: 'Language' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Collection',
    maintainers: ['x2cf'],
    handler,
};

async function handler(ctx) {
    const { id, lang } = ctx.req.param();
    const { data } = await got(`https://api.themoviedb.org/3/collection/${id}`, {
        searchParams: {
            language: lang,
            api_key: apiKey(),
        },
    });

    return {
        title: `${data.name} — TMDB`,
        description: data.overview.trim(),
        image: `https://image.tmdb.org/t/p/original${data.poster_path}`,
        link: `https://www.themoviedb.org/collection/${data.id}`,
        item: data.parts.map((item) => handleMovieItem(item, lang)),
    };
}

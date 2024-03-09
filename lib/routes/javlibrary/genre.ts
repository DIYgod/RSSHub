import cache from '@/utils/cache';
import { defaultMode, defaultGenre, defaultLanguage, rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const mode = ctx.req.param('mode') ?? defaultMode;
    const genre = ctx.req.param('genre') ?? defaultGenre;
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/vl_genre.php?list&g=${genre}&mode=${mode}`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};

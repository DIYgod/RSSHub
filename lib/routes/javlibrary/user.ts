import cache from '@/utils/cache';
import { defaultLanguage, rootUrl, ProcessItems } from './utils';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const type = ctx.req.param('type');
    const language = ctx.req.param('language') ?? defaultLanguage;
    const currentUrl = `${rootUrl}/${language}/${type}.php?list&u=${id}`;

    ctx.set('data', await ProcessItems(language, currentUrl, cache.tryGet));
};

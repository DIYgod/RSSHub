import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { baseUrl, getResearch } from './utils';

export const route: Route = {
    path: '/expert/:expert{.+}?',
    example: '/carnegieendowment/expert/china/people/michael-pettis',
    name: 'Expert research',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    parameters: { expert: 'Expert profile path from the website URL, defaults to china/people/michael-pettis.' },
    description: 'Carnegie articles include their full text; external publications include the source-provided excerpt.',
    radar: [{ source: ['carnegieendowment.org/:center/people/:expert'], target: '/expert/:center/people/:expert' }],
    handler,
};

async function handler(ctx) {
    const expert = ctx.req.param('expert') ?? 'china/people/michael-pettis';
    const link = `${baseUrl}/${expert}`;
    const response = await ofetch(link);
    const $ = load(response);
    const name = $('h1').text();
    if (!name) {
        throw new InvalidParameterError('Use the complete Carnegie expert profile path, for example china/people/michael-pettis.');
    }
    return { title: `Carnegie - ${name}`, link, language: 'en' as const, item: await getResearch(`contributors.title:=${JSON.stringify(name)}`, Number(ctx.req.query('limit')) || 20) };
}

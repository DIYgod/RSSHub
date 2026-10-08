import type { Route } from '@/types';

import { baseUrl, getResearch } from './utils';

export const route: Route = {
    path: '/region/:region?',
    example: '/carnegieendowment/region/china',
    name: 'Regional research',
    categories: ['finance'],
    maintainers: ['DIYgod'],
    parameters: { region: 'Region slug from the website URL, defaults to china.' },
    description: 'Includes research, commentary, and media appearances listed by the website. Carnegie articles include their full text; external publications include the source-provided excerpt.',
    radar: [{ source: ['carnegieendowment.org/regions/:region'], target: '/region/:region' }],
    handler,
};

async function handler(ctx) {
    const region = ctx.req.param('region') ?? 'china';
    return {
        title: `Carnegie - ${region}`,
        link: `${baseUrl}/regions/${encodeURIComponent(region)}`,
        language: 'en' as const,
        item: await getResearch(`regions.slug:=${JSON.stringify(region)}`, Number(ctx.req.query('limit')) || 20),
    };
}

import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/status/:id',
    example: '/testflight/status/tLcYLZJV',
    name: 'Beta availability',
    categories: ['program-update'],
    maintainers: ['DIYgod'],
    parameters: { id: 'Public invitation ID from https://testflight.apple.com/join/ID.' },
    radar: [{ source: ['testflight.apple.com/join/:id'], target: '/status/:id' }],
    description: 'Reports the current public beta availability. The item GUID changes when the status changes. Apple does not expose the exact number of remaining slots.',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    if (!/^[a-z0-9]{8}$/i.test(id)) {
        throw new InvalidParameterError('Use the eight-character public TestFlight invitation ID.');
    }
    const link = `https://testflight.apple.com/join/${id}`;
    const response = await ofetch(link);
    const $ = load(response);
    const app = $('meta[property="og:title"]').attr('content');
    const status = $('.beta-status span').text();
    if (!app || !status) {
        throw new Error('The TestFlight invitation is unavailable or its public status cannot be found.');
    }
    return {
        title: app,
        link,
        language: 'en' as const,
        item: [{ title: `${app}: ${status}`, link, guid: `${link}#${encodeURIComponent(status)}`, description: $('.beta-status').html() }],
    };
}

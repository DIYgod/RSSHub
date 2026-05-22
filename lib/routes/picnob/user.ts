import type { Route } from '@/types';
import { ViewType } from '@/types';

export const route: Route = {
    path: '/user/:id/:type?',
    categories: ['social-media'],
    example: '/picnob/user/xlisa_olivex',
    parameters: {
        id: 'Instagram id',
        type: 'Type of profile page (profile or tagged)',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.pixnoy.com/profile/:id'],
            target: '/user/:id',
        },
        {
            source: ['www.pixnoy.com/profile/:id/tagged'],
            target: '/user/:id/tagged',
        },
    ],
    name: 'User Profile - Pixnoy',
    maintainers: ['TonyRL', 'micheal-death', 'AiraNadih', 'DIYgod', 'hyoban', 'Rongronggg9'],
    handler,
    view: ViewType.Pictures,
};

function handler(ctx) {
    const id = ctx.req.param('id');
    return ctx.set('redirect', `/picnob.info/user/${id}`);
}
